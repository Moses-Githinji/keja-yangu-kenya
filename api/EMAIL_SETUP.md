# Email Service Setup Guide

## Overview

This guide explains how to configure email service for KejaYangu, including email verification, password reset, and notifications.

## Environment Variables Required

Add these to your `.env` file:

```env
# Email Service Configuration
ENABLE_EMAIL_VERIFICATION="true"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@kejayangu.co.ke"
FRONTEND_URL="http://localhost:3000"
```

## Gmail Setup (Recommended for Development)

### 1. Enable 2-Factor Authentication

- Go to your Google Account settings
- Enable 2-Factor Authentication

### 2. Generate App Password

- Go to Security → App passwords
- Select "Mail" and your device
- Copy the generated 16-character password
- Use this as `SMTP_PASS`

### 3. Update .env

```env
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="abcd efgh ijkl mnop"  # Your 16-char app password
```

## Alternative Email Services

### SendGrid

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

### Outlook/Hotmail

```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT=587
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
```

## Testing Email Service

### 1. Test Configuration

```bash
GET /api/v1/auth/email-test
```

### 2. Test Registration

Register a new user to test email verification.

### 3. Check Backend Logs

Look for email service status in console output.

## Troubleshooting

### Common Issues

1. **"Email service disabled"**

   - Check SMTP credentials in .env
   - Verify ENABLE_EMAIL_VERIFICATION="true"

2. **"Authentication failed"**

   - Verify SMTP_USER and SMTP_PASS
   - For Gmail, use App Password, not regular password

3. **"Connection timeout"**
   - Check SMTP_HOST and SMTP_PORT
   - Verify firewall/network settings

### Debug Steps

1. Check environment variables:

   ```bash
   GET /api/v1/auth/email-test
   ```

2. Verify .env file exists and has correct values

3. Restart backend server after .env changes

4. Check backend console for email service logs

## Security Notes

- Never commit .env files to version control
- Use App Passwords for Gmail (not regular passwords)
- Consider using environment-specific .env files
- Rotate email credentials regularly in production

## Production Considerations

- Use dedicated email service (SendGrid, Mailgun, etc.)
- Implement email rate limiting
- Set up email delivery monitoring
- Configure SPF, DKIM, and DMARC records
- Use environment-specific SMTP credentials
