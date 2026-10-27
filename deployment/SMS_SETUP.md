# SMS Gateway (MSG91 / Fast2SMS / Twilio) Setup Guide

OfficeFuel includes a flexible, non-blocking notification adapter system for sending SMS OTPs and order status update alerts to Indian mobile numbers.

---

## 1. Supported Adapters & Fallback Design

- **Log Adapter (Default)**: Logs all OTPs and messages to `backend/storage/logs/sms.log`. Ideal for local testing and zero-cost development.
- **MSG91 (DLT Compliant)**: Full support for India DLT registered templates, OTP flow, and promotional campaigns.
- **Fast2SMS / Twilio**: Standard REST API dispatch.

---

## 2. Setting Up MSG91 (DLT-Approved in India)

1. Register an account at [MSG91](https://msg91.com/).
2. Obtain your **Auth Key** from the MSG91 dashboard.
3. Complete DLT registration with your business entity and obtain:
   - DLT Sender ID (Header, 6 characters, e.g., `OFFUEL`)
   - DLT Template ID for Order Confirmations
   - DLT Template ID for OTPs
4. Update `backend/.env`:
   ```env
   SMS_DRIVER=msg91
   MSG91_AUTH_KEY=your_msg91_auth_key
   MSG91_SENDER_ID=OFFUEL
   MSG91_DLT_TE_ID_ORDER=1007xxxxxxxxxxxx
   MSG91_DLT_TE_ID_OTP=1007xxxxxxxxxxxx
   ```

---

## 3. Setting Up Fast2SMS or Custom SMS Webhooks

If using Quick SMS or Fast2SMS:
```env
SMS_DRIVER=fast2sms
FAST2SMS_API_KEY=your_fast2sms_api_key
SMS_SENDER_ID=OFFUEL
```

---

## 4. Testing Notification Flow

You can test SMS dispatch using the backend test runner:
```bash
php backend/tests/run_tests.php
```
Or check the real-time logs in `backend/storage/logs/system.log`.
