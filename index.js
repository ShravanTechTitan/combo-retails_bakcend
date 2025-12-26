import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import { rateLimiter } from "./src/middleware/rateLimiter.js";


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
import exportRoutes from "./src/routes/exportRoutes.js";
import activityRoutes from "./src/routes/activityRoutes.js";
import sitemapRoutes from "./src/routes/sitemapRoutes.js";
import invoiceRoutes from "./src/routes/invoiceRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";


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
  "https://combo-retail-de67-jdvqg7qhq-shravan-kumars-projects-eeb86419.vercel.app",
  "https://www.universalcombo.com"
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Allow all Vercel preview deployments (pattern matching)
    if (origin.includes('vercel.app') || origin.includes('vercel-demo.com')) {
      return callback(null, true);
    }
    
    // Allow all Netlify deployments (pattern matching)
    if (origin.includes('netlify.app') || origin.includes('netlify.com')) {
      return callback(null, true);
    }
    
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true
}));


app.use(express.json());

// Rate limiting for API routes
app.use("/api/", rateLimiter(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

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
app.use("/api/export", exportRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/", sitemapRoutes); // Sitemap and robots.txt at root level



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
