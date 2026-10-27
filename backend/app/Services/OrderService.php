<?php

namespace App\Services;

use App\Config\BusinessConfig;
use App\Database\DB;

class OrderService
{
    /**
     * Generate Next Deterministic Order ID (e.g. OF-2026-000001)
     */
    public static function generateOrderNumber(): string
    {
        $year = date('Y');
        $lastOrder = DB::fetchOne("SELECT id FROM orders ORDER BY id DESC LIMIT 1");
        $nextNum = ($lastOrder ? (int)$lastOrder['id'] : 0) + 1;
        return sprintf("OF-%s-%06d", $year, $nextNum);
    }

    /**
     * Create Order with Strict Server-Side Validation and Calculations
     */
    public static function createOrder(
        ?int $userId,
        string $customerName,
        string $customerEmail,
        string $customerPhone,
        array $shippingAddress,
        array $cartItems,
        ?string $couponCode = null,
        ?string $notes = null
    ): array {
        return DB::transaction(function () use (
            $userId, $customerName, $customerEmail, $customerPhone,
            $shippingAddress, $cartItems, $couponCode, $notes
        ) {
            $business = BusinessConfig::get();

            // 1. Validate Stock Availability
            $stockCheck = InventoryService::checkStockAvailability($cartItems);
            if (!$stockCheck['available']) {
                $itemNames = array_map(fn($i) => $i['name'], $stockCheck['unavailable_items']);
                throw new \InvalidArgumentException('Some items are out of stock or have insufficient quantity: ' . implode(', ', $itemNames));
            }

            // 2. Fetch Verified Product Prices and Calculate Subtotal Server-Side
            $subtotal = 0.0;
            $validatedItems = [];

            foreach ($cartItems as $item) {
                $productId = (int)$item['product_id'];
                $quantity = max(1, (int)$item['quantity']);

                $product = DB::fetchOne("SELECT id, sku, name, selling_price, status FROM products WHERE id = :id", ['id' => $productId]);
                if (!$product || $product['status'] !== 'active') {
                    throw new \InvalidArgumentException("Product #{$productId} is currently unavailable.");
                }

                $unitPrice = (float)$product['selling_price'];
                $lineTotal = round($unitPrice * $quantity, 2);
                $subtotal += $lineTotal;

                $validatedItems[] = [
                    'product_id' => $product['id'],
                    'product_sku' => $product['sku'],
                    'product_name' => $product['name'],
                    'unit_price' => $unitPrice,
                    'quantity' => $quantity,
                    'total_price' => $lineTotal
                ];
            }

            // 3. Apply Coupon if provided
            $discountAmount = 0.0;
            $appliedCoupon = null;
            if (!empty($couponCode)) {
                $couponRes = CouponService::validate($couponCode, $subtotal, $userId);
                if ($couponRes['valid']) {
                    $appliedCoupon = $couponRes['coupon'];
                    $discountAmount = $appliedCoupon['discount_amount'];
                }
            }

            $subtotalAfterDiscount = max(0.0, $subtotal - $discountAmount);

            // 4. Calculate Shipping Charge
            $pincode = $shippingAddress['pincode'] ?? '';
            $shippingCharge = DeliveryService::calculateShippingCharge($subtotalAfterDiscount, $pincode);

            // 5. Calculate Taxes (Included or Applicable GST)
            $taxPercentage = $business['commerce']['tax_percentage'];
            $taxAmount = round(($subtotalAfterDiscount * $taxPercentage) / (100.0 + $taxPercentage), 2); // GST inclusive calculation

            // 6. Calculate Grand Total
            $grandTotal = round($subtotalAfterDiscount + $shippingCharge, 2);

            // 7. Generate Order Number
            $orderNumber = self::generateOrderNumber();

            // 8. Insert Order
            $orderId = DB::insert('orders', [
                'order_number' => $orderNumber,
                'user_id' => $userId,
                'customer_name' => $customerName,
                'customer_email' => $customerEmail,
                'customer_phone' => $customerPhone,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'coupon_code' => $appliedCoupon['code'] ?? null,
                'shipping_charge' => $shippingCharge,
                'tax_amount' => $taxAmount,
                'total_amount' => $grandTotal,
                'payment_method' => 'razorpay',
                'payment_status' => 'pending',
                'order_status' => 'pending',
                'delivery_provider' => 'shiprocket',
                'shipping_address' => json_encode($shippingAddress, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'notes' => $notes,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]);

            // 9. Insert Order Items
            foreach ($validatedItems as $item) {
                DB::insert('order_items', [
                    'order_id' => $orderId,
                    'product_id' => $item['product_id'],
                    'product_sku' => $item['product_sku'],
                    'product_name' => $item['product_name'],
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'total_price' => $item['total_price'],
                    'created_at' => date('Y-m-d H:i:s')
                ]);
            }

            // 10. Record Initial Status History
            DB::insert('order_status_history', [
                'order_id' => $orderId,
                'from_status' => null,
                'to_status' => 'pending',
                'comment' => 'Order created and waiting for payment capture',
                'created_by' => 'customer',
                'created_at' => date('Y-m-d H:i:s')
            ]);

            // 11. Deduct Stock Reservation
            InventoryService::deductStockForOrder((int)$orderId, $validatedItems);

            // 12. Record Coupon Usage
            if ($appliedCoupon) {
                DB::insert('coupon_usages', [
                    'coupon_id' => $appliedCoupon['id'],
                    'order_id' => $orderId,
                    'user_id' => $userId,
                    'discount_applied' => $discountAmount,
                    'created_at' => date('Y-m-d H:i:s')
                ]);
                DB::query("UPDATE coupons SET used_count = used_count + 1 WHERE id = :id", ['id' => $appliedCoupon['id']]);
            }

            // 13. Create Razorpay Payment Session
            $paymentSession = PaymentService::createRazorpayOrder((int)$orderId, $grandTotal, $orderNumber);

            $order = DB::fetchOne("SELECT * FROM orders WHERE id = :id", ['id' => $orderId]);

            return [
                'order' => $order,
                'items' => $validatedItems,
                'payment' => $paymentSession
            ];
        });
    }
}
