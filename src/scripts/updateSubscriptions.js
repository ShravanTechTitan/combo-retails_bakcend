// Script to update subscription plans
// Run this once: node src/scripts/updateSubscriptions.js

import mongoose from "mongoose";
import Subscription from "../models/Subscription.js";
import dotenv from "dotenv";

dotenv.config();

const updateSubscriptions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ✅");

    // 1. Update "testing" plan to "7 Days Plan" with duration "sevenDays"
    const testingPlan = await Subscription.findOne({ duration: "testing" });
    if (testingPlan) {
      testingPlan.name = "7 Days Plan";
      testingPlan.duration = "sevenDays";
      await testingPlan.save();
      console.log("✅ Updated testing plan to '7 Days Plan'");
    } else {
      console.log("⚠️  No 'testing' plan found to update");
    }

    // 2. Check if 24 hours trial plan already exists
    const existingTrial = await Subscription.findOne({ duration: "trial24Hours" });
    if (!existingTrial) {
      // Create new 24 hours trial plan
      const trialPlan = new Subscription({
        name: "24 Hours Trial",
        price: 0, // Free trial
        duration: "trial24Hours",
        active: true,
      });
      await trialPlan.save();
      console.log("✅ Created '24 Hours Trial' plan");
    } else {
      console.log("⚠️  '24 Hours Trial' plan already exists");
    }

    // Display all subscriptions
    const allSubs = await Subscription.find();
    console.log("\n📋 All Subscriptions:");
    allSubs.forEach((sub) => {
      console.log(`  - ${sub.name} (${sub.duration}) - ₹${sub.price}`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Script completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

updateSubscriptions();

