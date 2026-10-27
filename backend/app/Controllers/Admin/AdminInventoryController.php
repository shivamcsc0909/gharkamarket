<?php

namespace App\Controllers\Admin;

use App\Database\DB;
use App\Services\AuditLogService;
use App\Services\InventoryService;
use App\Support\Request;
use App\Support\Response;
use App\Support\Validator;

class AdminInventoryController
{
    /**
     * Inventory overview & stock levels
     */
    public function index(Request $request): void
    {
        $filter = $request->query('filter'); // all | low_stock | out_of_stock
        $search = $request->query('search');

        $where = ["p.status = 'active'"];
        $params = [];

        if ($filter === 'low_stock') {
            $where[] = "i.stock_quantity <= i.low_stock_threshold AND i.stock_quantity > 0";
        } elseif ($filter === 'out_of_stock') {
            $where[] = "i.stock_quantity = 0";
        }

        if (!empty($search)) {
            $where[] = "(p.name LIKE :s OR p.sku LIKE :s)";
            $params['s'] = '%' . $search . '%';
        }

        $whereSql = implode(' AND ', $where);

        $inventory = DB::fetchAll(
            "SELECT i.*, p.name as product_name, p.sku, p.selling_price, p.weight, c.name as category_name
             FROM inventory i
             JOIN products p ON p.id = i.product_id
             JOIN categories c ON c.id = p.category_id
             WHERE {$whereSql}
             ORDER BY i.stock_quantity ASC",
            $params
        );

        Response::success($inventory);
    }

    /**
     * Adjust Stock Quantity
     */
    public function adjust(Request $request): void
    {
        $v = Validator::make($request->all(), [
            'product_id' => 'required|integer',
            'stock_quantity' => 'required|integer|min:0',
            'reason' => 'required'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $productId = (int)$request->input('product_id');
        $newQty = (int)$request->input('stock_quantity');
        $reason = trim($request->input('reason'));
        $admin = $request->getUser();

        InventoryService::adjustStock($productId, $newQty, $reason, (string)$admin['id']);
        AuditLogService::log('inventory_adjusted', 'inventory', (string)$productId, [
            'new_quantity' => $newQty,
            'reason' => $reason
        ], $request);

        Response::success(null, 'Inventory updated successfully.');
    }

    /**
     * Inventory Movement Logs
     */
    public function logs(Request $request): void
    {
        $productId = $request->query('product_id');
        $where = ['1=1'];
        $params = [];

        if (!empty($productId)) {
            $where[] = "il.product_id = :pid";
            $params['pid'] = (int)$productId;
        }

        $whereSql = implode(' AND ', $where);

        $logs = DB::fetchAll(
            "SELECT il.*, p.name as product_name, p.sku
             FROM inventory_logs il
             JOIN products p ON p.id = il.product_id
             WHERE {$whereSql}
             ORDER BY il.id DESC
             LIMIT 50",
            $params
        );

        Response::success($logs);
    }
}
