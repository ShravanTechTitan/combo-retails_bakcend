import express from "express";
import { subscribeUser, getAllUserSubscriptions, getMySubscriptions } from "../controllers/userSubscriptionController.js";

const router = express.Router();

// User subscribes to a plan
router.post("/:planId/subscribe", subscribeUser);

// Admin: get all subscriptions
router.get("/", getAllUserSubscriptions);

// User: get my subscriptions
router.get("/:userId", getMySubscriptions);

export default router;
