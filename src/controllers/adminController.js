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
    // Get all subscriptions with payments
    const subscriptions = await UserSubscription.find().populate("plan", "name price");
    
    // Calculate total from all payments
    let totalAmount = 0;
    let totalPayments = 0;
    
    subscriptions.forEach((sub) => {
      if (sub.payments && sub.payments.length > 0) {
        sub.payments.forEach((payment) => {
          if (payment.amount) {
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
