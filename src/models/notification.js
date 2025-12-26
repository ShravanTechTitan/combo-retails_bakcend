import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String, // Optional link to navigate
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin who sent this notification
    },
  },
  { timestamps: true }
);

// Check if model already exists to prevent overwrite errors during hot reload
export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

