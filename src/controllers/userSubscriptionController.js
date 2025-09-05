import UserSubscription from "../models/userSubscriptionModel.js";
import Subscription from "../models/Subscription.js";

// ✅ Subscribe user to a plan
export const subscribeUser = async (req, res) => {
  try {
    const { planId } = req.params;
    const { userId } = req.body;

    const plan = await Subscription.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const today = new Date();

    // Check for existing active subscription
    let existingSub = await UserSubscription.findOne({
      user: userId,
      plan: planId,
      status: "active",
      endDate: { $gte: today },
    });

    let startDate = today;
    let endDate;

    const calculateEndDate = (fromDate, duration) => {
      let date = new Date(fromDate);
      switch (duration) {
        case "testing":
          date.setMinutes(date.getMonth()+1);
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
          date.setMonth(date.getMonth() + 1);
      }
      return date;
    };

    if (existingSub) {
      // Extend subscription from existing endDate
      endDate = calculateEndDate(existingSub.endDate, plan.duration);
      existingSub.endDate = endDate;
      await existingSub.save();

      return res.status(200).json({
        message: "Subscription extended successfully",
        subscription: existingSub,
      });
    } else {
      // Create new subscription
      endDate = calculateEndDate(startDate, plan.duration);

      const newSub = new UserSubscription({
        user: userId,
        plan: planId,
        startDate,
        endDate,
        status: "active",
      });

      await newSub.save();

      return res.status(201).json({
        message: "New subscription created successfully",
        subscription: newSub,
      });
    }
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// ✅ Admin: Get only ACTIVE subscriptions
export const getAllUserSubscriptionsWithStatus = async (req, res) => {
  try {
    // Fetch all subscriptions with user + plan info
    const subs = await UserSubscription.find()
      .populate("user", "name email")
      .populate("plan", "name price duration type")
      .sort({ createdAt: -1 });

    const today = new Date();

    // Map and classify each subscription
    const data = subs.map((sub) => {
      let statusLabel = sub.status; // active/inactive
      let daysRemaining = null;

      if (sub.endDate) {
        const diffTime = new Date(sub.endDate) - today;
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // mark as expired if endDate passed
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
    console.error(err);
    res.status(500).json({
      message: "Error fetching all subscriptions",
      error: err.message,
    });
  }
};

// ✅ User: Get my subscriptions (all, active + expired)
export const getMySubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;
    const subs = await UserSubscription.find({ user: userId })
      .populate("plan", "name price duration type");

    res.json(subs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching subscriptions", error: err.message });
  }
};

// ✅ Delete a subscription (Admin use)
export const deleteUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await UserSubscription.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json({ message: "Subscription deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting subscription", error: err.message });
  }
};

// Toggle subscription active status
export const toggleSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const sub = await UserSubscription.findById(id);
    if (!sub) return res.status(404).json({ message: "Subscription not found" });

    sub.status = sub.status === "active" ? "inactive" : "active";
    await sub.save();

    res.status(200).json({ message: "Status updated", subscription: sub });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

