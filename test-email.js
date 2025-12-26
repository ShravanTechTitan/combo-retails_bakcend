// Quick test script for email configuration
// Run: node test-email.js

import dotenv from "dotenv";
dotenv.config();

import { sendWelcomeEmail } from "./src/utils/emailService.js";

async function testEmail() {
  console.log("\n📧 Testing Email Configuration...\n");
  
  // Check configuration
  console.log("Configuration Check:");
  console.log("SMTP_HOST:", process.env.SMTP_HOST || "smtp.gmail.com (default)");
  console.log("SMTP_PORT:", process.env.SMTP_PORT || "587 (default)");
  console.log("SMTP_USER:", process.env.SMTP_USER ? "✅ Configured" : "❌ Not configured");
  console.log("SMTP_PASS:", process.env.SMTP_PASS ? "✅ Configured" : "❌ Not configured");
  console.log("SMTP_FROM:", process.env.SMTP_FROM || process.env.SMTP_USER || "❌ Not configured");
  console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "❌ Not configured");
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("\n❌ Email service is NOT configured!");
    console.log("Please set SMTP_USER and SMTP_PASS in your .env file");
    console.log("See EMAIL_SETUP.md for detailed instructions");
    process.exit(1);
  }
  
  console.log("\n✅ Email service is configured!");
  console.log("\nSending test email...");
  
  // Get test email from command line or use default
  const testEmail = process.argv[2] || process.env.TEST_EMAIL || "test@example.com";
  
  try {
    await sendWelcomeEmail(testEmail, "Test User");
    console.log(`\n✅ Test email sent successfully to ${testEmail}!`);
    console.log("Please check your inbox (and spam folder)");
  } catch (error) {
    console.error("\n❌ Failed to send test email:");
    console.error("Error:", error.message);
    
    if (error.code === "EAUTH") {
      console.error("\n💡 Authentication failed. Possible issues:");
      console.error("1. Check if SMTP_USER and SMTP_PASS are correct");
      console.error("2. For Gmail, make sure you're using App Password (not regular password)");
      console.error("3. Verify 2-Step Verification is enabled");
    } else if (error.code === "ECONNECTION") {
      console.error("\n💡 Connection failed. Possible issues:");
      console.error("1. Check your internet connection");
      console.error("2. Verify SMTP_HOST and SMTP_PORT are correct");
      console.error("3. Check firewall settings");
    }
    
    process.exit(1);
  }
}

testEmail();

