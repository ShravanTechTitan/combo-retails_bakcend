import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: {
    type: String,
    enum: ["perMonth", "sixMonths", "perYear", "eighteenMonths", "sevenDays", "trial24Hours"],
    default: "perMonth",
    required: true,
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Check if model already exists to prevent overwrite errors during hot reload
export default mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
