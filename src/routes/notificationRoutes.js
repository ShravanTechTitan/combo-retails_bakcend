// routes/notificationRoutes.js
import express from "express";
import { verifyAuth, verifyRole } from "../middleware/auth.js";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotificationToUsers,
  sendNotificationToAllUsers,
  getAllSentNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

// User routes
router.get("/", verifyAuth, getUserNotifications);
router.put("/:notificationId/read", verifyAuth, markAsRead);
router.put("/read-all", verifyAuth, markAllAsRead);
router.delete("/:notificationId", verifyAuth, deleteNotification);

// Admin routes - Send notifications
router.post("/admin/send", verifyAuth, verifyRole(["admin", "superadmin"]), sendNotificationToUsers);
router.post("/admin/send-all", verifyAuth, verifyRole(["admin", "superadmin"]), sendNotificationToAllUsers);
router.get("/admin/history", verifyAuth, verifyRole(["admin", "superadmin"]), getAllSentNotifications);

export default router;

