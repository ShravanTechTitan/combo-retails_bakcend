import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  orderId: String,
  paymentId: String,
  signature: String,
  amount: Number,
  date: { type: Date, default: Date.now },
});

const userSubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ["active", "expired", "inactive"], default: "active" },

  // ✅ Multiple payments tracking
  payments: [paymentSchema],
}, { timestamps: true });

// Check if model already exists to prevent overwrite errors during hot reload
export default mongoose.models.UserSubscription || mongoose.model("UserSubscription", userSubscriptionSchema);
