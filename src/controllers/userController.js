import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Register
console.log("JWT_SECRET:", process.env.JWT_SECRET);

export const registerUser = async (req, res) => {
  try {
    const { name,number, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email,number, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ id: user._id, name: user.name, email: user.email, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

   const token = jwt.sign(
  { id: user._id, role: user.role,name:user.name }, // Include role here
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);
    

    res.json({ id: user._id, name: user.name,role:user.role, email: user.email,name:user.name, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const otpStore = {}; // Temporary in-memory store

export const sendOtp = (req, res) => {
  const {email }= req.body.email;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Valid email required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;
  console.log(`OTP for ${email}: ${otp}`);
  res.json({ message: "OTP sent" });
};


export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email & OTP required" });

  if (otpStore[email] && otpStore[email] === Number(otp)) {
    delete otpStore[email]; // remove OTP after successful verification
    res.json({ message: "OTP verified" });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
};

export const resetPassword = (req, res) => {
  const { email, otp, newPassword } = req.body;
  // Validate OTP
  if (otpStore[email] !== Number(otp)) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  // Update password in DB
  User.findOneAndUpdate({ email }, { password: hashPassword(newPassword) })
    .then(() => res.json({ message: "Password reset successful" }))
    .catch((err) => res.status(500).json({ message: err.message }));
};

