import mongoose from "mongoose";

const deviceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  note:{type:String}
}, { timestamps: true });



export default mongoose.model("DeviceCategory", deviceCategorySchema);