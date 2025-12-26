// Helper script to add email configuration to .env file
// Run: node setup-email-env.js

import fs from "fs";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEmail() {
  console.log("\n📧 Email Configuration Setup\n");
  console.log("Please provide the following information:\n");
  
  const smtpUser = await question("SMTP Email (e.g., Sharwankumar20645@gmail.com): ");
  const smtpPass = await question("SMTP App Password (16-character Gmail app password): ");
  const smtpFrom = await question("From Email (press Enter to use same as SMTP Email): ") || smtpUser;
  const frontendUrl = await question("Frontend URL (e.g., https://www.universalcombo.com): ");
  
  rl.close();
  
  // Read existing .env file
  let envContent = "";
  if (fs.existsSync(".env")) {
    envContent = fs.readFileSync(".env", "utf8");
  }
  
  // Remove existing SMTP config if any
  envContent = envContent.replace(/# Email Configuration[\s\S]*?(?=\n[A-Z]|\n#|$)/g, "");
  envContent = envContent.replace(/SMTP_HOST=.*\n/g, "");
  envContent = envContent.replace(/SMTP_PORT=.*\n/g, "");
  envContent = envContent.replace(/SMTP_USER=.*\n/g, "");
  envContent = envContent.replace(/SMTP_PASS=.*\n/g, "");
  envContent = envContent.replace(/SMTP_FROM=.*\n/g, "");
  envContent = envContent.replace(/FRONTEND_URL=.*\n/g, "");
  
  // Add new SMTP configuration
  const emailConfig = `
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=${smtpUser}
SMTP_PASS=${smtpPass}
SMTP_FROM=${smtpFrom}
FRONTEND_URL=${frontendUrl}
`;
  
  // Append to .env file
  envContent += emailConfig;
  
  // Write back to .env
  fs.writeFileSync(".env", envContent.trim() + "\n");
  
  console.log("\n✅ Email configuration added to .env file!");
  console.log("\n📝 Next steps:");
  console.log("1. Make sure you're using Gmail App Password (not regular password)");
  console.log("2. Test the configuration: node test-email.js Sharwankumar20645@gmail.com");
  console.log("\n");
}

setupEmail().catch(console.error);

