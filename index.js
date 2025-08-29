import express from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";

import userRoutes from "./src/routes/user.js";
import productRoutes from "./src/routes/productRoutes.js";
import partCategoryRoutes from "./src/routes/partCategoryRoutes.js";
import deviceCategoryRoutes from "./src/routes/deviceCategoryRoutes.js";
import brandRoutes from "./src/routes/brandRoutes.js";
import modelRoutes from "./src/routes/modelRoutes.js";
import searchRoutes from "./src/routes/search.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", async (req, res, next) => { await connectDB(); next(); }, userRoutes);
app.use("/products", async (req, res, next) => { await connectDB(); next(); }, productRoutes);
app.use("/partCategories", async (req, res, next) => { await connectDB(); next(); }, partCategoryRoutes);
app.use("/deviceCategories", async (req, res, next) => { await connectDB(); next(); }, deviceCategoryRoutes);
app.use("/brands", async (req, res, next) => { await connectDB(); next(); }, brandRoutes);
app.use("/models", async (req, res, next) => { await connectDB(); next(); }, modelRoutes);
app.use("/", async (req, res, next) => { await connectDB(); next(); }, searchRoutes);

app.get("/test", async (req, res) => {
  await connectDB();
  res.json({ message: "API is working ✅" });
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default serverless(app);
