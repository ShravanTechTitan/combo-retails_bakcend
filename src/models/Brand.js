import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String},
  deviceCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "DeviceCategory" },
}, { timestamps: true });

export default mongoose.model("Brand", brandSchema);