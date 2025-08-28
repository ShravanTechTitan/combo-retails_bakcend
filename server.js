import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import userRoutes from "./src/routes/user.js";
import productRoutes from "./src/routes/productRoutes.js"
import partCategoryRoutes from "./src/routes/partCategoryRoutes.js"
import deviceCategoryRoutes from "./src/routes/deviceCategoryRoutes.js"
import brandRoutes from "./src/routes/brandRoutes.js";
import modelRoutes from "./src/routes/modelRoutes.js";
import searchRoutes from "./src/routes/search.js"


dotenv.config();
const app = express();

// Middlewares

app.use(cors());
app.use(express.json());

// DB connect
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products",productRoutes);
app.use("/api/partCategories", partCategoryRoutes);
app.use("/api/deviceCategories", deviceCategoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/models", modelRoutes);
app.use("/api",searchRoutes)




app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
