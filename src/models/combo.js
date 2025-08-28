// models/Combo.js
import mongoose from "mongoose";

const comboSchema = new mongoose.Schema({
  name: String,
  price: String,
  duration: String,
  models: [String]
});

export default mongoose.model("Combo", comboSchema);
