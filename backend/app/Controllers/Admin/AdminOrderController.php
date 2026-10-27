<?php

namespace App\Controllers\Admin;

use App\Database\DB;
use App\Services\AuditLogService;
use App\Services\DeliveryService;
use App\Services\NotificationService;
use App\Support\Request;
use App\Support\Response;
use App\Support\Validator;

class AdminOrderController
{
    /**
     * List Orders with Status Filter & Search
     */
    public function index(Request $request): void
    {
        $status = $request->query('status');
        $paymentStatus = $request->query('payment_status');
        $search = $request->query('search');
        $page = max(1, (int)$request->query('page', 1));
        $limit = max(1, min(100, (int)$request->query('limit', 20)));
        $offset = ($page - 1) * $limit;

        $where = ['1=1'];
        $params = [];

        if (!empty($status)) {
            $where[] = "o.order_status = :status";
            $params['status'] = $status;
        }

        if (!empty($paymentStatus)) {
            $where[] = "o.payment_status = :pstatus";
            $params['pstatus'] = $paymentStatus;
        }

        if (!empty($search)) {
            $where[] = "(o.order_number LIKE :s OR o.customer_name LIKE :s OR o.customer_email LIKE :s OR o.customer_phone LIKE :s)";
            $params['s'] = '%' . $search . '%';
        }

        $whereSql = implode(' AND ', $where);

        $totalRow = DB::fetchOne("SELECT COUNT(*) as c FROM orders o WHERE {$whereSql}", $params);
        $total = (int)($totalRow['c'] ?? 0);

        $orders = DB::fetchAll(
            "SELECT o.*
             FROM orders o
             WHERE {$whereSql}
             ORDER BY o.id DESC
             LIMIT {$limit} OFFSET {$offset}",
            $params
        );

        foreach ($orders as &$o) {
            $o['shipping_address'] = json_decode($o['shipping_address'] ?? '{}', true);
            $items = DB::fetchAll("SELECT product_name, product_sku, unit_price, quantity, total_price FROM order_items WHERE order_id = :oid", ['oid' => $o['id']]);
            $o['items'] = $items;
            $o['item_count'] = array_sum(array_column($items, 'quantity'));
        }

        Response::success($orders, 'Orders retrieved.', 200, [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ]);
    }

    /**
     * Show Order Detail with status timeline and tracking
     */
    public function show(Request $request, array $params): void
    {
        $id = (int)$params['id'];
        $order = DB::fetchOne("SELECT * FROM orders WHERE id = :id", ['id' => $id]);

        if (!$order) {
            Response::notFound('Order not found.');
            return;
        }

        $order['shipping_address'] = json_decode($order['shipping_address'] ?? '{}', true);
        $order['items'] = DB::fetchAll("SELECT * FROM order_items WHERE order_id = :oid", ['oid' => $order['id']]);
        $order['status_history'] = DB::fetchAll("SELECT * FROM order_status_history WHERE order_id = :oid ORDER BY id ASC", ['oid' => $order['id']]);
        $order['payment_record'] = DB::fetchOne("SELECT * FROM payments WHERE order_id = :oid", ['oid' => $order['id']]);
        $order['tracking'] = DeliveryService::getTrackingInfo($order);

        Response::success($order);
    }

    /**
     * Update Order Status (Confirmed, Preparing, Ready, Out for Delivery, Delivered, Cancelled)
     */
    public function updateStatus(Request $request, array $params): void
    {
        $id = (int)$params['id'];
        $v = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,preparing,ready,out_for_delivery,delivered,cancelled,refunded'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $newStatus = $request->input('status');
        $comment = $request->input('comment', "Status updated to {$newStatus} by admin");

        $order = DB::fetchOne("SELECT * FROM orders WHERE id = :id", ['id' => $id]);
        if (!$order) {
            Response::notFound('Order not found.');
            return;
        }

        $fromStatus = $order['order_status'];

        DB::transaction(function () use ($id, $fromStatus, $newStatus, $comment, $request) {
            DB::update('orders', [
                'order_status' => $newStatus,
                'updated_at' => date('Y-m-d H:i:s')
            ], 'id = :id', ['id' => $id]);

            $admin = $request->getUser();
            $adminName = $admin['name'] ?? 'Admin';

            DB::insert('order_status_history', [
                'order_id' => $id,
                'from_status' => $fromStatus,
                'to_status' => $newStatus,
                'comment' => $comment,
                'created_by' => $adminName,
                'created_at' => date('Y-m-d H:i:s')
            ]);
        });

        AuditLogService::log('order_status_updated', 'orders', (string)$id, [
            'from' => $fromStatus,
            'to' => $newStatus,
            'order_number' => $order['order_number']
        ], $request);

        // Notify customer on key milestones
        if (in_array($newStatus, ['out_for_delivery', 'delivered'], true)) {
            NotificationService::sendSms(
                $order['customer_phone'],
                "OfficeFuel: Your order #{$order['order_number']} is now {$newStatus}! Track on officefuel.in"
            );
        }

        Response::success(null, "Order status updated to '{$newStatus}'.");
    }

    /**
     * Update Shipment Tracking Info
     */
    public function updateTracking(Request $request, array $params): void
    {
        $id = (int)$params['id'];
        $v = Validator::make($request->all(), [
            'tracking_number' => 'required',
            'delivery_provider' => 'required'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        DB::update('orders', [
            'tracking_number' => trim($request->input('tracking_number')),
            'delivery_provider' => trim($request->input('delivery_provider')),
            'tracking_url' => $request->input('tracking_url'),
            'updated_at' => date('Y-m-d H:i:s')
        ], 'id = :id', ['id' => $id]);

        AuditLogService::log('order_tracking_updated', 'orders', (string)$id, [
            'tracking_number' => $request->input('tracking_number')
        ], $request);

        Response::success(null, 'Tracking details updated successfully.');
    }
}
