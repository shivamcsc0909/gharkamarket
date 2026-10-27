# OfficeFuel / Ghar Ka Market — Smart Indian Snacking for Busy Days

> **Production-Ready, Zero-Dependency Full-Stack E-Commerce Platform**  
> Tailored for Indian D2C healthy snacking, Delhi NCR express delivery, corporate snack pantry subscriptions, and built specifically for seamless deployment on **Hostinger Shared Hosting** (PHP 8.2+ & MySQL).

---

## 🌟 Key Highlights & System Architecture

- **Public Customer Storefront (`/frontend`)**:
  - React 18, Vite, TypeScript, Tailwind CSS, Lucide icons.
  - Zero admin links or privileged routes exposed in client code.
  - Delhi NCR Pincode serviceability checker (Instant Same-Day / Next-Day delivery validation for Gurgaon, Noida, Delhi, Faridabad, Ghaziabad).
  - Need-based Interactive Discovery: *High-Protein Work Fuel, Late-Night Brain Food, Guilt-Free Chai Companion, Calorie-Conscious Desk Bites*.
  - Full shopping cart drawer, single-page guest & member checkout, customer order history & timeline tracking.
  - Google Social Login & Passwordless OTP / Email authentication.
  - Corporate B2B snack box inquiries & sample pack request workflows.

- **Dedicated Admin Control Panel (`/admin`)**:
  - Independent React 18 + Vite SPA with Role-Based Access Control (Super Admin, Catalog Manager, Order Manager, Support).
  - Live revenue metrics, order velocity, top-selling macro categories, low stock alerts.
  - Comprehensive Products & Nutrition Macros CRUD (Protein, Fiber, Carbs, Fat, Calories per serving) + CSV batch import/export.
  - Interactive Orders lifecycle management (Status progression, tracking URL attachments, PDF invoice generation).
  - Inventory management with minimum threshold triggers.
  - Promotional Coupons engine (Percentage/Flat discount, min cart value, usage caps, validity window).
  - Corporate B2B leads manager & customer review moderation.
  - First-time Automated Setup Wizard with database table migration, super-admin account provisioning, and file-lock security.

- **Backend REST Engine (`/backend`)**:
  - Modern PSR-4 PHP 8.2+ architecture with zero runtime daemons or external servers needed (Runs natively on standard Apache / cPanel / Hostinger Shared Hosting).
  - Dual database engine: High-concurrency **MySQL** for production and **SQLite** for instant zero-config local testing.
  - Strict server-side financial calculations (prices, taxes, tiered delivery, coupon discounts).
  - Razorpay payment gateway integration with cryptographic HMAC-SHA256 signature verification and idempotent webhook processing.
  - Non-blocking notification system with zero-crash fallback (SMTP Email, MSG91 DLT-compliant SMS).
  - Deterministic Order IDs formatted as `OF-2026-XXXXXX`.

---

## 📁 Repository Structure

```text
gharkamarket/
├── frontend/             # Public Customer Storefront (React 18 + Vite + Tailwind)
│   ├── src/
│   │   ├── components/   # UI components (Navbar, CartDrawer, ProductCard, etc.)
│   │   ├── contexts/     # Auth, Cart, Notification state providers
│   │   ├── pages/        # Storefront views (Home, Shop, ProductDetail, Checkout, etc.)
│   │   └── types/        # TypeScript data contracts
│   └── package.json
│
├── admin/                # Dedicated Admin Portal (React 18 + Vite + Tailwind)
│   ├── src/
│   │   ├── components/   # Admin layout, sidebar, stat cards
│   │   ├── contexts/     # Admin authentication & permissions
│   │   ├── pages/        # Dashboard, Orders, Products, Inventory, Coupons, etc.)
│   │   └── services/     # Admin API clients
│   └── package.json
│
├── backend/              # PSR-4 PHP 8.2+ REST API Engine
│   ├── app/
│   │   ├── Config/       # Business rules & application configuration
│   │   ├── Controllers/  # REST controllers (Storefront & Admin)
│   │   ├── Database/     # Schema (25+ tables), DB engine, Seeder
│   │   ├── Middleware/   # JWT Auth, Admin RBAC, CORS, Security Headers, Rate Limiting
│   │   ├── Services/     # OrderService, PaymentService, DeliveryService, NotificationService
│   │   └── Support/      # Router, Request, Response, Validator, Logger, Env, JWT
│   ├── public/           # Front controller (index.php) and Apache rewrite rules
│   ├── routes/           # API routes definition
│   ├── storage/          # System logs, audit logs, and installed.lock
│   └── tests/            # Automated test suite (run_tests.php)
│
└── deployment/           # Production deployment manuals & SQL schemas
    ├── HOSTINGER.md      # Hostinger hPanel complete deployment guide
    ├── DEPLOYMENT.md     # Production architecture and Apache setup
    ├── DATABASE_SETUP.md # MySQL & phpMyAdmin guide
    ├── RAZORPAY_SETUP.md # Payment gateway & webhook configuration
    ├── GOOGLE_LOGIN_SETUP.md # Google Cloud Console OAuth 2.0 guide
    ├── SMS_SETUP.md      # SMS gateway & DLT templates
    ├── DELIVERY_SETUP.md # Logistics & Delhi NCR serviceability
    ├── SECURITY_CHECKLIST.md # Launch security checklist
    ├── BACKUP.md         # Daily automated backups & disaster recovery
    ├── schema.sql        # 25+ table MySQL schema script
    └── seed_data.sql     # Initial protein snack catalog & coupons
```

---

## 🚀 Quick Start — Local Development

### 1. Run Automated Backend Tests
```bash
php backend/tests/run_tests.php
```
*Expected Output: `Passed: 11 / 11 (100%)`*

### 2. Start Backend API Server
```bash
cd backend
php -S localhost:8000 -t public
```

### 3. Start Public Customer Storefront
```bash
cd frontend
npm install
npm run dev
# Accessible at http://localhost:5173
```

### 4. Start Dedicated Admin Portal
```bash
cd admin
npm install
npm run dev
# Accessible at http://localhost:5174
```

---

## 🔒 Production Deployment on Hostinger

1. Read the step-by-step guides in [`deployment/HOSTINGER.md`](deployment/HOSTINGER.md) and [`deployment/DEPLOYMENT.md`](deployment/DEPLOYMENT.md).
2. Build both frontend applications (`npm run build` in `/frontend` and `/admin`).
3. Upload `frontend/dist/` to `public_html/` and `admin/dist/` to `public_html/admin/`.
4. Upload `backend/` to your API document root and set database credentials in `.env`.
5. Visit `https://admin.yourdomain.com/setup` to run the 3-Step Setup Wizard.

---

## 📜 License & Ownership
Copyright © 2026 OfficeFuel / Ghar Ka Market. All rights reserved.
