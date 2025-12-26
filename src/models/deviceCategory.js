import mongoose from "mongoose";

const deviceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  note:{type:String}
}, { timestamps: true });



// Check if model already exists to prevent overwrite errors during hot reload
export default mongoose.models.DeviceCategory || mongoose.model("DeviceCategory", deviceCategorySchema);