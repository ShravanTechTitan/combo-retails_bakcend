// controllers/notificationController.js
import Notification from "../models/notification.js";

// Create notification
export const createNotification = async (userId, title, message, type = "info", link = null) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
    });
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, unreadOnly = false } = req.query;
    
    const query = { user: userId };
    if (unreadOnly === "true") {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    const unreadCount = await Notification.countDocuments({ user: userId, read: false });
    
    res.json({
      notifications,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    });
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );
    
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Send notification to user(s)
export const sendNotificationToUsers = async (req, res) => {
  try {
    const { userIds, title, message, type = "info", link } = req.body;
    const sentBy = req.user._id; // Admin who is sending
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "User IDs array is required" });
    }
    
    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }
    
    // Create notifications for all specified users
    const notifications = userIds.map(userId => ({
      user: userId,
      title,
      message,
      type,
      link: link || null,
      sentBy, // Track who sent it
    }));
    
    const createdNotifications = await Notification.insertMany(notifications);
    
    res.json({
      success: true,
      message: `Notifications sent to ${createdNotifications.length} user(s)`,
      count: createdNotifications.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Send notification to all users
export const sendNotificationToAllUsers = async (req, res) => {
  try {
    const { title, message, type = "info", link } = req.body;
    const sentBy = req.user._id; // Admin who is sending
    
    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }
    
    // Get all users
    const User = (await import("../models/user.js")).default;
    const users = await User.find().select("_id");
    
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    
    // Create notifications for all users
    const notifications = users.map(user => ({
      user: user._id,
      title,
      message,
      type,
      link: link || null,
      sentBy, // Track who sent it
    }));
    
    const createdNotifications = await Notification.insertMany(notifications);
    
    res.json({
      success: true,
      message: `Notifications sent to all ${createdNotifications.length} users`,
      count: createdNotifications.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all sent notifications (history)
export const getAllSentNotifications = async (req, res) => {
  try {
    // Get all notifications sent by admins, group by title, message, type, link, sentBy, and createdAt (within same minute)
    const allNotifications = await Notification.find({ sentBy: { $exists: true, $ne: null } })
      .populate("user", "name email")
      .populate("sentBy", "name email")
      .sort({ createdAt: -1 });
    
    // Group notifications by title, message, type, link, sentBy, and createdAt (within same minute)
    const grouped = {};
    allNotifications.forEach(notif => {
      // Create a key based on notification content and time (rounded to minute)
      const timeKey = new Date(notif.createdAt).toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
      const key = `${notif.title}|${notif.message}|${notif.type}|${notif.link || ''}|${notif.sentBy?._id}|${timeKey}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          _id: notif._id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          link: notif.link,
          sentBy: notif.sentBy,
          createdAt: notif.createdAt,
          recipients: [],
          totalRecipients: 0,
        };
      }
      
      if (notif.user) {
        // Avoid duplicate recipients
        const exists = grouped[key].recipients.some(r => r._id.toString() === notif.user._id.toString());
        if (!exists) {
          grouped[key].recipients.push({
            _id: notif.user._id,
            name: notif.user.name,
            email: notif.user.email,
          });
          grouped[key].totalRecipients++;
        }
      }
    });
    
    // Convert to array and sort by createdAt
    const groupedArray = Object.values(grouped).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedNotifications = groupedArray.slice(skip, skip + parseInt(limit));
    
    res.json({
      notifications: paginatedNotifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: groupedArray.length,
        totalPages: Math.ceil(groupedArray.length / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

