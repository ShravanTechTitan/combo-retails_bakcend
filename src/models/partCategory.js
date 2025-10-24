import mongoose from "mongoose";

const partCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: false },
  note:{type:String}
}, { timestamps: true });



export default mongoose.model("PartCategory", partCategorySchema);