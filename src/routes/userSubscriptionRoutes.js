import express from "express";
import {
  subscribeUser,
  getAllUserSubscriptionsWithStatus,
  getMySubscriptions,
  deleteUserSubscription,
  toggleSubscriptionStatus,
} from "../controllers/userSubscriptionController.js";

const router = express.Router();

// ✅ User subscribes to a plan
router.post("/:planId/subscribe", subscribeUser);

// ✅ Admin: get all subscriptions with status
router.get("/", getAllUserSubscriptionsWithStatus);

// ✅ User: get my subscriptions
router.get("/user/:userId", getMySubscriptions);

// ✅ Admin: delete a subscription
router.delete("/:id", deleteUserSubscription);

// ✅ Admin: toggle active/inactive status
router.put("/:id/toggle-status", toggleSubscriptionStatus);

export default router;
