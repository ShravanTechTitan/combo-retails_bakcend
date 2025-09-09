import mongoose from "mongoose";

const partCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  note:{type:String}
}, { timestamps: true });



export default mongoose.models.PartCategory || mongoose.model("PartCategory", partCategorySchema);
