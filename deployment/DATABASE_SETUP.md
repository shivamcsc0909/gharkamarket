# Database Setup Guide — MySQL & Hostinger phpMyAdmin

OfficeFuel uses a high-performance, normalized MySQL schema with 25+ relational tables, foreign key constraints, UTF8mb4 encoding, and indexing optimized for rapid catalog lookups, cart sessions, and audit logs.

---

## Method 1: Automatic Setup via Admin Setup Wizard (Recommended)

1. Create a MySQL database and user in your hosting control panel (e.g., Hostinger hPanel → Databases → Management).
2. Note down:
   - Database Host: `localhost`
   - Database Name: e.g. `u123456_officefuel`
   - Database Username: e.g. `u123456_ofuser`
   - Database Password: e.g. `YourStrongPassword!123`
3. Put these credentials into `backend/.env`.
4. Open the Admin Setup Wizard in your browser:
   `https://admin.officefuel.in/setup`
5. Click **"Run Database Migrations"**. The backend `SetupController` will execute `Schema.php` and provision all 25+ tables.
6. Continue to Step 2 to create the master administrator account.

---

## Method 2: Manual Import via phpMyAdmin / MySQL CLI

If you prefer to import the SQL schema manually before launching the application:

### Step 1: Import Schema
1. Open **phpMyAdmin** in your hosting control panel.
2. Select your target database (`u123456_officefuel`).
3. Click the **Import** tab.
4. Choose the file: `deployment/schema.sql`.
5. Ensure character set is set to **utf8mb4**.
6. Click **Go / Import**.

### Step 2: (Optional) Import Seed / Demo Catalog Data
1. In the same database, go to the **Import** tab.
2. Choose the file: `deployment/seed_data.sql`.
3. Click **Go / Import**.
4. This loads:
   - Default master categories: *Protein Snacks, Makhana, Roasted Seeds, Trail Mixes, Energy Bars, Festive & Office Combos*.
   - 8 flagship high-protein products with full macro breakdowns (Protein, Fiber, Carbs, Fat, Calories), shelf-life, ingredients, and allergen info.
   - 3 active launch coupons: `FIRST10`, `FUEL20`, `BULK30`.
   - Default business and contact settings.

---

## Database Schema Tables Overview

| Table Group | Tables |
|---|---|
| **Users & Roles** | `users`, `user_addresses`, `admin_users`, `admin_roles`, `user_saved_cards`, `password_resets` |
| **Catalog & Nutrition** | `categories`, `products`, `product_variants`, `product_nutrition`, `product_images`, `product_tags` |
| **Cart & Orders** | `cart_sessions`, `cart_items`, `orders`, `order_items`, `order_status_history`, `order_notes` |
| **Payments & Coupons** | `payments`, `payment_refunds`, `coupons`, `coupon_usages` |
| **Corporate & Leads** | `corporate_inquiries`, `contact_messages`, `newsletter_subscribers` |
| **System & Audits** | `product_reviews`, `audit_logs`, `system_settings`, `notification_logs` |

---

## MySQL Performance Best Practices

1. **Character Set**: Always ensure `DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci` is used for full Indian multilingual and emoji support.
2. **InnoDB Engine**: All tables use `ENGINE=InnoDB` for ACID transaction safety during checkout, inventory deductions, and payment status updates.
3. **Foreign Keys**: Foreign keys with `ON DELETE CASCADE` or `ON DELETE SET NULL` maintain referential integrity.
