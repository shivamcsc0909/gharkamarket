<?php

namespace App\Controllers\Admin;

use App\Database\DB;
use App\Services\AuditLogService;
use App\Support\JWT;
use App\Support\Request;
use App\Support\Response;
use App\Support\Validator;

class AdminAuthController
{
    /**
     * Admin Dedicated Login
     */
    public function login(Request $request): void
    {
        $v = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $email = strtolower(trim($request->input('email')));
        $admin = DB::fetchOne("SELECT * FROM admin_users WHERE email = :email", ['email' => $email]);

        if (!$admin || !password_verify($request->input('password'), $admin['password_hash'])) {
            AuditLogService::log('admin_login_failed', 'admin_users', null, ['email' => $email], $request);
            Response::unauthorized('Invalid administrative credentials.');
            return;
        }

        if ($admin['status'] !== 'active') {
            Response::forbidden('Administrative account is disabled.');
            return;
        }

        DB::update('admin_users', ['last_login_at' => date('Y-m-d H:i:s')], 'id = :id', ['id' => $admin['id']]);

        $token = JWT::encode([
            'sub' => $admin['id'],
            'email' => $admin['email'],
            'role' => $admin['role'],
            'type' => 'admin'
        ], 86400 * 7);

        AuditLogService::log('admin_login_success', 'admin_users', (string)$admin['id'], ['email' => $admin['email']], $request);

        unset($admin['password_hash']);

        Response::success([
            'admin' => $admin,
            'token' => $token
        ], 'Admin logged in successfully.');
    }

    /**
     * Get Current Admin Profile & Permissions
     */
    public function me(Request $request): void
    {
        $admin = $request->getUser();
        Response::success($admin);
    }
}
