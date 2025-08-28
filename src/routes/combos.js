// routes/combos.js
import express from "express";
import Combo from "../models/combo.js";
import User from "../models/user.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get single combo with subscription check
router.get("/:id", verifyToken, async (req, res) => {
  const combo = await Combo.findById(req.params.id);
  const user = await User.findById(req.user.id);

  if (!combo) return res.status(404).json({ message: "Combo not found" });

  if (user.subscriptionActive && user.subscriptionExpiry > new Date()) {
    // Subscription valid → send full data
    return res.json(combo);
  } else {
    // No subscription → send locked data
    return res.json({
      id: combo._id,
      name: combo.name,
      locked: true,
      message: "Subscribe for ₹29 to unlock models."
    });
  }
});

export default router;
