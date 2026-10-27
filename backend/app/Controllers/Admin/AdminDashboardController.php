<?php

namespace App\Controllers\Admin;

use App\Database\DB;
use App\Support\Request;
use App\Support\Response;

class AdminDashboardController
{
    /**
     * Real-time Admin Dashboard Metrics
     */
    public function stats(Request $request): void
    {
        $todayStart = date('Y-m-d 00:00:00');

        // Revenue stats
        $revTotal = DB::fetchOne("SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid'");
        $revToday = DB::fetchOne("SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid' AND created_at >= :today", ['today' => $todayStart]);

        // Order counts
        $ordersTotal = DB::fetchOne("SELECT COUNT(*) as c FROM orders");
        $ordersToday = DB::fetchOne("SELECT COUNT(*) as c FROM orders WHERE created_at >= :today", ['today' => $todayStart]);

        // Status counts
        $statuses = DB::fetchAll("SELECT order_status, COUNT(*) as count FROM orders GROUP BY order_status");
        $statusMap = [
            'pending' => 0,
            'confirmed' => 0,
            'preparing' => 0,
            'ready' => 0,
            'out_for_delivery' => 0,
            'delivered' => 0,
            'cancelled' => 0
        ];
        foreach ($statuses as $s) {
            $statusMap[$s['order_status']] = (int)$s['count'];
        }

        // Customer stats
        $usersTotal = DB::fetchOne("SELECT COUNT(*) as c FROM users WHERE is_admin = 0");
        $usersActive = DB::fetchOne("SELECT COUNT(*) as c FROM users WHERE is_admin = 0 AND status = 'active'");

        // Low stock products
        $lowStockRows = DB::fetchAll(
            "SELECT p.id, p.name, p.sku, i.stock_quantity, i.low_stock_threshold
             FROM products p
             JOIN inventory i ON i.product_id = p.id
             WHERE i.stock_quantity <= i.low_stock_threshold AND p.status = 'active'
             ORDER BY i.stock_quantity ASC
             LIMIT 5"
        );
        $lowStockCount = DB::fetchOne(
            "SELECT COUNT(*) as c FROM inventory i JOIN products p ON p.id = i.product_id WHERE i.stock_quantity <= i.low_stock_threshold AND p.status = 'active'"
        );

        // Corporate leads & contact enquiries
        $corpLeads = DB::fetchOne("SELECT COUNT(*) as c FROM corporate_requests WHERE status = 'new'");
        $contactReqs = DB::fetchOne("SELECT COUNT(*) as c FROM contact_requests WHERE status = 'new'");

        // Recent Orders
        $recentOrders = DB::fetchAll("SELECT id, order_number, customer_name, customer_email, total_amount, payment_status, order_status, created_at FROM orders ORDER BY id DESC LIMIT 5");

        Response::success([
            'metrics' => [
                'total_revenue' => (float)($revTotal['total'] ?? 0.0),
                'today_revenue' => (float)($revToday['total'] ?? 0.0),
                'total_orders' => (int)($ordersTotal['c'] ?? 0),
                'today_orders' => (int)($ordersToday['c'] ?? 0),
                'total_users' => (int)($usersTotal['c'] ?? 0),
                'active_users' => (int)($usersActive['c'] ?? 0),
                'low_stock_count' => (int)($lowStockCount['c'] ?? 0),
                'new_corporate_leads' => (int)($corpLeads['c'] ?? 0),
                'new_contact_requests' => (int)($contactReqs['c'] ?? 0),
                'status_breakdown' => $statusMap
            ],
            'low_stock_products' => $lowStockRows,
            'recent_orders' => $recentOrders
        ]);
    }
}
