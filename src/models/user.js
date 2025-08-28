// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  number:Number,
  email: { type: String, unique: true },
  password: String, // hashed
  subscriptionActive: { type: Boolean, default: false },
  subscriptionExpiry: Date,
});

export default mongoose.model("User", userSchema);
