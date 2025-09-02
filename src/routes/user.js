import express from "express";
import { registerUser, loginUser,sendOtp,verifyOtp, resetPassword } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp); 
router.post("/reset-password", resetPassword); 

export default router;
