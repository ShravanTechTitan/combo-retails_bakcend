import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: Number,
  
  image: String,
  partCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "PartCategory" },
  brandIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
  modelIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Model" }],
  isTrending: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);