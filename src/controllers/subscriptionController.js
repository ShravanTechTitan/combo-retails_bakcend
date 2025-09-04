import Subscription from "../models/Subscription.js";

// GET all subscriptions
export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().sort({ createdAt: -1 });
    res.status(200).json(subscriptions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching subscriptions", error: err });
  }
};

// CREATE a new subscription
export const createSubscription = async (req, res) => {
  try {
    const { name, price, duration, active } = req.body;
    const newSub = new Subscription({
      name,
      price,
      duration,
      active: active ?? true,
    });
    const savedSub = await newSub.save();
    res.status(201).json(savedSub);
  } catch (err) {
    res.status(500).json({ message: "Error creating subscription", error: err });
  }
};

// UPDATE a subscription
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
    res.status(500).json({ message: "Error updating subscription", error: err });
  }
};

// DELETE a subscription
export const deleteSubscription = async (req, res) => {
  try {
    const deletedSub = await Subscription.findByIdAndDelete(req.params.id);
    if (!deletedSub) return res.status(404).json({ message: "Subscription not found" });
    res.status(200).json({ message: "Subscription deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting subscription", error: err });
  }
};
