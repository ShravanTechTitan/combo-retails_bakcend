// controllers/activityController.js
import ActivityLog from "../models/activityLog.js";

// Log user activity
export const logActivity = async (userId, action, details = "", req = null) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      details,
      ipAddress: req?.ip || req?.headers["x-forwarded-for"] || "unknown",
      userAgent: req?.headers["user-agent"] || "unknown",
    });
  } catch (err) {
    console.error("Error logging activity:", err);
  }
};

// Get user activity logs
export const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const activities = await ActivityLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ActivityLog.countDocuments({ user: userId });

    res.json({
      activities,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all activity logs (admin only)
export const getAllActivityLogs = async (req, res) => {
  try {
    const { limit = 100, page = 1, action, userId } = req.query;

    const query = {};
    if (action) query.action = action;
    if (userId) query.user = userId;

    const activities = await ActivityLog.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ActivityLog.countDocuments(query);

    res.json({
      activities,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

