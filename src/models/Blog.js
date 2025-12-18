import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // For ordering blogs on homepage
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);

