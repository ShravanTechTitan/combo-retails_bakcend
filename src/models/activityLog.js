import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "login",
        "logout",
        "register",
        "subscribe",
        "view_product",
        "search",
        "update_profile",
        "change_password",
      ],
    },
    details: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  { timestamps: true }
);

// Check if model already exists to prevent overwrite errors during hot reload
export default mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema);

