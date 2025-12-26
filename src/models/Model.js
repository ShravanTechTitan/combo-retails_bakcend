import mongoose from "mongoose";

const modelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  series: { type: String},
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
  extraInfo: {
    displayCount: Number,
    supportedModels: Number,
  }
}, { timestamps: true });

// Check if model already exists to prevent overwrite errors during hot reload
export default mongoose.models.Model || mongoose.model("Model", modelSchema);