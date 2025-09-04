import UserSubscription from "../models/userSubscriptionModel.js";
import Subscription from "../models/Subscription.js";

// Subscribe user to a plan
export const subscribeUser = async (req, res) => {
  try {
    const { planId } = req.params; 
    const { userId } = req.body; // frontend must send userId

    // check if plan exists
    const plan = await Subscription.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // calculate end date
    const startDate = new Date();
    let endDate = new Date(startDate);

    if (plan.duration === "month") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.duration === "year") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      // fallback: 30 days
      endDate.setDate(endDate.getDate() + 30);
    }

    const subscription = new UserSubscription({
      user: userId,
      plan: planId,
      startDate,
      endDate,
      status: "active",
    });

    await subscription.save();
    res.status(201).json({ message: "Subscribed successfully", subscription });
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin: Get all subscriptions
export const getAllUserSubscriptions = async (req, res) => {
  try {
    const subs = await UserSubscription.find()
      .populate("user", "name email")
      .populate("plan", "name price duration type");

    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching subscriptions", error: err.message });
  }
};

// User: Get my subscriptions
export const getMySubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;
    const subs = await UserSubscription.find({ user: userId })
      .populate("plan", "name price duration type");

    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching subscriptions", error: err.message });
  }
};
