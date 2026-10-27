<?php

namespace App\Config;

use App\Support\Env;

class Config
{
    public static function app(): array
    {
        return [
            'name' => Env::get('APP_NAME', 'OfficeFuel'),
            'env' => Env::get('APP_ENV', 'production'),
            'debug' => (bool)Env::get('APP_DEBUG', false),
            'url' => Env::get('APP_URL', 'https://officefuel.in'),
            'api_url' => Env::get('API_URL', 'https://api.officefuel.in'),
            'frontend_url' => Env::get('FRONTEND_URL', 'https://www.officefuel.in'),
            'admin_url' => Env::get('ADMIN_URL', 'https://admin.officefuel.in'),
            'key' => Env::get('APP_KEY', 'officefuel_production_secret_key_default_2026_replace_in_env'),
        ];
    }

    public static function database(): array
    {
        return [
            'driver' => Env::get('DB_CONNECTION', 'mysql'),
            'host' => Env::get('DB_HOST', '127.0.0.1'),
            'port' => (int)Env::get('DB_PORT', 3306),
            'database' => Env::get('DB_DATABASE', 'officefuel_db'),
            'username' => Env::get('DB_USERNAME', 'root'),
            'password' => Env::get('DB_PASSWORD', ''),
            'charset' => 'utf8mb4',
            'sqlite_path' => Env::get('DB_SQLITE_PATH', __DIR__ . '/../../storage/database.sqlite'),
        ];
    }

    public static function razorpay(): array
    {
        return [
            'key_id' => Env::get('RAZORPAY_KEY_ID', ''),
            'key_secret' => Env::get('RAZORPAY_KEY_SECRET', ''),
            'webhook_secret' => Env::get('RAZORPAY_WEBHOOK_SECRET', ''),
            'is_configured' => !empty(Env::get('RAZORPAY_KEY_ID')) && !empty(Env::get('RAZORPAY_KEY_SECRET')),
        ];
    }

    public static function google(): array
    {
        return [
            'client_id' => Env::get('GOOGLE_CLIENT_ID', ''),
            'client_secret' => Env::get('GOOGLE_CLIENT_SECRET', ''),
            'redirect_uri' => Env::get('GOOGLE_REDIRECT_URI', ''),
            'is_configured' => !empty(Env::get('GOOGLE_CLIENT_ID')),
        ];
    }

    public static function mail(): array
    {
        return [
            'driver' => Env::get('MAIL_MAILER', 'smtp'),
            'host' => Env::get('MAIL_HOST', 'smtp.hostinger.com'),
            'port' => (int)Env::get('MAIL_PORT', 587),
            'username' => Env::get('MAIL_USERNAME', ''),
            'password' => Env::get('MAIL_PASSWORD', ''),
            'encryption' => Env::get('MAIL_ENCRYPTION', 'tls'),
            'from_address' => Env::get('MAIL_FROM_ADDRESS', 'orders@officefuel.in'),
            'from_name' => Env::get('MAIL_FROM_NAME', 'OfficeFuel'),
            'is_configured' => !empty(Env::get('MAIL_USERNAME')) && !empty(Env::get('MAIL_PASSWORD')),
        ];
    }

    public static function sms(): array
    {
        return [
            'provider' => Env::get('SMS_PROVIDER', 'msg91'), // msg91 | twilio | none
            'auth_key' => Env::get('SMS_AUTH_KEY', ''),
            'sender_id' => Env::get('SMS_SENDER_ID', 'OFFCFL'),
            'template_id' => Env::get('SMS_TEMPLATE_ID', ''),
            'is_configured' => !empty(Env::get('SMS_AUTH_KEY')),
        ];
    }

    public static function delivery(): array
    {
        return [
            'provider' => Env::get('DELIVERY_PROVIDER', 'shiprocket'), // shiprocket | delhivery | internal
            'email' => Env::get('DELIVERY_API_EMAIL', ''),
            'password' => Env::get('DELIVERY_API_PASSWORD', ''),
            'token' => Env::get('DELIVERY_API_TOKEN', ''),
            'is_configured' => !empty(Env::get('DELIVERY_API_TOKEN')) || (!empty(Env::get('DELIVERY_API_EMAIL')) && !empty(Env::get('DELIVERY_API_PASSWORD'))),
        ];
    }
}
