import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./src/models/user.js";

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const createSuperAdmin = async () => {
  const existing = await User.findOne({ role: "superadmin" });
  if (existing) return console.log("Superadmin already exists");

  const hashedPassword = await bcrypt.hash("Shravan", 10);
  const superadmin = new User({
    name: "Super Admin",
    email: "admin@example.com",
    password: hashedPassword,
    role: "superadmin",
  });
  await superadmin.save();
  console.log("Superadmin created ✅");
  process.exit();
};

createSuperAdmin();
