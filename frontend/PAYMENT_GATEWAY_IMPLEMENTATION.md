# Keja Yangu Kenya - Real Estate Platform

A modern real estate platform for buying, renting, and managing properties in Kenya.

**Current date reference**: January 11, 2026

## Current Status (as of Jan 2026)

The frontend is mostly functional with:

- Property listing & search
- Property details page
- Agent dashboard (list/add/edit properties)
- Basic admin finance overview (dummy data)

However, the platform is **not yet production-ready**. Several critical features are missing or incomplete.

## High-Priority Tasks That Must Be Completed Before Launch

### 1. Payment Gateway Integrations (Highest Priority)

You need at least **two** payment methods for launch in Kenya 2026:

#### Recommended Payment Stack (Jan 2026)

| Priority | Provider        | Best For                             | Fees (approx.)   | Settlement Time  | Implementation Difficulty | Recommendation           |
| -------- | --------------- | ------------------------------------ | ---------------- | ---------------- | ------------------------- | ------------------------ |
| 1        | M-Pesa STK Push | Majority of Kenyan users             | ~1.5–2%          | Instant–next day | Medium                    | **Must have**            |
| 2        | Flutterwave     | Local & international cards + M-Pesa | 2.5–3.5%         | 1–3 days         | Easy–Medium               | **Strongly recommended** |
| 3        | Stripe          | International cards + diaspora       | 2.9% + KSh 30–50 | 2–7 days         | Easy                      | **Recommended**          |
| 4        | Pesapal         | Traditional businesses, local cards  | ~3.5% + fees     | 1–7 days         | Medium                    | **Good fallback**        |
| 5        | PayPal          | Diaspora & very international buyers | 3.4–4.4% + fixed | 1–5 days (slow)  | Medium                    | **Lowest priority**      |

**Launch Goal**: M-Pesa + Flutterwave (covers ~90% of Kenyan users)  
**Nice-to-have Phase 2**: Stripe + Pesapal

#### Implementation Guides

##### A. M-Pesa STK Push (Lipa na M-Pesa Online) – Must Have

**Steps**:

1. Register on https://developer.safaricom.co.ke → Create app → Lipa na M-Pesa Online
2. Get: Consumer Key, Secret, Shortcode (Paybill/Till), Passkey, Callback URL (https required)
3. **Backend**: Create `/api/payments/initiate-stk-push` endpoint
   - Get OAuth token
   - Generate password (Shortcode + Passkey + Timestamp → Base64)
   - POST to `https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest`
4. **Callback**: Secure `/api/payments/mpesa-callback` → verify & update DB
5. **Frontend**: Phone input → trigger STK → show "Check your phone" toast
6. **Production**: Complete Go Live process (business docs + verification)

**Time**: 4–10 days (longest part is Go Live approval)  
**Tip**: Use sandbox first (Shortcode: 174379)

##### B. Flutterwave – Strong Local + Cards

**Steps**:

1. Sign up: https://dashboard.flutterwave.com
2. Get: Public Key, Secret Key, Encryption Key
3. **Easiest method**: Use Rave popup (flutterwave-react-v3)

```tsx
// PaymentButton.tsx
import Flutterwave from "flutterwave-react-v3";

const config = {
  public_key: import.meta.env.VITE_FLW_PUBLIC_KEY!,
  tx_ref: `prop-${propertyId}-${Date.now()}`,
  amount: property.price,
  currency: "KES",
  payment_options: "card,mpesa,banktransfer",
  redirect_url: window.location.origin + "/payment/success",
  customer: { email: user.email, phone_number: user.phone },
  customizations: { title: "Keja Yangu Payment" },
};

<Flutterwave
  config={config}
  callback={(res) => {
    if (res.status === "successful") {
      // Verify on backend using Secret Key
    }
  }}
/>;
```
