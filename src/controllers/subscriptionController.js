import Subscription from "../models/Subscription.js";
import { getCache, setCache } from "../utils/cache.js";

// 🔹 Get all subscriptions
export const getSubscriptions = async (req, res) => {
  try {
    // If admin query param is true, return all subscriptions (for admin dashboard)
    // Otherwise, only return active subscriptions (for users)
    const query = req.query.admin === "true" ? {} : { active: true };
    const cacheKey = `subscriptions_${req.query.admin || "user"}`;
    
    // Try cache first
    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
    
    const subscriptions = await Subscription.find(query).sort({ createdAt: -1 });
    
    // Cache the result
    setCache(cacheKey, subscriptions, 2 * 60 * 1000); // 2 minutes cache
    
    res.status(200).json(subscriptions);
  } catch (err) {
    console.error("Get subscriptions error:", err);
    res.status(500).json({ message: "Error fetching subscriptions", error: err.message });
  }
};

// 🔹 Create a subscription
export const createSubscription = async (req, res) => {
  try {
    const { name, price, duration, active = true } = req.body;

    const newSub = new Subscription({ name, price, duration, active });
    const savedSub = await newSub.save();

    res.status(201).json(savedSub);
  } catch (err) {
    console.error("Create subscription error:", err);
    res.status(500).json({ message: "Error creating subscription", error: err.message });
  }
};

// 🔹 Update a subscription
export const updateSubscription = async (req, res) => {
  try {
    const { name, price, duration, active } = req.body;

    const updatedSub = await Subscription.findByIdAndUpdate(
      req.params.id,
      { name, price, duration, active },
      { new: true, runValidators: true }
    );

    if (!updatedSub) return res.status(404).json({ message: "Subscription not found" });

    res.status(200).json(updatedSub);
  } catch (err) {
    console.error("Update subscription error:", err);
    res.status(500).json({ message: "Error updating subscription", error: err.message });
  }
};

// 🔹 Delete a subscription
export const deleteSubscription = async (req, res) => {
  try {
    const deletedSub = await Subscription.findByIdAndDelete(req.params.id);

    if (!deletedSub) return res.status(404).json({ message: "Subscription not found" });

    res.status(200).json({ message: "Subscription deleted successfully" });
  } catch (err) {
    console.error("Delete subscription error:", err);
    res.status(500).json({ message: "Error deleting subscription", error: err.message });
  }
};
