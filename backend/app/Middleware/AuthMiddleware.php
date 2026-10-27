<?php

namespace App\Middleware;

use App\Database\DB;
use App\Support\JWT;
use App\Support\Request;
use App\Support\Response;

class AuthMiddleware
{
    public function handle(Request $request): void
    {
        $token = $request->getBearerToken();
        if (!$token) {
            Response::unauthorized('Authentication token is required.');
            return;
        }

        $payload = JWT::decode($token);
        if (!$payload || empty($payload['sub']) || ($payload['type'] ?? '') !== 'customer') {
            Response::unauthorized('Invalid or expired authentication token.');
            return;
        }

        $user = DB::fetchOne("SELECT id, name, email, phone, status, is_admin, created_at FROM users WHERE id = :id", [
            'id' => $payload['sub']
        ]);

        if (!$user || $user['status'] !== 'active') {
            Response::unauthorized('User account is inactive or not found.');
            return;
        }

        $request->setUser($user);
    }
}
