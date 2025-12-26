import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String},
  deviceCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "DeviceCategory" },
}, { timestamps: true });

// Check if model already exists to prevent overwrite errors during hot reload
export default mongoose.models.Brand || mongoose.model("Brand", brandSchema);