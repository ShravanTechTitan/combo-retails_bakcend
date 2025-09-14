import express from "express";
import { createOrder, verifyPaymentAndSubscribe } from "../controllers/paymentController.js";

const router = express.Router();

// Create Razorpay order
router.post("/create-order", createOrder);

// Verify payment & activate subscription
router.post("/verify", verifyPaymentAndSubscribe);

export default router;
