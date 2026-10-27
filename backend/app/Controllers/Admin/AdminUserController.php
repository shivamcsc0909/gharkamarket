<?php

namespace App\Controllers\Admin;

use App\Database\DB;
use App\Services\AuditLogService;
use App\Support\Request;
use App\Support\Response;
use App\Support\Validator;

class AdminUserController
{
    /**
     * List Customers (never expose password hashes)
     */
    public function customers(Request $request): void
    {
        $search = $request->query('search');
        $where = ["u.is_admin = 0"];
        $params = [];

        if (!empty($search)) {
            $where[] = "(u.name LIKE :s OR u.email LIKE :s OR u.phone LIKE :s)";
            $params['s'] = '%' . $search . '%';
        }

        $users = DB::fetchAll(
            "SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at, u.last_login_at,
                    COUNT(o.id) as order_count,
                    COALESCE(SUM(o.total_amount), 0) as total_spend
             FROM users u
             LEFT JOIN orders o ON o.user_id = u.id AND o.payment_status = 'paid'
             WHERE " . implode(' AND ', $where) . "
             GROUP BY u.id
             ORDER BY u.id DESC
             LIMIT 100",
            $params
        );

        Response::success($users);
    }

    /**
     * Customer Profile & Orders detail
     */
    public function customerDetail(Request $request, array $params): void
    {
        $id = (int)$params['id'];
        $user = DB::fetchOne("SELECT id, name, email, phone, status, created_at, last_login_at FROM users WHERE id = :id", ['id' => $id]);
        if (!$user) {
            Response::notFound('User not found.');
            return;
        }

        $addresses = DB::fetchAll("SELECT * FROM addresses WHERE user_id = :uid", ['uid' => $id]);
        $orders = DB::fetchAll("SELECT id, order_number, total_amount, payment_status, order_status, created_at FROM orders WHERE user_id = :uid ORDER BY id DESC", ['uid' => $id]);

        Response::success([
            'user' => $user,
            'addresses' => $addresses,
            'orders' => $orders
        ]);
    }

    /**
     * List Admin Staff Accounts & Roles
     */
    public function admins(Request $request): void
    {
        $admins = DB::fetchAll("SELECT id, name, email, role, status, last_login_at, created_at FROM admin_users ORDER BY id ASC");
        Response::success($admins);
    }

    /**
     * Create Staff Admin User (Restricted to Super Admin)
     */
    public function createAdmin(Request $request): void
    {
        $currentRole = $request->getAttribute('admin_role');
        if ($currentRole !== 'super_admin') {
            Response::forbidden('Only Super Admin can create administrative staff accounts.');
            return;
        }

        $v = Validator::make($request->all(), [
            'name' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8',
            'role' => 'required|in:super_admin,admin,manager,support,order_manager'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $email = strtolower(trim($request->input('email')));
        $existing = DB::fetchOne("SELECT id FROM admin_users WHERE email = :e", ['e' => $email]);
        if ($existing) {
            Response::validationError(['email' => ['Admin with this email already exists.']]);
            return;
        }

        $id = DB::insert('admin_users', [
            'name' => trim($request->input('name')),
            'email' => $email,
            'password_hash' => password_hash($request->input('password'), PASSWORD_BCRYPT),
            'role' => $request->input('role'),
            'status' => 'active',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        AuditLogService::log('admin_staff_created', 'admin_users', (string)$id, ['email' => $email, 'role' => $request->input('role')], $request);

        Response::success(['id' => $id], 'Admin staff account created.', 201);
    }
}
