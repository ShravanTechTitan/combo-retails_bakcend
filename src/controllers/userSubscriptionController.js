import UserSubscription from "../models/userSubscriptionModel.js";
import Subscription from "../models/Subscription.js";

// 🔹 Utility function to calculate endDate
const calculateEndDate = (fromDate, duration) => {
  const date = new Date(fromDate);
  switch (duration) {
    case "testing":
      date.setMinutes(date.getMinutes() + 30); // testing ke liye 30 min
      break;
    case "perMonth":
      date.setMonth(date.getMonth() + 1);
      break;
    case "sixMonths":
      date.setMonth(date.getMonth() + 6);
      break;
    case "perYear":
      date.setFullYear(date.getFullYear() + 1);
      break;
    case "eighteenMonths":
      date.setMonth(date.getMonth() + 18);
      break;
    default:
      date.setMonth(date.getMonth() + 1); // fallback: 1 month
  }
  return date;
};

// ✅ Subscribe user to a plan
export const subscribeUser = async (req, res) => {
  try {
    const { planId } = req.params;
    const { userId } = req.body;

    const plan = await Subscription.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const today = new Date();

    // check for existing active subscription
    let existingSub = await UserSubscription.findOne({
      user: userId,
      plan: planId,
      status: "active",
      endDate: { $gte: today },
    });

    let endDate;
    if (existingSub) {
      // extend subscription
      endDate = calculateEndDate(existingSub.endDate, plan.duration);
      existingSub.endDate = endDate;
      await existingSub.save();

      return res.status(200).json({
        message: "Subscription extended successfully",
        subscription: existingSub,
      });
    }

    // new subscription
    endDate = calculateEndDate(today, plan.duration);
    const newSub = new UserSubscription({
      user: userId,
      plan: planId,
      startDate: today,
      endDate,
      status: "active",
    });

    await newSub.save();
    res.status(201).json({
      message: "New subscription created successfully",
      subscription: newSub,
    });
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Admin: Get subscriptions with status
export const getAllUserSubscriptionsWithStatus = async (req, res) => {
  try {
    const subs = await UserSubscription.find()
      .populate("user", "name email")
      .populate("plan", "name price duration type")
      .sort({ createdAt: -1 });

    const today = new Date();

    const data = subs.map((sub) => {
      let statusLabel = sub.status;
      let daysRemaining = null;

      if (sub.endDate) {
        const diffTime = new Date(sub.endDate) - today;
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffTime < 0) statusLabel = "expired";
      }

      return {
        _id: sub._id,
        user: sub.user,
        plan: sub.plan,
        startDate: sub.startDate,
        endDate: sub.endDate,
        status: statusLabel,
        daysRemaining: daysRemaining >= 0 ? daysRemaining : 0,
      };
    });

    res.json(data);
  } catch (err) {
    console.error("Get subs error:", err);
    res.status(500).json({
      message: "Error fetching subscriptions",
      error: err.message,
    });
  }
};

// ✅ User: Get my subscriptions
export const getMySubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;
    const subs = await UserSubscription.find({ user: userId }).populate(
      "plan",
      "name price duration type"
    );
    res.json(subs);
  } catch (err) {
    console.error("Get my subs error:", err);
    res.status(500).json({
      message: "Error fetching subscriptions",
      error: err.message,
    });
  }
};

// ✅ Delete a subscription
export const deleteUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await UserSubscription.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Subscription not found" });

    res.json({ message: "Subscription deleted successfully" });
  } catch (err) {
    console.error("Delete sub error:", err);
    res.status(500).json({
      message: "Error deleting subscription",
      error: err.message,
    });
  }
};

// ✅ Toggle active/inactive status
export const toggleSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await UserSubscription.findById(id);
    if (!sub) return res.status(404).json({ message: "Subscription not found" });

    sub.status = sub.status === "active" ? "inactive" : "active";
    await sub.save();

    res.status(200).json({ message: "Status updated", subscription: sub });
  } catch (err) {
    console.error("Toggle status error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
