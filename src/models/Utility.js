import mongoose from "mongoose";

const utilitySchema = new mongoose.Schema({
  name: String,
  type: String,   // calculator, converter, etc
  formula: String // optional for configs
}, { timestamps: true });

// Check if model already exists to prevent overwrite errors during hot reload
export default mongoose.models.Utility || mongoose.model("Utility", utilitySchema);