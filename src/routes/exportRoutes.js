// routes/exportRoutes.js
import express from "express";
import { verifyAuth, verifyRole } from "../middleware/auth.js";
import {
  exportUsers,
  exportSubscriptions,
  exportProducts,
  exportRevenueReport,
} from "../controllers/exportController.js";

const router = express.Router();

// All export routes require admin authentication
router.get("/users", verifyAuth, verifyRole(["admin", "superadmin"]), exportUsers);
router.get("/subscriptions", verifyAuth, verifyRole(["admin", "superadmin"]), exportSubscriptions);
router.get("/products", verifyAuth, verifyRole(["admin", "superadmin"]), exportProducts);
router.get("/revenue", verifyAuth, verifyRole(["admin", "superadmin"]), exportRevenueReport);

export default router;

