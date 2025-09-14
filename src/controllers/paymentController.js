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
        case "testing":
          date.setMinutes(date.getMinutes() + 30);
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
      await existingSub.save();
      return res.status(200).json({ message: "Subscription extended", subscription: existingSub });
    }

    const newSub = new UserSubscription({
      user: userId,
      plan: planId,
      startDate: today,
      endDate,
      status: "active",
    });

    await newSub.save();
    res.status(201).json({ message: "Subscription activated", subscription: newSub });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
