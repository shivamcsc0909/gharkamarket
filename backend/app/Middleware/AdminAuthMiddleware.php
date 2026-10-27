<?php

namespace App\Middleware;

use App\Database\DB;
use App\Support\JWT;
use App\Support\Request;
use App\Support\Response;

class AdminAuthMiddleware
{
    private array $allowedRoles;

    public function __construct(array $allowedRoles = [])
    {
        $this->allowedRoles = $allowedRoles;
    }

    public function handle(Request $request): void
    {
        $token = $request->getBearerToken();
        if (!$token) {
            Response::unauthorized('Admin authentication required.');
            return;
        }

        $payload = JWT::decode($token);
        if (!$payload || empty($payload['sub']) || ($payload['type'] ?? '') !== 'admin') {
            Response::unauthorized('Invalid or expired admin session token.');
            return;
        }

        $admin = DB::fetchOne("SELECT id, name, email, role, status, created_at FROM admin_users WHERE id = :id", [
            'id' => $payload['sub']
        ]);

        if (!$admin || $admin['status'] !== 'active') {
            Response::unauthorized('Admin user not found or account deactivated.');
            return;
        }

        if (!empty($this->allowedRoles) && !in_array($admin['role'], $this->allowedRoles, true)) {
            Response::forbidden('You do not have permission to access this administrative resource.');
            return;
        }

        $request->setUser($admin);
        $request->setAttribute('is_admin', true);
        $request->setAttribute('admin_role', $admin['role']);
    }
}
