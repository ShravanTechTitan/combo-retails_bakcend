// routes/testEmailRoutes.js
import express from "express";
import { sendWelcomeEmail, sendPaymentReceipt, sendExpiryReminder } from "../utils/emailService.js";

const router = express.Router();

// Test email endpoint
router.post("/test-email", async (req, res) => {
  try {
    const { email, type = "welcome" } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ 
        message: "SMTP not configured. Please set SMTP_USER and SMTP_PASS in .env file",
        configured: false
      });
    }
    
    let result;
    switch (type) {
      case "welcome":
        await sendWelcomeEmail(email, "Test User");
        result = "Welcome email sent successfully";
        break;
      case "receipt":
        await sendPaymentReceipt(email, "Test User", 1000, "Test Plan", "TEST-ORDER-123");
        result = "Payment receipt email sent successfully";
        break;
      case "reminder":
        await sendExpiryReminder(email, "Test User", 7, "Test Plan");
        result = "Expiry reminder email sent successfully";
        break;
      default:
        return res.status(400).json({ message: "Invalid email type. Use: welcome, receipt, or reminder" });
    }
    
    res.json({ 
      success: true, 
      message: result,
      configured: true,
      smtpConfig: {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT || 587,
        user: process.env.SMTP_USER ? "✅ Configured" : "❌ Not configured",
        from: process.env.SMTP_FROM || process.env.SMTP_USER || "Not configured"
      }
    });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to send test email",
      error: error.message,
      details: error.response || error.code || "Unknown error"
    });
  }
});

// Check email configuration
router.get("/check-config", (req, res) => {
  const config = {
    SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com (default)",
    SMTP_PORT: process.env.SMTP_PORT || "587 (default)",
    SMTP_USER: process.env.SMTP_USER ? "✅ Configured" : "❌ Not configured",
    SMTP_PASS: process.env.SMTP_PASS ? "✅ Configured" : "❌ Not configured",
    SMTP_FROM: process.env.SMTP_FROM || process.env.SMTP_USER || "❌ Not configured",
    FRONTEND_URL: process.env.FRONTEND_URL || "❌ Not configured"
  };
  
  const isConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;
  
  res.json({
    configured: isConfigured,
    config,
    message: isConfigured 
      ? "✅ Email service is configured and ready!" 
      : "❌ Email service is not configured. Please set SMTP_USER and SMTP_PASS in .env file"
  });
});

export default router;

