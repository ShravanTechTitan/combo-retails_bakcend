// routes/invoiceRoutes.js
import express from "express";
import { verifyAuth } from "../middleware/auth.js";
import { generateInvoice } from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/:subscriptionId/:paymentIndex", verifyAuth, generateInvoice);

export default router;

