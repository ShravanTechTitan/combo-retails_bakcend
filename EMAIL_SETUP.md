# 📧 Email Service Setup Guide

## Environment Variables Required

Add these to your `.env` file in the `backend` directory:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Frontend URL (for email links)
FRONTEND_URL=https://www.universalcombo.com
```

## Gmail Setup (Recommended)

### Step 1: Enable 2-Step Verification
1. Go to your Google Account settings
2. Security → 2-Step Verification
3. Enable it

### Step 2: Generate App Password
1. Go to Google Account → Security
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" and "Other (Custom name)"
4. Enter "Universal Combo" as the name
5. Click "Generate"
6. Copy the 16-character password
7. Use this password as `SMTP_PASS` in your `.env` file

### Step 3: Update .env File
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # The 16-character app password
SMTP_FROM=your-email@gmail.com
FRONTEND_URL=https://www.universalcombo.com
```

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## Testing Email Configuration

### 1. Check Configuration
```bash
GET http://localhost:8080/api/test-email/check-config
```

### 2. Send Test Email
```bash
POST http://localhost:8080/api/test-email/test-email
Content-Type: application/json

{
  "email": "test@example.com",
  "type": "welcome"  // Options: "welcome", "receipt", "reminder"
}
```

## Email Types Available

1. **Welcome Email** - Sent when user registers
2. **Payment Receipt** - Sent after successful payment
3. **Expiry Reminder** - Sent when subscription is expiring soon
4. **Password Reset** - Sent when user requests password reset

## Troubleshooting

### Error: "Invalid login"
- Check if you're using App Password (not regular password) for Gmail
- Verify 2-Step Verification is enabled

### Error: "Connection timeout"
- Check firewall settings
- Verify SMTP_HOST and SMTP_PORT are correct

### Error: "Authentication failed"
- Verify SMTP_USER and SMTP_PASS are correct
- For Gmail, make sure you're using App Password

## Security Notes

- Never commit `.env` file to git
- Use App Passwords instead of regular passwords
- Keep your SMTP credentials secure

