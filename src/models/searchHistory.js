import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for anonymous users
    },
    query: {
      type: String,
      required: true,
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    clicked: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for faster queries
searchHistorySchema.index({ query: "text" });
searchHistorySchema.index({ createdAt: -1 });
searchHistorySchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.SearchHistory || mongoose.model("SearchHistory", searchHistorySchema);

