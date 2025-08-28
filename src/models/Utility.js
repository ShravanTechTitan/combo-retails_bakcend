import mongoose from "mongoose";

const utilitySchema = new mongoose.Schema({
  name: String,
  type: String,   // calculator, converter, etc
  formula: String // optional for configs
}, { timestamps: true });

export default mongoose.model("Utility", utilitySchema);