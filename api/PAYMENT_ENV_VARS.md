# Payment Environment Variables Documentation

This document details all environment variables required for payment providers, their purposes, and sources.

## M-Pesa

### Sandbox

- **MPESA_SANDBOX_CONSUMER_KEY**: Consumer key obtained from Safaricom Developer Portal for sandbox application. Purpose: Used to authenticate API requests to M-Pesa sandbox environment for OAuth token generation.
- **MPESA_SANDBOX_CONSUMER_SECRET**: Consumer secret from the portal. Purpose: Paired with consumer key for authentication.
- **MPESA_SANDBOX_PASSKEY**: Passkey provided in the portal. Purpose: Used to generate the password for STK push requests (combined with shortcode and timestamp).
- **MPESA_SANDBOX_SHORTCODE**: Business shortcode, default 174379 for sandbox. Purpose: Identifies the business/paybill number for transactions.
- **MPESA_SANDBOX_CALLBACK_URL**: Callback URL for receiving payment notifications, e.g., http://your-domain.com/api/v1/payments/mpesa-callback. Purpose: Endpoint where M-Pesa sends transaction status updates.

### Production

- **MPESA_PRODUCTION_CONSUMER_KEY**: From production app in portal.
- **MPESA_PRODUCTION_CONSUMER_SECRET**
- **MPESA_PRODUCTION_PASSKEY**
- **MPESA_PRODUCTION_SHORTCODE**: Your actual paybill or till number.
- **MPESA_PRODUCTION_CALLBACK_URL**: Must be HTTPS, e.g., https://your-domain.com/api/v1/payments/mpesa-callback.

**Source**: https://developer.safaricom.co.ke

## Flutterwave

### Sandbox

- **FLW_SANDBOX_PUBLIC_KEY**: Public key from Flutterwave sandbox dashboard. Purpose: Used in frontend for payment popup integration.
- **FLW_SANDBOX_SECRET_KEY**: Secret key. Purpose: Used in backend for API calls and verification.
- **FLW_SANDBOX_ENCRYPTION_KEY**: Encryption key. Purpose: For verifying webhook signatures.
- **FLW_SANDBOX_REDIRECT_URL**: Redirect URL after payment completion.

### Production

- **FLW_PRODUCTION_PUBLIC_KEY**
- **FLW_PRODUCTION_SECRET_KEY**
- **FLW_PRODUCTION_ENCRYPTION_KEY**
- **FLW_PRODUCTION_REDIRECT_URL**: Must be HTTPS.

**Source**: https://dashboard.flutterwave.com

## Stripe

### Sandbox

- **STRIPE_SANDBOX_SECRET_KEY**: Test secret key.
- **STRIPE_SANDBOX_WEBHOOK_SECRET**: Test webhook secret.

### Production

- **STRIPE_PRODUCTION_SECRET_KEY**: Live secret key.
- **STRIPE_PRODUCTION_WEBHOOK_SECRET**: Live webhook secret.

**Source**: https://dashboard.stripe.com

## Pesapal

### Sandbox

- **PESAPAL_SANDBOX_CONSUMER_KEY**
- **PESAPAL_SANDBOX_CONSUMER_SECRET**

### Production

- **PESAPAL_PRODUCTION_CONSUMER_KEY**
- **PESAPAL_PRODUCTION_CONSUMER_SECRET**

**Source**: Pesapal developer portal.

## PayPal

### Sandbox

- **PAYPAL_SANDBOX_CLIENT_ID**
- **PAYPAL_SANDBOX_CLIENT_SECRET**

### Production

- **PAYPAL_PRODUCTION_CLIENT_ID**
- **PAYPAL_PRODUCTION_CLIENT_SECRET**

**Source**: https://developer.paypal.com

## Frontend Variables

- **VITE_FLW_SANDBOX_PUBLIC_KEY**: For frontend Flutterwave integration in sandbox.
- **VITE_FLW_PRODUCTION_PUBLIC_KEY**: For production.

## Notes

- All production callback and redirect URLs must use HTTPS for security.
- Obtain keys from respective provider dashboards.
- For M-Pesa, complete Go Live process for production keys.
