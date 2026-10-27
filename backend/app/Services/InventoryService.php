<?php

namespace App\Services;

use App\Database\DB;
use App\Support\Logger;

class InventoryService
{
    /**
     * Check if requested quantities are available in stock
     */
    public static function checkStockAvailability(array $items): array
    {
        $unavailable = [];

        foreach ($items as $item) {
            $productId = $item['product_id'];
            $reqQty = (int)$item['quantity'];

            $inv = DB::fetchOne("SELECT p.name, i.stock_quantity FROM inventory i JOIN products p ON p.id = i.product_id WHERE i.product_id = :pid", [
                'pid' => $productId
            ]);

            if (!$inv || (int)$inv['stock_quantity'] < $reqQty) {
                $available = $inv ? (int)$inv['stock_quantity'] : 0;
                $unavailable[] = [
                    'product_id' => $productId,
                    'name' => $inv['name'] ?? 'Product #' . $productId,
                    'requested' => $reqQty,
                    'available' => $available
                ];
            }
        }

        return [
            'available' => empty($unavailable),
            'unavailable_items' => $unavailable
        ];
    }

    /**
     * Deduct Stock for placed order
     */
    public static function deductStockForOrder(int $orderId, array $items): void
    {
        foreach ($items as $item) {
            $productId = (int)$item['product_id'];
            $qty = (int)$item['quantity'];

            $inv = DB::fetchOne("SELECT stock_quantity, low_stock_threshold FROM inventory WHERE product_id = :pid", [
                'pid' => $productId
            ]);

            if ($inv) {
                $newStock = max(0, (int)$inv['stock_quantity'] - $qty);
                $isInStock = $newStock > 0 ? 1 : 0;

                DB::update('inventory', [
                    'stock_quantity' => $newStock,
                    'is_in_stock' => $isInStock,
                    'updated_at' => date('Y-m-d H:i:s')
                ], 'product_id = :pid', ['pid' => $productId]);

                DB::insert('inventory_logs', [
                    'product_id' => $productId,
                    'change_amount' => -$qty,
                    'new_stock_quantity' => $newStock,
                    'reason' => 'order_placed',
                    'reference_id' => (string)$orderId,
                    'created_at' => date('Y-m-d H:i:s')
                ]);

                if ($newStock <= (int)$inv['low_stock_threshold']) {
                    Logger::warning("Low stock alert for Product ID #{$productId}. Current stock: {$newStock}");
                }
            }
        }
    }

    /**
     * Manually adjust stock (Admin action)
     */
    public static function adjustStock(int $productId, int $newQuantity, string $reason, ?string $adminId = null): void
    {
        $inv = DB::fetchOne("SELECT stock_quantity FROM inventory WHERE product_id = :pid", ['pid' => $productId]);
        $currentStock = $inv ? (int)$inv['stock_quantity'] : 0;
        $diff = $newQuantity - $currentStock;

        if (!$inv) {
            DB::insert('inventory', [
                'product_id' => $productId,
                'stock_quantity' => $newQuantity,
                'low_stock_threshold' => 10,
                'is_in_stock' => $newQuantity > 0 ? 1 : 0,
                'updated_at' => date('Y-m-d H:i:s')
            ]);
        } else {
            DB::update('inventory', [
                'stock_quantity' => $newQuantity,
                'is_in_stock' => $newQuantity > 0 ? 1 : 0,
                'updated_at' => date('Y-m-d H:i:s')
            ], 'product_id = :pid', ['pid' => $productId]);
        }

        DB::insert('inventory_logs', [
            'product_id' => $productId,
            'change_amount' => $diff,
            'new_stock_quantity' => $newQuantity,
            'reason' => $reason,
            'reference_id' => $adminId ? "admin_{$adminId}" : 'manual',
            'created_at' => date('Y-m-d H:i:s')
        ]);
    }
}
