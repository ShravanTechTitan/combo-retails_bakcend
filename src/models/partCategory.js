import mongoose from "mongoose";

const partCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: false },
  note:{type:String}
}, { timestamps: true });



// Check if model already exists to prevent overwrite errors during hot reload
export default mongoose.models.PartCategory || mongoose.model("PartCategory", partCategorySchema);