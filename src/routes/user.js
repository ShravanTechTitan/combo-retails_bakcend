import express from "express";
import { verifyAuth } from "../middleware/auth.js";
import User from "../models/user.js";
import { registerUser, loginUser,sendOtp,verifyOtp, resetPassword, getProfile, updateProfile,} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp); 
router.post("/reset-password", resetPassword); 
router.get("/profile", verifyAuth, getProfile);
router.put("/profile", verifyAuth, updateProfile);

export default router;
