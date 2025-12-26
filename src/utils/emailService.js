import nodemailer from "nodemailer";

// Create reusable transporter
const createTransporter = () => {
  // Use environment variables for email configuration
  // For production, use SMTP settings
  // For development, you can use Gmail or other services
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send welcome email
export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: userEmail,
      subject: "Welcome to Universal Combo! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome ${userName}!</h2>
          <p>Thank you for joining Universal Combo. We're excited to have you on board!</p>
          <p>Start exploring our mobile spare parts catalog and subscribe to access premium features.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscribe" 
             style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            View Plans
          </a>
        </div>
      `,
    });
    
    console.log(`Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

// Send subscription expiry reminder
export const sendExpiryReminder = async (userEmail, userName, daysLeft, planName) => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: userEmail,
      subject: `Your ${planName} subscription expires in ${daysLeft} days`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F59E0B;">Subscription Expiring Soon</h2>
          <p>Hi ${userName},</p>
          <p>Your <strong>${planName}</strong> subscription will expire in <strong>${daysLeft} days</strong>.</p>
          <p>Renew now to continue enjoying premium features!</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscribe" 
             style="display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Renew Subscription
          </a>
        </div>
      `,
    });
    
    console.log(`Expiry reminder sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending expiry reminder:", error);
  }
};

// Send payment receipt
export const sendPaymentReceipt = async (userEmail, userName, amount, planName, orderId) => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: userEmail,
      subject: "Payment Receipt - Universal Combo",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Payment Successful! ✅</h2>
          <p>Hi ${userName},</p>
          <p>Thank you for your payment. Your subscription has been activated.</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Amount:</strong> ₹${amount}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>Your subscription is now active. Enjoy premium features!</p>
        </div>
      `,
    });
    
    console.log(`Payment receipt sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending payment receipt:", error);
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: userEmail,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <a href="${resetLink}" 
             style="display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    
    console.log(`Password reset email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};

