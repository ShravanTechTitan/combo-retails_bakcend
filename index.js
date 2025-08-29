// api/index.js
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

// DB connect
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/partCategories", partCategoryRoutes);
app.use("/api/deviceCategories", deviceCategoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/models", modelRoutes);
app.use("/api", searchRoutes);


app.get("/api/test", (req, res) => {
  res.json({ message: "API is working ✅" });
});


// Optional root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Export for Vercel
export default serverless(app);
 