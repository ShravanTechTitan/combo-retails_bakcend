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

// Check if model already exists to prevent overwrite errors during hot reload
export default mongoose.models.User || mongoose.model("User", userSchema);
