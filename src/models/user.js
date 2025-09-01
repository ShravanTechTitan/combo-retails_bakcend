import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    number: { type: Number }, // optional
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed password

    // Role system
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user", // new users always "user"
    },

    // Subscription system
    subscriptionActive: { type: Boolean, default: false },
    subscriptionExpiry: { type: Date }, // null until activated
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
