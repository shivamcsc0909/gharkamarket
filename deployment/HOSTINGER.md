# Hostinger Shared Hosting Deployment Guide

This guide walks you through deploying **OfficeFuel / Ghar Ka Market** on Hostinger Shared Hosting (Business / Premium Shared Hosting with PHP 8.2+ and MySQL).

---

## Architecture on Hostinger

Hostinger Shared Hosting allows either a **Subdomain layout** (Recommended) or a **Unified Single Domain layout**.

### Recommended Subdomain Layout

| Domain / URL | Hostinger Document Root | Application |
|---|---|---|
| `https://www.yourdomain.com` | `public_html` | Customer Frontend (React static build) |
| `https://admin.yourdomain.com` | `domains/yourdomain.com/public_html/admin` or subdomain root | Admin Panel (React static build) |
| `https://api.yourdomain.com` | `domains/yourdomain.com/public_html/api` or subdomain root -> `backend/public` | PHP REST API Front Controller |

---

## Step 1: Database Setup in Hostinger hPanel

1. Log in to **Hostinger hPanel**.
2. Navigate to **Databases** → **Management**.
3. Create a new MySQL Database:
   - **Database Name**: `u123456789_officefuel`
   - **Username**: `u123456789_dbuser`
   - **Password**: `YourStrongPassword123!`
4. Click **Enter phpMyAdmin**.
5. Select the new database, click **Import**, and choose `deployment/schema.sql`.
6. Click **Import** again and choose `deployment/seed_data.sql`.

---

## Step 2: Configure Backend Environment

1. Navigate to **File Manager** in hPanel.
2. Upload the `backend/` folder outside the public web root (e.g. at `/home/u123456789/backend` or in a subfolder).
3. Duplicate `backend/.env.example` to `backend/.env` and update the database and key parameters:

```env
APP_NAME="OfficeFuel"
APP_ENV="production"
APP_DEBUG=false
APP_URL="https://yourdomain.com"
API_URL="https://api.yourdomain.com"
FRONTEND_URL="https://www.yourdomain.com"
ADMIN_URL="https://admin.yourdomain.com"
APP_KEY="generate_a_random_64_character_hex_key"
JWT_SECRET="generate_a_random_jwt_secret_key"

# Database Configuration (Hostinger MySQL)
DB_CONNECTION="mysql"
DB_HOST="127.0.0.1"
DB_PORT=3306
DB_DATABASE="u123456789_officefuel"
DB_USERNAME="u123456789_dbuser"
DB_PASSWORD="YourStrongPassword123!"

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# Hostinger SMTP Mail
MAIL_MAILER="smtp"
MAIL_HOST="smtp.hostinger.com"
MAIL_PORT=587
MAIL_USERNAME="orders@yourdomain.com"
MAIL_PASSWORD="your_email_password"
MAIL_ENCRYPTION="tls"
MAIL_FROM_ADDRESS="orders@yourdomain.com"
MAIL_FROM_NAME="OfficeFuel"
```

---

## Step 3: Build & Upload Customer Frontend

1. On your local machine, run:
   ```bash
   cd frontend
   npm run build
   ```
2. Upload the contents of `frontend/dist/` directly into your main website's `public_html/` folder.
3. Ensure `.htaccess` is present in `public_html/` to support SPA routing:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Step 4: Build & Upload Admin Dashboard

1. On your local machine, run:
   ```bash
   cd admin
   npm run build
   ```
2. In Hostinger hPanel, create a subdomain: `admin.yourdomain.com`.
3. Upload the contents of `admin/dist/` into the document root of `admin.yourdomain.com`.
4. Ensure `.htaccess` is present in the admin directory for client-side routing.

---

## Step 5: Initial Super Admin Setup

1. Open your browser and navigate to:
   ```
   https://admin.yourdomain.com
   ```
2. The initial **First Deployment Setup Wizard** will automatically appear if no admin exists.
3. Enter the Super Admin Full Name, Email, and Password.
4. Click **Initialize & Lock Setup Wizard**.
5. The setup wizard creates your Super Admin account and writes the file lock `backend/storage/installed.lock`, permanently closing the setup endpoint for security.
