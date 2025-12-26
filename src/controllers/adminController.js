// controllers/adminController.js
import User from "../models/user.js";
import UserSubscription from "../models/userSubscriptionModel.js";

// 🟢 Superadmin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // hide password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Admin & Superadmin: Get total subscription revenue
export const getTotalRevenue = async (req, res) => {
  try {
    // Get all subscriptions with payments and plan details
    const subscriptions = await UserSubscription.find().populate("plan", "name price duration");
    
    // Calculate total from all payments (excluding trial plan - ₹0 payments)
    let totalAmount = 0;
    let totalPayments = 0;
    
    subscriptions.forEach((sub) => {
      if (sub.payments && sub.payments.length > 0) {
        sub.payments.forEach((payment) => {
          // Exclude trial plan (₹0 payments) from revenue
          if (payment.amount && payment.amount > 0) {
            totalAmount += payment.amount;
            totalPayments += 1;
          }
        });
      }
    });
    
    res.json({
      totalRevenue: totalAmount,
      totalPayments: totalPayments,
      totalSubscriptions: subscriptions.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Admin & Superadmin: Get trial plan users count
export const getTrialUsersCount = async (req, res) => {
  try {
    // Find all subscriptions with trial24Hours plan
    const trialSubscriptions = await UserSubscription.find()
      .populate("plan", "duration")
      .populate("user", "name email");
    
    // Filter subscriptions with trial24Hours duration
    const trialUsers = trialSubscriptions.filter(
      (sub) => sub.plan && sub.plan.duration === "trial24Hours"
    );
    
    // Get unique users (a user might have multiple trial subscriptions)
    const uniqueTrialUsers = new Set();
    trialUsers.forEach((sub) => {
      if (sub.user && sub.user._id) {
        uniqueTrialUsers.add(sub.user._id.toString());
      }
    });
    
    res.json({
      trialUsersCount: uniqueTrialUsers.size,
      totalTrialSubscriptions: trialUsers.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Superadmin: Change role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body; // "user" | "admin"
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Admin & Superadmin: Activate Subscription
export const activateUserSubscription = async (req, res) => {
  try {
    const { days } = req.body; // number of days for subscription
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        subscriptionActive: true,
        subscriptionExpiry: expiryDate,
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Admin & Superadmin: Get Analytics Data
export const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if no date range provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Revenue by date
    const subscriptions = await UserSubscription.find({
      createdAt: { $gte: start, $lte: end }
    }).populate("plan", "name price duration");
    
    // Group revenue by date
    const revenueByDate = {};
    subscriptions.forEach((sub) => {
      if (sub.payments && sub.payments.length > 0) {
        sub.payments.forEach((payment) => {
          if (payment.amount && payment.amount > 0) {
            const date = new Date(payment.date || sub.createdAt).toISOString().split('T')[0];
            revenueByDate[date] = (revenueByDate[date] || 0) + payment.amount;
          }
        });
      }
    });
    
    // User growth by date
    const users = await User.find({
      createdAt: { $gte: start, $lte: end }
    });
    
    const userGrowthByDate = {};
    users.forEach((user) => {
      const date = new Date(user.createdAt).toISOString().split('T')[0];
      userGrowthByDate[date] = (userGrowthByDate[date] || 0) + 1;
    });
    
    // Plan popularity
    const planStats = {};
    subscriptions.forEach((sub) => {
      if (sub.plan) {
        const planName = sub.plan.name || sub.plan.duration;
        planStats[planName] = (planStats[planName] || 0) + 1;
      }
    });
    
    // Subscription conversion (trial to paid)
    const allSubs = await UserSubscription.find().populate("plan", "duration").populate("user", "_id");
    const trialUsers = new Set();
    const paidUsers = new Set();
    
    allSubs.forEach((sub) => {
      if (sub.user && sub.user._id) {
        const userId = sub.user._id.toString();
        if (sub.plan && sub.plan.duration === "trial24Hours") {
          trialUsers.add(userId);
        } else if (sub.payments && sub.payments.some(p => p.amount > 0)) {
          paidUsers.add(userId);
        }
      }
    });
    
    const conversionRate = trialUsers.size > 0 
      ? ((paidUsers.size / trialUsers.size) * 100).toFixed(2)
      : 0;
    
    res.json({
      revenueByDate: Object.entries(revenueByDate).map(([date, amount]) => ({ date, amount })),
      userGrowthByDate: Object.entries(userGrowthByDate).map(([date, count]) => ({ date, count })),
      planStats: Object.entries(planStats).map(([plan, count]) => ({ plan, count })),
      conversionRate: parseFloat(conversionRate),
      totalTrialUsers: trialUsers.size,
      totalPaidUsers: paidUsers.size,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
