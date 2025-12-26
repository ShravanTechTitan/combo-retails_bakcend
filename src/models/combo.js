// models/Combo.js
import mongoose from "mongoose";

const comboSchema = new mongoose.Schema({
  name: String,
  price: String,
  duration: String,
  models: [String]
});

// Check if model already exists to prevent overwrite errors during hot reload
export default mongoose.models.Combo || mongoose.model("Combo", comboSchema);
