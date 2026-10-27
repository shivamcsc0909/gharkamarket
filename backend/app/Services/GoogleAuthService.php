<?php

namespace App\Services;

use App\Config\Config;
use App\Database\DB;
use App\Support\Logger;

class GoogleAuthService
{
    /**
     * Verify Google ID token from Google TokenInfo endpoint
     */
    public static function verifyIdToken(string $idToken): ?array
    {
        $googleConfig = Config::google();
        $clientId = $googleConfig['client_id'];

        $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || !$response) {
            Logger::warning('Google token verification failed', ['http_code' => $httpCode]);
            return null;
        }

        $payload = json_decode($response, true);
        if (!$payload || empty($payload['sub']) || empty($payload['email'])) {
            return null;
        }

        // If client_id is set in production, enforce audience check
        if (!empty($clientId) && isset($payload['aud']) && $payload['aud'] !== $clientId) {
            Logger::warning('Google token audience mismatch', [
                'expected' => $clientId,
                'received' => $payload['aud'] ?? ''
            ]);
            return null;
        }

        return [
            'provider_user_id' => $payload['sub'],
            'email' => strtolower($payload['email']),
            'name' => $payload['name'] ?? explode('@', $payload['email'])[0],
            'avatar_url' => $payload['picture'] ?? null,
            'email_verified' => filter_var($payload['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN)
        ];
    }

    /**
     * Find or register customer using verified Google payload
     */
    public static function authenticateOrCreateUser(array $googleUser): array
    {
        return DB::transaction(function () use ($googleUser) {
            $email = $googleUser['email'];

            // 1. Check if OAuth account link already exists
            $oauth = DB::fetchOne(
                "SELECT user_id FROM oauth_accounts WHERE provider = 'google' AND provider_user_id = :puid",
                ['puid' => $googleUser['provider_user_id']]
            );

            if ($oauth) {
                $user = DB::fetchOne("SELECT * FROM users WHERE id = :id", ['id' => $oauth['user_id']]);
                if ($user) {
                    DB::update('users', [
                        'last_login_at' => date('Y-m-d H:i:s')
                    ], 'id = :id', ['id' => $user['id']]);

                    return $user;
                }
            }

            // 2. Check if user with same email exists
            $user = DB::fetchOne("SELECT * FROM users WHERE email = :email", ['email' => $email]);

            if (!$user) {
                // Register new user
                $userId = DB::insert('users', [
                    'name' => $googleUser['name'],
                    'email' => $email,
                    'phone' => null,
                    'password_hash' => null,
                    'status' => 'active',
                    'is_admin' => 0,
                    'email_verified_at' => date('Y-m-d H:i:s'),
                    'last_login_at' => date('Y-m-d H:i:s'),
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ]);

                // Create profile
                DB::insert('user_profiles', [
                    'user_id' => $userId,
                    'avatar_url' => $googleUser['avatar_url'],
                    'created_at' => date('Y-m-d H:i:s')
                ]);

                $user = DB::fetchOne("SELECT * FROM users WHERE id = :id", ['id' => $userId]);
            }

            // Link Google OAuth account if not linked
            $existingLink = DB::fetchOne(
                "SELECT id FROM oauth_accounts WHERE provider = 'google' AND provider_user_id = :puid",
                ['puid' => $googleUser['provider_user_id']]
            );

            if (!$existingLink) {
                DB::insert('oauth_accounts', [
                    'user_id' => $user['id'],
                    'provider' => 'google',
                    'provider_user_id' => $googleUser['provider_user_id'],
                    'avatar_url' => $googleUser['avatar_url'],
                    'created_at' => date('Y-m-d H:i:s')
                ]);
            }

            return $user;
        });
    }
}
