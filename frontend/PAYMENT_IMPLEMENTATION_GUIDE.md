# Payment Gateway Implementation Guide

## Overview

This document provides comprehensive documentation for the payment gateway implementation in Keja Yangu Kenya, a real estate platform. The system supports multiple payment providers including M-Pesa, Flutterwave, Stripe, and traditional payment methods.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [API Endpoints](#api-endpoints)
3. [Frontend Components](#frontend-components)
4. [Security Features](#security-features)
5. [Testing Procedures](#testing-procedures)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

## Environment Setup

### Required Environment Variables

#### M-Pesa Configuration

**Sandbox Environment:**

```bash
MPESA_SANDBOX_CONSUMER_KEY=your_sandbox_consumer_key
MPESA_SANDBOX_CONSUMER_SECRET=your_sandbox_consumer_secret
MPESA_SANDBOX_PASSKEY=your_sandbox_passkey
MPESA_SANDBOX_SHORTCODE=174379
MPESA_SANDBOX_CALLBACK_URL=http://localhost:3001/api/v1/payments/mpesa-callback
```

**Production Environment:**

```bash
MPESA_PRODUCTION_CONSUMER_KEY=your_production_consumer_key
MPESA_PRODUCTION_CONSUMER_SECRET=your_production_consumer_secret
MPESA_PRODUCTION_PASSKEY=your_production_passkey
MPESA_PRODUCTION_SHORTCODE=your_paybill_number
MPESA_PRODUCTION_CALLBACK_URL=https://yourdomain.com/api/v1/payments/mpesa-callback
```

#### Flutterwave Configuration

**Sandbox Environment:**

```bash
FLW_SANDBOX_PUBLIC_KEY=your_sandbox_public_key
FLW_SANDBOX_SECRET_KEY=your_sandbox_secret_key
FLW_SANDBOX_ENCRYPTION_KEY=your_sandbox_encryption_key
FLW_SANDBOX_REDIRECT_URL=http://localhost:5173/payment/success
```

**Production Environment:**

```bash
FLW_PRODUCTION_PUBLIC_KEY=your_production_public_key
FLW_PRODUCTION_SECRET_KEY=your_production_secret_key
FLW_PRODUCTION_ENCRYPTION_KEY=your_production_encryption_key
FLW_PRODUCTION_REDIRECT_URL=https://yourdomain.com/payment/success
```

**Frontend Variables:**

```bash
VITE_FLW_SANDBOX_PUBLIC_KEY=your_sandbox_public_key
VITE_FLW_PRODUCTION_PUBLIC_KEY=your_production_public_key
```

#### Stripe Configuration (Optional)

**Sandbox Environment:**

```bash
STRIPE_SANDBOX_SECRET_KEY=your_sandbox_secret_key
STRIPE_SANDBOX_WEBHOOK_SECRET=your_sandbox_webhook_secret
```

**Production Environment:**

```bash
STRIPE_PRODUCTION_SECRET_KEY=your_production_secret_key
STRIPE_PRODUCTION_WEBHOOK_SECRET=your_production_webhook_secret
```

### Database Setup

The payment system uses the following Prisma models:

- `Payment`: Core payment records
- `PaymentLog`: Audit trail for payment actions
- `SecurityLog`: Security events and violations
- `BlockedIP`: IP blocking for security

Run database migrations:

```bash
cd api
npx prisma migrate dev
```

### Dependencies Installation

Ensure all required packages are installed:

```bash
# Backend dependencies
npm install express express-validator crypto jsonwebtoken

# Payment provider SDKs (if using)
npm install flutterwave-node stripe

# Development dependencies
npm install -D jest supertest
```

## API Endpoints

### Base URL

```
https://yourdomain.com/api/v1/payments
```

### Authentication

All payment endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Endpoints

#### 1. Initiate M-Pesa STK Push

**Endpoint:** `POST /api/v1/payments/initiate-stk-push`

**Request Body:**

```json
{
  "amount": 50000,
  "phoneNumber": "0712345678",
  "propertyId": "optional-property-id",
  "propertyDetails": {
    "title": "Property Title",
    "location": "Nairobi, Kenya"
  }
}
```

**Response (Success):**

```json
{
  "status": "success",
  "message": "STK Push initiated successfully",
  "data": {
    "paymentId": "payment-uuid",
    "checkoutRequestId": "ws_CO_123456789",
    "customerMessage": "Success. Request accepted for processing"
  }
}
```

**Security Features:**

- Rate limiting: 3 STK push attempts per hour per user
- Phone number validation
- Amount limits: KES 10 - 5,000,000
- Fraud detection

#### 2. Create Payment

**Endpoint:** `POST /api/v1/payments`

**Request Body:**

```json
{
  "amount": 25000,
  "currency": "KES",
  "paymentMethod": "MPESA|FLUTTERWAVE|STRIPE|BANK_TRANSFER|CASH",
  "description": "Property purchase payment"
}
```

**Supported Payment Methods:**

- `MPESA`: M-Pesa mobile money
- `FLUTTERWAVE`: Cards, M-Pesa, bank transfer
- `STRIPE`: International cards
- `BANK_TRANSFER`: Manual bank transfer
- `CASH`: Cash payment

#### 3. Get Payment History

**Endpoint:** `GET /api/v1/payments`

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED)
- `paymentMethod`: Filter by payment method

**Response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": "payment-uuid",
      "amount": 25000,
      "currency": "KES",
      "paymentMethod": "MPESA",
      "status": "COMPLETED",
      "transactionId": "MPESA_123456",
      "description": "Property payment",
      "createdAt": "2026-01-11T18:00:00.000Z"
    }
  ],
  "pagination": {
    "totalDocs": 25,
    "limit": 10,
    "totalPages": 3,
    "page": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevPage": null,
    "nextPage": 2
  }
}
```

#### 4. Get Payment by ID

**Endpoint:** `GET /api/v1/payments/:id`

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "payment-uuid",
    "amount": 25000,
    "currency": "KES",
    "provider": "MPESA",
    "status": "COMPLETED",
    "transactionRef": "MPESA_123456",
    "user": {
      "id": "user-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "property": {
      "id": "property-uuid",
      "title": "Modern Apartment",
      "price": 25000
    },
    "logs": [
      {
        "action": "PAYMENT_CREATED",
        "timestamp": "2026-01-11T18:00:00.000Z"
      }
    ]
  }
}
```

#### 5. Request Refund

**Endpoint:** `POST /api/v1/payments/:id/refund`

**Request Body:**

```json
{
  "reason": "Customer requested refund due to change of mind. Payment was processed but customer decided not to proceed with the purchase."
}
```

**Requirements:**

- Payment must be COMPLETED status
- Within 30-day refund window
- Minimum 10 characters, maximum 500 characters for reason

#### 6. Verify Flutterwave Payment

**Endpoint:** `POST /api/v1/payments/verify-flutterwave`

**Request Body:**

```json
{
  "transaction_id": "123456789",
  "tx_ref": "TXN_FLW_123456789"
}
```

#### 7. Get Payment Statistics

**Endpoint:** `GET /api/v1/payments/stats/overview`

**Response:**

```json
{
  "status": "success",
  "data": {
    "totalPayments": 25,
    "totalAmount": 625000,
    "successfulPayments": 23,
    "failedPayments": 2,
    "successRate": "92.0"
  }
}
```

### M-Pesa Callback Handling

**Endpoint:** `POST /api/v1/payments/mpesa-callback`

M-Pesa sends callback data in this format:

```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "12345-67890-1234",
      "CheckoutRequestID": "ws_CO_123456789",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {
            "Name": "Amount",
            "Value": 50000
          },
          {
            "Name": "MpesaReceiptNumber",
            "Value": "QAB123456789"
          },
          {
            "Name": "TransactionDate",
            "Value": 20260111180000
          },
          {
            "Name": "PhoneNumber",
            "Value": 254712345678
          }
        ]
      }
    }
  }
}
```

## Frontend Components

### MpesaPaymentModal

**Location:** `frontend/src/components/payments/MpesaPaymentModal.tsx`

**Usage:**

```tsx
import MpesaPaymentModal from "@/components/payments/MpesaPaymentModal";

const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);

<MpesaPaymentModal
  isOpen={isMpesaModalOpen}
  onClose={() => setIsMpesaModalOpen(false)}
  amount={50000}
  propertyId="property-uuid"
  propertyDetails={{ title: "Modern Apartment" }}
  onSuccess={() => {
    // Handle successful payment
    navigate("/payment/success");
  }}
/>;
```

**Features:**

- Phone number validation (Kenyan format)
- Real-time payment status polling
- User-friendly status messages
- Automatic redirect on success
- Timeout handling (5 minutes)

### FlutterwavePaymentModal

**Location:** `frontend/src/components/payments/FlutterwavePaymentModal.tsx`

**Usage:**

```tsx
import FlutterwavePaymentModal from "@/components/payments/FlutterwavePaymentModal";

const [isFlutterwaveModalOpen, setIsFlutterwaveModalOpen] = useState(false);

<FlutterwavePaymentModal
  isOpen={isFlutterwaveModalOpen}
  onClose={() => setIsFlutterwaveModalOpen(false)}
  amount={50000}
  propertyId="property-uuid"
  propertyDetails={{ title: "Modern Apartment" }}
  onSuccess={() => {
    // Handle successful payment
    navigate("/payment/success");
  }}
/>;
```

**Features:**

- Integration with flutterwave-react-v3
- Support for multiple payment methods (card, M-Pesa, bank transfer)
- Automatic payment verification
- Customizable payment form

### API Service Integration

**Location:** `frontend/src/services/api.ts`

**Payment Methods:**

```typescript
// Initiate M-Pesa STK Push
const initiateStkPush = async (data: {
  amount: number;
  phoneNumber: string;
  propertyId?: string;
  propertyDetails?: any;
}) => {
  return apiService.post("/payments/initiate-stk-push", data);
};

// Create payment
const createPayment = async (data: {
  amount: number;
  currency: string;
  paymentMethod: string;
  description?: string;
}) => {
  return apiService.post("/payments", data);
};

// Get payment by ID
const getPaymentById = async (id: string) => {
  return apiService.get(`/payments/${id}`);
};

// Get payment history
const getPayments = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
}) => {
  return apiService.get("/payments", { params });
};

// Verify Flutterwave payment
const verifyFlutterwave = async (data: {
  transaction_id: string;
  tx_ref: string;
}) => {
  return apiService.post("/payments/verify-flutterwave", data);
};
```

## Security Features

### Rate Limiting

**Payment Rate Limits:**

- General payments: 5 attempts per 15 minutes per user
- STK Push: 3 attempts per hour per user
- Refunds: 2 attempts per 24 hours per user

**Implementation:**

```javascript
// In paymentSecurity.js
export const paymentRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  keyGenerator: (req) => `payment_${req.user?.id || req.ip}`,
});
```

### Fraud Detection

**Checks Performed:**

1. **Repeated Failed Payments:** More than 3 failed payments in 1 hour
2. **Suspicious Amounts:** Amounts over 10 million KES or under 1 KES
3. **Round Numbers:** Payments in multiples of 10,000 KES over 100,000 KES
4. **Rapid Successive Payments:** More than 5 successful payments in a day
5. **IP-based Restrictions:** Blocked IPs and suspicious IP patterns

**Logging:**
All security events are logged to the `SecurityLog` table with severity levels:

- LOW: Minor suspicious activity
- MEDIUM: Potential fraud attempts
- HIGH: Confirmed fraud patterns
- CRITICAL: Blocked IP access

### Input Validation

**Payment Data Validation:**

- Amount: Must be positive number, within limits
- Currency: Only KES and USD supported
- Payment Method: Must be from allowed list
- Phone Numbers: Kenyan format validation for M-Pesa
- Transaction References: Uniqueness constraints

### IP Blocking

**BlockedIP Model:**

```prisma
model BlockedIP {
  id         String   @id @default(cuid())
  ipAddress  String   @unique
  reason     String
  blockedBy  String?
  blockedAt  DateTime @default(now())
  expiresAt  DateTime?
  isActive   Boolean  @default(true)
}
```

**Automatic Blocking:**

- Triggered by critical security events
- Configurable expiry times
- Manual unblocking capability

## Testing Procedures

### Unit Tests

**Location:** `api/tests/unit/`

**Payment Service Tests:**

```bash
npm test -- tests/unit/paymentService.test.js
```

**Security Tests:**

```bash
npm test -- tests/unit/paymentSecurity.test.js
```

### Integration Tests

**Location:** `api/tests/integration/payments.test.js`

**Running Integration Tests:**

```bash
# Start test database
npm run test:db

# Run payment integration tests
npm test -- tests/integration/payments.test.js

# Run with coverage
npm run test:coverage
```

**Test Coverage Areas:**

- STK Push initiation and validation
- Payment creation and processing
- Payment retrieval and filtering
- Refund processing
- Error handling and edge cases

### Frontend Tests

**Location:** `frontend/src/components/payments/__tests__/`

**Running Frontend Tests:**

```bash
cd frontend
npm test

# Run specific test
npm test MpesaPaymentModal.test.tsx
```

### Manual Testing Checklist

#### M-Pesa STK Push Testing

1. **Sandbox Environment Setup:**

   - Register on Safaricom Developer Portal
   - Create sandbox app
   - Configure test credentials
   - Set callback URL to ngrok tunnel

2. **Test Scenarios:**

   - Valid phone number and amount
   - Invalid phone number format
   - Amount below minimum (KES 10)
   - Amount above maximum (KES 5M)
   - Network timeout simulation
   - Callback processing

3. **Callback Testing:**

   ```bash
   # Use ngrok for local callback testing
   ngrok http 3001

   # Update sandbox callback URL
   # https://abc123.ngrok.io/api/v1/payments/mpesa-callback
   ```

#### Flutterwave Testing

1. **Sandbox Setup:**

   - Sign up for Flutterwave sandbox
   - Get test API keys
   - Configure redirect URLs

2. **Test Cards:**

   - Success: `5531 8866 5214 2950`
   - Failure: `4000 0000 0000 0002`
   - Insufficient funds: `4000 0000 0000 0002`

3. **Payment Methods:**
   - Test card payments
   - Test M-Pesa integration
   - Test bank transfer

### Load Testing

**Payment Load Test Script:**

```bash
# Install artillery
npm install -g artillery

# Run payment load test
artillery run payment-load-test.yml

# Generate report
artillery report payment-load-test.json
```

## Production Deployment

### Pre-deployment Checklist

#### Environment Configuration

- [ ] Set production environment variables
- [ ] Configure HTTPS certificates
- [ ] Set up production database
- [ ] Configure monitoring and logging

#### Security Setup

- [ ] Enable rate limiting
- [ ] Configure IP whitelisting
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS properly

#### Payment Provider Setup

- [ ] Complete M-Pesa Go Live process
- [ ] Set production Flutterwave keys
- [ ] Configure Stripe webhooks (if used)
- [ ] Test production callback URLs

### Deployment Steps

1. **Database Migration:**

   ```bash
   # Run production migrations
   npx prisma migrate deploy
   ```

2. **Environment Variables:**

   ```bash
   # Copy production env file
   cp .env.example .env.production

   # Set production values
   export NODE_ENV=production
   ```

3. **Build and Deploy:**

   ```bash
   # Backend
   npm run build
   npm run start:prod

   # Frontend
   cd frontend
   npm run build
   # Deploy dist/ to CDN or server
   ```

### Monitoring Setup

#### Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# Application logs
pm2 logs payment-api
```

#### Payment Monitoring

- Set up Grafana dashboards for payment metrics
- Configure alerts for failed payments
- Monitor callback processing times
- Track payment success rates

#### Database Monitoring

```sql
-- Payment success rate query
SELECT
  COUNT(*) as total_payments,
  SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as successful_payments,
  ROUND(
    (SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) * 100.0) / COUNT(*),
    2
  ) as success_rate
FROM payments
WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours';
```

### Rollback Procedures

**Payment System Rollback:**

```bash
# Stop payment processing
pm2 stop payment-api

# Revert to previous version
git checkout v1.0.0
npm run build
pm2 restart payment-api

# Restore database backup if needed
pg_restore -d keja_yangu_prod payment_backup.sql
```

## Troubleshooting

### Common Issues

#### M-Pesa STK Push Issues

**Problem:** STK Push not received on phone

```
Solution:
1. Check phone number format (must start with 254)
2. Verify sandbox credentials
3. Check callback URL configuration
4. Confirm sufficient balance in test account
```

**Problem:** Callback not processed

```
Solution:
1. Verify callback URL is accessible
2. Check HTTPS requirement for production
3. Validate callback data structure
4. Check server logs for processing errors
```

#### Flutterwave Issues

**Problem:** Payment popup not loading

```
Solution:
1. Verify public key configuration
2. Check CORS settings
3. Validate redirect URL format
4. Confirm environment variables
```

**Problem:** Payment verification failed

```
Solution:
1. Check webhook secret configuration
2. Verify transaction reference matching
3. Confirm payment amounts match
4. Check for duplicate processing
```

#### General Payment Issues

**Problem:** Rate limiting triggered

```
Solution:
1. Wait for rate limit window to reset
2. Implement exponential backoff
3. Contact support for limit increases
4. Check for abusive patterns
```

**Problem:** Payment stuck in PENDING status

```
Solution:
1. Check payment provider status
2. Verify callback/webhook configuration
3. Manually trigger verification
4. Contact payment provider support
```

### Debug Commands

```bash
# Check payment status
curl -H "Authorization: Bearer <token>" \
  https://api.yourdomain.com/api/v1/payments/payment-id

# View payment logs
npx prisma studio
# Navigate to PaymentLog table

# Check security events
npx prisma db execute --file check-security-events.sql

# Monitor payment processing
tail -f logs/payment.log
```

### Support Contacts

- **M-Pesa Support:** developer@safaricom.co.ke
- **Flutterwave Support:** developers@flutterwavego.com
- **Stripe Support:** support.stripe.com
- **Internal Support:** dev@kejayangu.co.ke

---

**Last Updated:** January 11, 2026
**Version:** 1.0.0
**Maintainer:** Keja Yangu Development Team
