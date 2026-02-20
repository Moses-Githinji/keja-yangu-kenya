# Payment Environment Configuration Plan

## Objective

Plan and implement environment configuration for payment providers including M-Pesa, Flutterwave, and others, with separate sandbox and production setups, HTTPS for callbacks, and full documentation.

## Current State

- api/env.example has basic payment vars for Stripe and M-Pesa.
- frontend/.env has no payment vars.
- Payment implementation is placeholder.

## Proposed Environment Variables

### API (Backend) Variables

#### M-Pesa

**Sandbox:**

- MPESA_SANDBOX_CONSUMER_KEY: Consumer key from Safaricom Developer Portal sandbox app. Used for OAuth authentication with M-Pesa API.
- MPESA_SANDBOX_CONSUMER_SECRET: Consumer secret for authentication.
- MPESA_SANDBOX_PASSKEY: Passkey for generating payment password.
- MPESA_SANDBOX_SHORTCODE: Business shortcode (default 174379 for sandbox).
- MPESA_SANDBOX_CALLBACK_URL: URL for M-Pesa to send payment notifications (HTTP allowed for sandbox).

**Production:**

- MPESA_PRODUCTION_CONSUMER_KEY
- MPESA_PRODUCTION_CONSUMER_SECRET
- MPESA_PRODUCTION_PASSKEY
- MPESA_PRODUCTION_SHORTCODE
- MPESA_PRODUCTION_CALLBACK_URL: Must be HTTPS.

Source: https://developer.safaricom.co.ke

#### Flutterwave

**Sandbox:**

- FLW_SANDBOX_PUBLIC_KEY: Public key for frontend integration.
- FLW_SANDBOX_SECRET_KEY: Secret key for backend API calls.
- FLW_SANDBOX_ENCRYPTION_KEY: Encryption key for webhooks.
- FLW_SANDBOX_REDIRECT_URL: URL to redirect after payment.

**Production:**

- FLW_PRODUCTION_PUBLIC_KEY
- FLW_PRODUCTION_SECRET_KEY
- FLW_PRODUCTION_ENCRYPTION_KEY
- FLW_PRODUCTION_REDIRECT_URL: Must be HTTPS.

Source: https://dashboard.flutterwave.com

#### Stripe

**Sandbox:**

- STRIPE_SANDBOX_SECRET_KEY
- STRIPE_SANDBOX_WEBHOOK_SECRET

**Production:**

- STRIPE_PRODUCTION_SECRET_KEY
- STRIPE_PRODUCTION_WEBHOOK_SECRET

Source: https://dashboard.stripe.com

#### Pesapal

**Sandbox:**

- PESAPAL_SANDBOX_CONSUMER_KEY
- PESAPAL_SANDBOX_CONSUMER_SECRET

**Production:**

- PESAPAL_PRODUCTION_CONSUMER_KEY
- PESAPAL_PRODUCTION_CONSUMER_SECRET

Source: Pesapal developer portal.

#### PayPal

**Sandbox:**

- PAYPAL_SANDBOX_CLIENT_ID
- PAYPAL_SANDBOX_CLIENT_SECRET

**Production:**

- PAYPAL_PRODUCTION_CLIENT_ID
- PAYPAL_PRODUCTION_CLIENT_SECRET

Source: https://developer.paypal.com

### Frontend Variables

In frontend/.env:

- VITE_FLW_SANDBOX_PUBLIC_KEY
- VITE_FLW_PRODUCTION_PUBLIC_KEY

## HTTPS Setup for Callbacks

- All production callback and redirect URLs must use HTTPS.
- In code, validate that production URLs start with 'https://'.
- For sandbox, HTTP is allowed for testing.

## Implementation Steps

1. Update api/env.example to include all the above variables under # Payment Configuration section.
2. Update frontend/.env to include VITE*FLW*\* variables.
3. Create api/PAYMENT_ENV_VARS.md with detailed documentation of each variable, purpose, and source.
4. Modify payment processing code to select variables based on NODE_ENV (development for sandbox, production for production).
5. Add validation in code to ensure HTTPS for production callbacks.

## Next Steps

Review this plan. If approved, switch to Code mode to implement the changes.
