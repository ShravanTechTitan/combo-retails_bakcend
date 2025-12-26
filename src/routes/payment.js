import express from "express";
import { createOrder, verifyPaymentAndSubscribe, activateTrial } from "../controllers/paymentController.js";

const router = express.Router();

// Create Razorpay order
router.post("/create-order", createOrder);

// Verify payment & activate subscription
router.post("/verify", verifyPaymentAndSubscribe);

// Activate free trial (no payment required)
router.post("/activate-trial", activateTrial);

export default router;
