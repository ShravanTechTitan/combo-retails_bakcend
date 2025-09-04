import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    number: { type: Number },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },

    // Quick subscription tracking
    subscriptionActive: { type: Boolean, default: false },
    subscriptionExpiry: { type: Date },
    currentPlan: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
