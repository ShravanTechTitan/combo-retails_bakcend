// routes/adminRoutes.js
import express from "express";
import { verifyAuth, verifyRole } from "../middleware/auth.js";
import {
  getAllUsers,
  updateUserRole,
  activateUserSubscription,
  getTotalRevenue,
} from "../controllers/adminController.js";

const router = express.Router();

// ✅ Admin & Superadmin can view users
router.get("/users", verifyAuth, verifyRole(["admin", "superadmin"]), getAllUsers);
// ✅ Only Superadmin can change roles
router.put("/role/:id", verifyAuth, verifyRole(["superadmin"]), updateUserRole);

// ✅ Admin & Superadmin (both can activate subscription)
router.put(
  "/subscription/:id",
  verifyAuth,
  verifyRole(["admin", "superadmin"]),
  activateUserSubscription
);

// ✅ Admin & Superadmin: Get total revenue
router.get("/revenue", verifyAuth, verifyRole(["admin", "superadmin"]), getTotalRevenue);

export default router;
