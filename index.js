import express from "express";
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

// Connect to DB once
connectDB().then(() => console.log("MongoDB connected ✅"))
           .catch(err => console.error("DB connection error:", err));

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/partCategories", partCategoryRoutes);
app.use("/deviceCategories", deviceCategoryRoutes);
app.use("/brands", brandRoutes);
app.use("/models", modelRoutes);
app.use("/", searchRoutes);

// Test routes
app.get("/test", (req, res) => {
  res.json({ message: "API is working ✅" });
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Listen on Railway's port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
