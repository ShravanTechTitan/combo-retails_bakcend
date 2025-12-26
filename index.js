import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";


import userRoutes from "./src/routes/user.js";
import productRoutes from "./src/routes/productRoutes.js";
import partCategoryRoutes from "./src/routes/partCategoryRoutes.js";
import deviceCategoryRoutes from "./src/routes/deviceCategoryRoutes.js";
import brandRoutes from "./src/routes/brandRoutes.js";
import modelRoutes from "./src/routes/modelRoutes.js";
import searchRoutes from "./src/routes/searchRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import subscriptionRoutes from "./src/routes/subscriptions.js";
import userSubscriptionRoutes from "./src/routes/userSubscriptionRoutes.js";
import paymentRoutes from "./src/routes/payment.js";
import blogRoutes from "./src/routes/blogRoutes.js";


const app = express();

// Connect to DB once
connectDB().then(() => console.log("MongoDB connected ✅"))
           .catch(err => console.error("DB connection error:", err));

// Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://mellifluous-cendol-f4d125.netlify.app",
  "https://combo-retail-de67-4jdffuidv-shravan-kumars-projects-eeb86419.vercel.app",
  "https://www.universalcombo.com"
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));


app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/partCategories", partCategoryRoutes);
app.use("/api/deviceCategories", deviceCategoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/", searchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/user-subscriptions", userSubscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/blogs", blogRoutes);



// Test routes
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working ✅" });
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Listen on Railway's port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
