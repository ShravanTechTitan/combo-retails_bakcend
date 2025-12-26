import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import Subscription from "../models/Subscription.js";
import UserSubscription from "../models/userSubscriptionModel.js";

// ✅ Initialize Razorpay
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are missing in env!");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// 🔹 Create Razorpay Order
export const createOrder = async (req, res) => {
  const { planId } = req.body;

  if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
    return res.status(400).json({ message: "Invalid planId" });
  }

  const plan = await Subscription.findById(planId);
  if (!plan) return res.status(404).json({ message: "Plan not found" });

  // ✅ If plan price is 0 (trial plan), return error to use free activation endpoint
  if (plan.price === 0 || plan.price < 1) {
    return res.status(400).json({ 
      message: "Free trial plan - use /payments/activate-trial endpoint",
      isFreePlan: true 
    });
  }

  try {
    const razorpay = getRazorpayInstance();

    const shortPlanId = planId.slice(-6); // last 6 chars
    const receipt = `rcpt_${shortPlanId}_${Date.now()}`.slice(0, 40);
    const order = await razorpay.orders.create({
      amount: plan.price * 100, // ₹ to paise
      currency: "INR",
      receipt,
      payment_capture: 1,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    res.status(500).json({ message: "Razorpay order creation failed", error: err.message });
  }
};
// 🔹 Verify Payment & Activate Subscription
export const verifyPaymentAndSubscribe = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, userId } = req.body;

    // 1️⃣ Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // 2️⃣ Payment verified → Activate subscription
    const plan = await Subscription.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const today = new Date();

    // Check if user has active subscription
    let existingSub = await UserSubscription.findOne({
      user: userId,
      plan: planId,
      status: "active",
      endDate: { $gte: today },
    });

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
          date.setMonth(date.getMonth() + 1);
      }
      return date;
    };

    let endDate = existingSub
      ? calculateEndDate(existingSub.endDate, plan.duration)
      : calculateEndDate(today, plan.duration);

 if (existingSub) {
  existingSub.endDate = endDate;
  existingSub.payments.push({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
    amount: plan.price,
  });
  await existingSub.save();
  return res.status(200).json({ message: "Subscription extended", subscription: existingSub });
}

const newSub = new UserSubscription({
  user: userId,
  plan: planId,
  startDate: today,
  endDate,
  status: "active",
  payments: [{
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
    amount: plan.price,
  }],
});


    await newSub.save();
    res.status(201).json({ message: "Subscription activated", subscription: newSub });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔹 Activate Free Trial (No Payment Required)
export const activateTrial = async (req, res) => {
  try {
    const { planId, userId } = req.body;

    if (!planId || !userId) {
      return res.status(400).json({ message: "Plan ID and User ID are required" });
    }

    const plan = await Subscription.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Verify it's a free plan (price = 0)
    if (plan.price > 0) {
      return res.status(400).json({ message: "This plan requires payment. Use payment gateway." });
    }

    // ✅ Check if user has already used trial plan (any trial subscription in the past)
    const existingTrialSubs = await UserSubscription.find({
      user: userId,
    }).populate("plan", "duration");

    // Check if user has ever used trial24Hours plan
    const hasUsedTrial = existingTrialSubs.some(
      (sub) => sub.plan && sub.plan.duration === "trial24Hours"
    );

    if (hasUsedTrial) {
      return res.status(400).json({ 
        message: "You have already used the free trial. Please choose a paid plan.",
        alreadyUsedTrial: true 
      });
    }

    const today = new Date();

    // Check if user already has this trial plan active
    let existingSub = await UserSubscription.findOne({
      user: userId,
      plan: planId,
      status: "active",
      endDate: { $gte: today },
    });

    const calculateEndDate = (fromDate, duration) => {
      const date = new Date(fromDate);
      switch (duration) {
        case "sevenDays":
          date.setDate(date.getDate() + 7);
          break;
        case "trial24Hours":
          date.setHours(date.getHours() + 24);
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
          date.setMonth(date.getMonth() + 1);
      }
      return date;
    };

    let endDate = existingSub
      ? calculateEndDate(existingSub.endDate, plan.duration)
      : calculateEndDate(today, plan.duration);

    if (existingSub) {
      existingSub.endDate = endDate;
      existingSub.payments.push({
        orderId: `trial_${Date.now()}`,
        paymentId: `trial_${Date.now()}`,
        signature: "trial_activation",
        amount: 0,
      });
      await existingSub.save();
      return res.status(200).json({ message: "Trial extended", subscription: existingSub });
    }

    const newSub = new UserSubscription({
      user: userId,
      plan: planId,
      startDate: today,
      endDate,
      status: "active",
      payments: [{
        orderId: `trial_${Date.now()}`,
        paymentId: `trial_${Date.now()}`,
        signature: "trial_activation",
        amount: 0,
      }],
    });

    await newSub.save();
    res.status(201).json({ message: "Trial activated successfully", subscription: newSub });
  } catch (err) {
    console.error("Trial activation error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
