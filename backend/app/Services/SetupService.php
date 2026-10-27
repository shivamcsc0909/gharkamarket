<?php

namespace App\Services;

use App\Database\DB;
use App\Database\Schema;
use App\Database\Seeder;
use App\Support\JWT;
use App\Support\Logger;

class SetupService
{
    private static function getLockFilePath(): string
    {
        return __DIR__ . '/../../storage/installed.lock';
    }

    public static function isInstalled(): bool
    {
        if (file_exists(self::getLockFilePath())) {
            return true;
        }

        try {
            $adminCount = DB::fetchOne("SELECT COUNT(*) as c FROM admin_users");
            return $adminCount && (int)$adminCount['c'] > 0;
        } catch (\Throwable $e) {
            return false;
        }
    }

    public static function install(string $name, string $email, string $password): array
    {
        if (self::isInstalled()) {
            throw new \RuntimeException('System is already installed. Initial admin creation is locked for security.');
        }

        // Initialize schema and initial seed data
        Schema::createTables();
        Seeder::run();

        // Create Super Admin
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $adminId = DB::insert('admin_users', [
            'name' => trim($name),
            'email' => strtolower(trim($email)),
            'password_hash' => $passwordHash,
            'role' => 'super_admin',
            'status' => 'active',
            'last_login_at' => date('Y-m-d H:i:s'),
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        // Create lock file
        @file_put_contents(self::getLockFilePath(), "Installed at " . date('Y-m-d H:i:s') . "\nAdmin: {$email}\n");

        $admin = DB::fetchOne("SELECT id, name, email, role, status FROM admin_users WHERE id = :id", ['id' => $adminId]);
        
        $token = JWT::encode([
            'sub' => $admin['id'],
            'email' => $admin['email'],
            'role' => $admin['role'],
            'type' => 'admin'
        ], 86400 * 7);

        AuditLogService::log('admin_initial_setup', 'admin_users', (string)$adminId, [
            'email' => $admin['email'],
            'role' => $admin['role']
        ]);

        return [
            'admin' => $admin,
            'token' => $token
        ];
    }
}
