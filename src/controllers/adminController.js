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
