# OfficeFuel / Ghar Ka Market — Production Deployment Guide

This guide details the complete deployment process for **OfficeFuel / Ghar Ka Market** across single-domain or multi-subdomain architectures on **Hostinger Shared Hosting** (or any Apache/PHP 8.2+ MySQL hosting environment).

---

## Architecture Overview

OfficeFuel is built with a decoupled architecture:
1. **Public Customer Frontend (`/frontend`)**: React 18 + Vite SPA compiled into static HTML/CSS/JS. Zero admin links or credentials.
2. **Dedicated Admin Panel (`/admin`)**: React 18 + Vite SPA compiled into static HTML/CSS/JS for store operators and staff.
3. **Backend API (`/backend`)**: Modern PSR-4 PHP 8.2+ REST API with PDO MySQL, JWT authentication, server-side pricing calculation, Razorpay webhook handling, and transactional notifications.

---

## Deployment Topologies

You can deploy OfficeFuel in either of two topologies:

### Topology A: Multi-Subdomain (Recommended)
- **Customer Storefront**: `https://officefuel.in` or `https://gharkamarket.com`
- **Admin Dashboard**: `https://admin.officefuel.in`
- **Backend API**: `https://api.officefuel.in`

### Topology B: Single Domain with Subdirectories
- **Customer Storefront**: `https://officefuel.in/`
- **Admin Dashboard**: `https://officefuel.in/admin-portal/`
- **Backend API**: `https://officefuel.in/api/`

---

## Step-by-Step Deployment (Topology A: Subdomains)

### 1. Build Frontend & Admin SPAs Locally
Before uploading, build the production assets locally:

```bash
# In /frontend
npm install
npm run build
# Creates optimized files in /frontend/dist/

# In /admin
npm install
npm run build
# Creates optimized files in /admin/dist/
```

### 2. Configure Subdomains in Hostinger hPanel
1. Log in to Hostinger hPanel.
2. Navigate to **Domains** → **Subdomains**.
3. Create:
   - `api` → Document root: `public_html/api`
   - `admin` → Document root: `public_html/admin`
4. Enable **Free SSL / Let's Encrypt** for the main domain and both subdomains.

### 3. Deploy Backend API (`api.officefuel.in`)
1. In Hostinger File Manager, open `public_html/api/`.
2. Upload the contents of the `backend/` directory.
3. Create your `.env` file in the backend root directory (copy from `backend/.env.example`):
   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://api.officefuel.in
   FRONTEND_URL=https://officefuel.in
   ADMIN_URL=https://admin.officefuel.in

   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_DATABASE=u123456_officefuel
   DB_USERNAME=u123456_ofuser
   DB_PASSWORD=YourStrongDatabasePassword123!

   JWT_SECRET=generate_a_64_character_random_hex_string_here
   ```
4. Set directory permissions:
   - `storage/` → `755` (must be writable for logs and setup locks)
   - `storage/logs/` → `755`

### 5. Deploy Customer Storefront (`officefuel.in`)
1. Upload the contents of `frontend/dist/` into `public_html/`.
2. Ensure the `.htaccess` file for SPA routing is in `public_html/`:
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
3. Set your production frontend `.env` before building:
   ```env
   VITE_API_BASE_URL=https://api.officefuel.in/api
   VITE_RAZORPAY_KEY_ID=rzp_live_your_actual_key
   ```

### 6. Deploy Admin Portal (`admin.officefuel.in`)
1. Upload the contents of `admin/dist/` into `public_html/admin/`.
2. Place the same `.htaccess` SPA router in `public_html/admin/`.
3. Set your production admin `.env` before building:
   ```env
   VITE_API_BASE_URL=https://api.officefuel.in/api
   ```

---

## Initial Database & Admin Provisioning

1. Go to `https://admin.officefuel.in/setup` (or `https://officefuel.in/admin-portal/setup`).
2. Complete the **3-Step Setup Wizard**:
   - **Step 1**: Test Database Connection & automatically migrate 25+ schema tables.
   - **Step 2**: Create Master Super-Admin Account (`admin@officefuel.in`).
   - **Step 3**: Optional Sample Data Seeding (Protein snacks, categories, starter coupons).
3. Upon completion, the system writes `storage/installed.lock` to permanently disable public setup access.

---

## File Permission & Security Rules

| Directory / File | Recommended Permissions | Description |
|---|---|---|
| `backend/.env` | `600` or `640` | Secret environment variables |
| `backend/storage/` | `755` | Logs and file lock directory |
| `backend/storage/logs/*.log` | `644` | System audit and error logs |
| `public_html/` | `755` | Public static HTML/CSS/JS assets |
| `*.php` files | `644` | Backend executable PHP scripts |
