# Production Security Checklist & Hardening Guide

Follow this pre-launch security checklist before opening OfficeFuel to the public.

---

## 1. Environment & Secrets Management
- [ ] Ensure `APP_ENV=production` and `APP_DEBUG=false` in `backend/.env`.
- [ ] Ensure `backend/.env` permissions are set to `600` or `640` so it cannot be read by other Linux system users.
- [ ] Verify that `.env` is listed in `.gitignore` and never committed to source control.
- [ ] Set a strong 64-character random string for `JWT_SECRET`.
- [ ] Ensure Razorpay Live Webhook Secret is configured and verified using HMAC-SHA256.

---

## 2. Admin Portal Protection
- [ ] Change the default Super-Admin password immediately after initial setup.
- [ ] Verify that the setup wizard is locked (`storage/installed.lock` exists and returns HTTP 403 upon access).
- [ ] Verify that the public customer storefront has **zero admin navigation links**, login buttons, or exposed admin routes.
- [ ] Ensure brute-force rate limiting is enabled on `/api/admin/auth/login` (default: 5 attempts per 15 minutes).

---

## 3. Database & SQL Injection Defense
- [ ] Confirm all database queries in `backend/app/` use PDO Prepared Statements with bound parameters. Zero raw string interpolation.
- [ ] Restrict MySQL user privileges: the application database user only requires `SELECT`, `INSERT`, `UPDATE`, `DELETE` (and `CREATE`, `ALTER`, `INDEX` during initial migration).

---

## 4. API & Cross-Site Scripting (XSS / CORS / CSRF)
- [ ] Verify HTTP Security Headers in `SecurityHeadersMiddleware.php`:
  - `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
  - `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy`
- [ ] Configure `CORS_ALLOWED_ORIGINS` in `backend/.env` to strictly whitelist your production storefront and admin domains.
- [ ] Verify all user input is sanitized before rendering.

---

## 5. Server-Side Financial & Inventory Integrity
- [ ] Confirm that cart calculations, coupons, taxes, and shipping rates are calculated **strictly on the backend**. The client payload only passes item IDs and quantities.
- [ ] Confirm atomic database transactions are used when placing orders and deducting inventory to prevent race conditions during flash sales.
- [ ] Verify that webhook callbacks are idempotent.
