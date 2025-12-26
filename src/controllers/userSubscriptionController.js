import UserSubscription from "../models/userSubscriptionModel.js";
import Subscription from "../models/Subscription.js";
import crypto from "crypto";

// 🔹 Utility function: calculate end date
const calculateEndDate = (fromDate, duration) => {
  const date = new Date(fromDate);

  switch (duration) {
    case "sevenDays":
      date.setDate(date.getDate() + 7); // 7 days
      break;
    case "trial24Hours":
      date.setHours(date.getHours() + 24); // 24 hours
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
      date.setMonth(date.getMonth() + 1); // fallback
  }

  return date;
};

// 🔹 Subscribe user
export const subscribeUser = async (req, res) => {
  try {
    const { planId, payment } = req.body; 
    // payment = { razorpay_order_id, razorpay_payment_id, razorpay_signature }

    // 1️⃣ Verify payment first
    const body = payment.razorpay_order_id + "|" + payment.razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== payment.razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // 2️⃣ Proceed with subscription activation
    const plan = await Subscription.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const today = new Date();
    let existingSub = await UserSubscription.findOne({
      user: req.body.userId,
      plan: planId,
      status: "active",
      endDate: { $gte: today },
    });

    let endDate = existingSub
      ? calculateEndDate(existingSub.endDate, plan.duration)
      : calculateEndDate(today, plan.duration);

    if (existingSub) {
      existingSub.endDate = endDate;
      existingSub.payments.push({
        orderId: payment.razorpay_order_id,
        paymentId: payment.razorpay_payment_id,
        signature: payment.razorpay_signature,
        amount: plan.price,
      });
      await existingSub.save();
      return res.status(200).json({ message: "Subscription extended", subscription: existingSub });
    }

    const newSub = new UserSubscription({
      user: req.body.userId,
      plan: planId,
      startDate: today,
      endDate,
      status: "active",
      payments: [{
        orderId: payment.razorpay_order_id,
        paymentId: payment.razorpay_payment_id,
        signature: payment.razorpay_signature,
        amount: plan.price,
      }],
    });
    await newSub.save();

    res.status(201).json({ message: "Subscription created", subscription: newSub });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// 🔹 Admin: Get all user subscriptions
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

// 🔹 User: Get my subscriptions
export const getMySubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Saare subs lao with latest first
    const subs = await UserSubscription.find({ user: userId })
      .populate("plan", "name price duration type")
      .sort({ createdAt: -1 }); // newest first

    // active subscription filter
    const activeSub = subs.find((s) => s.status === "active");

    res.json({
      activeSubscription: activeSub || null,
      subscriptions: subs,
    });
  } catch (err) {
    console.error("Get my subs error:", err);
    res.status(500).json({
      message: "Error fetching subscriptions",
      error: err.message,
    });
  }
};


// 🔹 Delete a user subscription
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

// 🔹 Toggle status
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
