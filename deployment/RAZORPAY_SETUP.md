# Razorpay Payment Gateway Integration Guide

OfficeFuel includes a production-grade Razorpay payment gateway integration supporting UPI, Credit/Debit Cards, Net Banking, and Wallets with cryptographic HMAC-SHA256 signature verification and idempotent webhook listeners.

---

## 1. Obtain Your Razorpay API Keys

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings** → **API Keys**.
3. For local testing, generate **Test Keys** (`rzp_test_...` and Test Secret).
4. For live production, complete KYC and generate **Live Keys** (`rzp_live_...` and Live Secret).

---

## 2. Configure Backend `.env`

Update your `backend/.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_random_webhook_secret_here
```

---

## 3. Configure Frontend Environment

Update your `frontend/.env.production`:

```env
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
```

Rebuild the frontend bundle if you modify this variable:
```bash
cd frontend && npm run build
```

---

## 4. Set Up Razorpay Webhooks (For Real-time Payment Updates)

Webhooks ensure that even if the customer accidentally closes their browser tab or experiences a network dropout after completing a UPI or card payment, your store records the transaction and automatically moves the order to `paid` / `processing`.

1. Go to **Razorpay Dashboard** → **Settings** → **Webhooks**.
2. Click **Add New Webhook**.
3. Enter your Webhook URL:
   `https://api.officefuel.in/api/payments/webhook`
4. Enter your **Secret** (must match `RAZORPAY_WEBHOOK_SECRET` in `backend/.env`).
5. Select the following active events:
   - `order.paid`
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`
6. Click **Save Webhook**.

---

## 5. Security & Idempotency Guarantees

- **Server-Side Order Creation**: Orders are created on Razorpay's servers with the exact amount calculated on the backend.
- **HMAC Signature Check**: Every client-returned `razorpay_signature` is validated using PHP's `hash_hmac('sha256', "$order_id|$payment_id", $secret)`.
- **Idempotent Webhooks**: If Razorpay sends duplicate webhook events, OfficeFuel logs the event and safely ignores redundant state transitions without double-charging or duplicate inventory adjustments.
