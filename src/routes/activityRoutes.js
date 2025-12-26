// routes/activityRoutes.js
import express from "express";
import { verifyAuth, verifyRole } from "../middleware/auth.js";
import { getUserActivity, getAllActivityLogs } from "../controllers/activityController.js";

const router = express.Router();

// Get user's own activity
router.get("/user/:userId", verifyAuth, getUserActivity);

// Get all activity logs (admin only)
router.get("/", verifyAuth, verifyRole(["admin", "superadmin"]), getAllActivityLogs);

export default router;

