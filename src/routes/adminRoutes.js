// routes/adminRoutes.js
import express from "express";
import { verifyAuth, verifyRole } from "../middleware/auth.js";
import {
  getAllUsers,
  updateUserRole,
  activateUserSubscription,
} from "../controllers/adminController.js";

const router = express.Router();

// ✅ Superadmin only
router.get("/users", verifyAuth, verifyRole(["superadmin"]), getAllUsers);
router.put("/role/:id", verifyAuth, verifyRole(["superadmin"]), updateUserRole);

// ✅ Admin & Superadmin (both can activate subscription)
router.put(
  "/subscription/:id",
  verifyAuth,
  verifyRole(["admin", "superadmin"]),
  activateUserSubscription
);

export default router;
