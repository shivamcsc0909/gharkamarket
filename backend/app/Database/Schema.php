<?php

namespace App\Database;

class Schema
{
    public static function createTables(): void
    {
        $pdo = DB::getConnection();
        $isSqlite = $pdo->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'sqlite';

        $autoIncrement = $isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY';
        $idType = $isSqlite ? 'INTEGER' : 'BIGINT UNSIGNED';
        $timestamp = $isSqlite ? 'DATETIME DEFAULT CURRENT_TIMESTAMP' : 'DATETIME DEFAULT CURRENT_TIMESTAMP';
        $jsonType = $isSqlite ? 'TEXT' : 'JSON';

        $queries = [
            // Users & Profiles
            "CREATE TABLE IF NOT EXISTS users (
                id {$autoIncrement},
                name VARCHAR(150) NOT NULL,
                email VARCHAR(191) NOT NULL UNIQUE,
                phone VARCHAR(30) NULL,
                password_hash VARCHAR(255) NULL,
                status VARCHAR(30) DEFAULT 'active',
                is_admin TINYINT(1) DEFAULT 0,
                email_verified_at DATETIME NULL,
                last_login_at DATETIME NULL,
                created_at {$timestamp},
                updated_at DATETIME NULL
            )",

            "CREATE TABLE IF NOT EXISTS user_profiles (
                id {$autoIncrement},
                user_id {$idType} NOT NULL,
                avatar_url VARCHAR(255) NULL,
                dietary_preference VARCHAR(100) NULL,
                work_setting VARCHAR(100) NULL,
                created_at {$timestamp},
                updated_at DATETIME NULL
            )",

            "CREATE TABLE IF NOT EXISTS oauth_accounts (
                id {$autoIncrement},
                user_id {$idType} NOT NULL,
                provider VARCHAR(50) NOT NULL,
                provider_user_id VARCHAR(191) NOT NULL,
                avatar_url VARCHAR(255) NULL,
                created_at {$timestamp},
                UNIQUE(provider, provider_user_id)
            )",

            "CREATE TABLE IF NOT EXISTS addresses (
                id {$autoIncrement},
                user_id {$idType} NOT NULL,
                name VARCHAR(150) NOT NULL,
                phone VARCHAR(30) NOT NULL,
                address_line1 VARCHAR(255) NOT NULL,
                address_line2 VARCHAR(255) NULL,
                landmark VARCHAR(150) NULL,
                city VARCHAR(100) NOT NULL,
                state VARCHAR(100) NOT NULL,
                pincode VARCHAR(20) NOT NULL,
                address_type VARCHAR(30) DEFAULT 'home', -- home | work | other
                is_default TINYINT(1) DEFAULT 0,
                created_at {$timestamp},
                updated_at DATETIME NULL
            )",

            "CREATE TABLE IF NOT EXISTS password_resets (
                id {$autoIncrement},
                email VARCHAR(191) NOT NULL,
                token VARCHAR(100) NOT NULL,
                created_at {$timestamp},
                expires_at DATETIME NOT NULL
            )",

            // Product Catalog & Inventory
            "CREATE TABLE IF NOT EXISTS categories (
                id {$autoIncrement},
                name VARCHAR(150) NOT NULL,
                slug VARCHAR(191) NOT NULL UNIQUE,
                description TEXT NULL,
                image_url VARCHAR(255) NULL,
                display_order INT DEFAULT 0,
                is_active TINYINT(1) DEFAULT 1,
                created_at {$timestamp},
                updated_at DATETIME NULL
            )",

            "CREATE TABLE IF NOT EXISTS products (
                id {$autoIncrement},
                sku VARCHAR(100) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(191) NOT NULL UNIQUE,
                category_id {$idType} NOT NULL,
                short_description TEXT NULL,
                description TEXT NULL,
                mrp DECIMAL(10, 2) NOT NULL,
                selling_price DECIMAL(10, 2) NOT NULL,
                discount_percentage DECIMAL(5, 2) DEFAULT 0.0,
                weight VARCHAR(50) NOT NULL, -- e.g. 150g, 400g
                servings VARCHAR(50) NULL, -- e.g. 5 Servings
                protein VARCHAR(50) NULL, -- e.g. 18g Protein
                calories VARCHAR(50) NULL, -- e.g. 160 kcal
                ingredients TEXT NULL,
                allergens VARCHAR(255) NULL,
                is_featured TINYINT(1) DEFAULT 0,
                is_best_seller TINYINT(1) DEFAULT 0,
                status VARCHAR(30) DEFAULT 'active', -- active | inactive | archived
                tags VARCHAR(255) NULL, -- comma separated tags: office_snack, workout, high_protein
                meta_title VARCHAR(255) NULL,
                meta_description TEXT NULL,
                created_at {$timestamp},
                updated_at DATETIME NULL
            )",

            "CREATE TABLE IF NOT EXISTS product_images (
                id {$autoIncrement},
                product_id {$idType} NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                alt_text VARCHAR(255) NULL,
                display_order INT DEFAULT 0,
                is_primary TINYINT(1) DEFAULT 0,
                created_at {$timestamp}
            )",

            "CREATE TABLE IF NOT EXISTS product_nutrition (
                id {$autoIncrement},
                product_id {$idType} NOT NULL,
                serving_size VARCHAR(50) NOT NULL,
                protein_grams DECIMAL(6, 2) DEFAULT 0.0,
                total_calories DECIMAL(6, 2) DEFAULT 0.0,
                total_fat DECIMAL(6, 2) DEFAULT 0.0,
                saturated_fat DECIMAL(6, 2) DEFAULT 0.0,
                trans_fat DECIMAL(6, 2) DEFAULT 0.0,
                carbohydrates DECIMAL(6, 2) DEFAULT 0.0,
                dietary_fiber DECIMAL(6, 2) DEFAULT 0.0,
                added_sugars DECIMAL(6, 2) DEFAULT 0.0,
                sodium DECIMAL(6, 2) DEFAULT 0.0,
                created_at {$timestamp}
            )",

            "CREATE TABLE IF NOT EXISTS inventory (
                id {$autoIncrement},
                product_id {$idType} NOT NULL UNIQUE,
                stock_quantity INT NOT NULL DEFAULT 0,
                low_stock_threshold INT NOT NULL DEFAULT 10,
                is_in_stock TINYINT(1) DEFAULT 1,
                updated_at DATETIME NULL
            )",

            "CREATE TABLE IF NOT EXISTS inventory_logs (
                id {$autoIncrement},
                product_id {$idType} NOT NULL,
                change_amount INT NOT NULL,
                new_stock_quantity INT NOT NULL,
                reason VARCHAR(100) NOT NULL, -- order_placed | restock | manual_adjustment | order_cancelled
                reference_id VARCHAR(100) NULL, -- order_id or admin_user_id
                created_at {$timestamp}
            )",

            // Cart & Wishlist
            "CREATE TABLE IF NOT EXISTS carts (
                id {$autoIncrement},
                user_id {$idType} NULL,
                session_token VARCHAR(100) NOT NULL UNIQUE,
                created_at {$timestamp},
                updated_at DATETIME NULL
            )",

            "CREATE TABLE IF NOT EXISTS cart_items (
                id {$autoIncrement},
                cart_id {$idType} NOT NULL,
                product_id {$idType} NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                unit_price DECIMAL(10, 2) NOT NULL,
                created_at {$timestamp},
                updated_at DATETIME NULL
            )",

            "CREATE TABLE IF NOT EXISTS wishlists (
                id {$autoIncrement},
                user_id {$idType} NOT NULL,
                product_id {$idType} NOT NULL,
                created_at {$timestamp},
                UNIQUE(user_id, product_id)
            )",

            // Orders & Checkout
            "CREATE TABLE IF NOT EXISTS orders (
                id {$autoIncrement},
                order_number VARCHAR(100) NOT NULL UNIQUE, -- OF-2026-000001
                user_id {$idType} NULL,
                customer_name VARCHAR(150) NOT NULL,
                customer_email VARCHAR(191) NOT NULL,
                customer_phone VARCHAR(30) NOT NULL,
                subtotal DECIMAL(10, 2) NOT NULL,
                discount_amount DECIMAL(10, 2) DEFAULT 0.0,
                coupon_code VARCHAR(50) NULL,
                shipping_charge DECIMAL(10, 2) DEFAULT 0.0,
                tax_amount DECIMAL(10, 2) DEFAULT 0.0,
                total_amount DECIMAL(10, 2) NOT NULL,
                payment_method VARCHAR(50) DEFAULT 'razorpay', -- razorpay | cod
                payment_status VARCHAR(50) DEFAULT 'pending', -- pending | paid | failed | refunded
                order_status VARCHAR(50) DEFAULT 'pending', -- pending | confirmed | preparing | ready | out_for_delivery | delivered | cancelled | refunded
                delivery_provider VARCHAR(50) DEFAULT 'shiprocket',
                tracking_number VARCHAR(100) NULL,
                tracking_url VARCHAR(255) NULL,
                shipping_address {$jsonType} NOT NULL,
                notes TEXT NULL,
                created_at {$timestamp},
                updated_at DATETIME NULL
            )",

            "CREATE TABLE IF NOT EXISTS order_items (
                id {$autoIncrement},
                order_id {$idType} NOT NULL,
                product_id {$idType} NOT NULL,
                product_sku VARCHAR(100) NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                unit_price DECIMAL(10, 2) NOT NULL,
                quantity INT NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                created_at {$timestamp}
            )",

            "CREATE TABLE IF NOT EXISTS order_status_history (
                id {$autoIncrement},
                order_id {$idType} NOT NULL,
                from_status VARCHAR(50) NULL,
                to_status VARCHAR(50) NOT NULL,
                comment TEXT NULL,
                created_by VARCHAR(100) DEFAULT 'system',
                created_at {$timestamp}
            )",

            // Payments & Webhooks
            "CREATE TABLE IF NOT EXISTS payments (
                id {$autoIncrement},
                order_id {$idType} NOT NULL,
                gateway VARCHAR(50) DEFAULT 'razorpay',
                gateway_order_id VARCHAR(100) NULL,
                gateway_payment_id VARCHAR(100) NULL,
                gateway_signature VARCHAR(255) NULL,
                amount DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'INR',
                status VARCHAR(50) NOT NULL, -- created | authorized | captured | failed | refunded
                error_code VARCHAR(100) NULL,
                error_description TEXT NULL,
                raw_response {$jsonType} NULL,
                created_at {$timestamp},
                updated_at DATETIME NULL
            )",

            "CREATE TABLE IF NOT EXISTS payment_webhooks (
                id {$autoIncrement},
                event_id VARCHAR(191) NOT NULL UNIQUE,
                event_type VARCHAR(100) NOT NULL,
                payload {$jsonType} NOT NULL,
                status VARCHAR(30) DEFAULT 'processed',
                processed_at {$timestamp}
            )",

            // Coupons & Discounts
            "CREATE TABLE IF NOT EXISTS coupons (
                id {$autoIncrement},
                code VARCHAR(50) NOT NULL UNIQUE,
                discount_type VARCHAR(20) NOT NULL, -- percentage | fixed
                discount_value DECIMAL(10, 2) NOT NULL,
                min_order_amount DECIMAL(10, 2) DEFAULT 0.0,
                max_discount_amount DECIMAL(10, 2) NULL,
                usage_limit INT NULL,
                per_user_limit INT DEFAULT 1,
                used_count INT DEFAULT 0,
                start_date DATETIME NULL,
                end_date DATETIME NULL,
                is_active TINYINT(1) DEFAULT 1,
                created_at {$timestamp},
                updated_at DATETIME NULL
            )",

            "CREATE TABLE IF NOT EXISTS coupon_usages (
                id {$autoIncrement},
                coupon_id {$idType} NOT NULL,
                order_id {$idType} NOT NULL,
                user_id {$idType} NULL,
                discount_applied DECIMAL(10, 2) NOT NULL,
                created_at {$timestamp}
            )",

            // Corporate B2B & Contact
            "CREATE TABLE IF NOT EXISTS corporate_requests (
                id {$autoIncrement},
                company_name VARCHAR(200) NOT NULL,
                contact_person VARCHAR(150) NOT NULL,
                email VARCHAR(191) NOT NULL,
                phone VARCHAR(30) NOT NULL,
                employee_count VARCHAR(50) NOT NULL,
                snack_requirement VARCHAR(100) NOT NULL,
                estimated_budget VARCHAR(100) NULL,
                message TEXT NULL,
                status VARCHAR(50) DEFAULT 'new', -- new | contacted | in_progress | closed
                admin_notes TEXT NULL,
                created_at {$timestamp},
                updated_at DATETIME NULL
            )",

            "CREATE TABLE IF NOT EXISTS contact_requests (
                id {$autoIncrement},
                name VARCHAR(150) NOT NULL,
                email VARCHAR(191) NOT NULL,
                phone VARCHAR(30) NULL,
                subject VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'new', -- new | in_progress | resolved | closed
                admin_notes TEXT NULL,
                created_at {$timestamp},
                updated_at DATETIME NULL
            )",

            // Product Reviews
            "CREATE TABLE IF NOT EXISTS reviews (
                id {$autoIncrement},
                product_id {$idType} NOT NULL,
                user_id {$idType} NULL,
                customer_name VARCHAR(150) NOT NULL,
                rating INT NOT NULL, -- 1 to 5
                title VARCHAR(200) NULL,
                comment TEXT NOT NULL,
                is_verified_purchase TINYINT(1) DEFAULT 0,
                status VARCHAR(30) DEFAULT 'pending', -- pending | approved | rejected
                created_at {$timestamp}
            )",

            // Admin Users, RBAC & Audit Logs
            "CREATE TABLE IF NOT EXISTS admin_users (
                id {$autoIncrement},
                name VARCHAR(150) NOT NULL,
                email VARCHAR(191) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin', -- super_admin | admin | manager | support | order_manager
                status VARCHAR(30) DEFAULT 'active',
                last_login_at DATETIME NULL,
                created_at {$timestamp},
                updated_at DATETIME NULL
            )",

            "CREATE TABLE IF NOT EXISTS admin_audit_logs (
                id {$autoIncrement},
                admin_user_id {$idType} NULL,
                admin_email VARCHAR(191) NULL,
                action VARCHAR(100) NOT NULL,
                entity VARCHAR(100) NOT NULL,
                entity_id VARCHAR(100) NULL,
                ip_address VARCHAR(50) NULL,
                details {$jsonType} NULL,
                created_at {$timestamp}
            )",

            // Site Settings & Content
            "CREATE TABLE IF NOT EXISTS site_settings (
                id {$autoIncrement},
                setting_key VARCHAR(100) NOT NULL UNIQUE,
                setting_value TEXT NOT NULL,
                category VARCHAR(50) DEFAULT 'general',
                updated_at DATETIME NULL
            )"
        ];

        foreach ($queries as $sql) {
            $pdo->exec($sql);
        }
    }
}
