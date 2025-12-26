import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const otpStore = {}; // Temporary in-memory OTP store

// ✅ Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// ✅ Register
export const registerUser = async (req, res) => {
  try {
    const { name, number, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, number, password: hashedPassword });

    // Send welcome email (non-blocking)
    try {
      const { sendWelcomeEmail } = await import("../utils/emailService.js");
      sendWelcomeEmail(user.email, user.name).catch(err => 
        console.error("Failed to send welcome email:", err)
      );
    } catch (emailErr) {
      console.error("Email service error:", emailErr);
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      number: user.number,
      role: user.role,
      token: generateToken(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// ✅ Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      number: user.number,
      role: user.role,
      token: generateToken(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Send OTP
export const sendOtp = (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Valid email required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  console.log(`OTP for ${email}: ${otp}`);
  res.json({ message: "OTP sent" });
};

// ✅ Verify OTP
export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email & OTP required" });

  if (otpStore[email] && otpStore[email] === Number(otp)) {
    delete otpStore[email]; // ✅ OTP one-time use
    res.json({ message: "OTP verified" });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
};

// ✅ Reset Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (otpStore[email] !== Number(otp)) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    delete otpStore[email]; // ✅ clear OTP after use
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// controllers/userController.js
export const getProfile = async (req, res) => {
  res.json(req.user);
};

export const updateProfile = async (req, res) => {
  try {
    const user = req.user;

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.number = req.body.number || user.number;

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      number: updatedUser.number,
      role: updatedUser.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

