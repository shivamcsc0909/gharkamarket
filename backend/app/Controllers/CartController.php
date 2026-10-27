<?php

namespace App\Controllers;

use App\Config\BusinessConfig;
use App\Database\DB;
use App\Services\CouponService;
use App\Services\DeliveryService;
use App\Support\Request;
use App\Support\Response;
use App\Support\Validator;

class CartController
{
    /**
     * Calculate and Validate Cart with Strict Server-Side Prices
     */
    public function calculate(Request $request): void
    {
        $v = Validator::make($request->all(), [
            'items' => 'required|array'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $rawItems = $request->input('items', []);
        $couponCode = $request->input('coupon_code');
        $pincode = $request->input('pincode', '');
        $user = $request->getUser();
        $userId = $user ? (int)$user['id'] : null;

        $business = BusinessConfig::get();
        $subtotal = 0.0;
        $totalSavings = 0.0;
        $calculatedItems = [];

        foreach ($rawItems as $raw) {
            $productId = (int)($raw['product_id'] ?? 0);
            $qty = max(1, (int)($raw['quantity'] ?? 1));

            $product = DB::fetchOne(
                "SELECT p.*, i.stock_quantity, i.is_in_stock
                 FROM products p
                 LEFT JOIN inventory i ON i.product_id = p.id
                 WHERE p.id = :id AND p.status = 'active'",
                ['id' => $productId]
            );

            if (!$product) continue;

            $unitPrice = (float)$product['selling_price'];
            $mrp = (float)$product['mrp'];
            $lineTotal = round($unitPrice * $qty, 2);
            $savings = round(max(0, ($mrp - $unitPrice) * $qty), 2);

            $subtotal += $lineTotal;
            $totalSavings += $savings;

            $img = DB::fetchOne("SELECT image_url FROM product_images WHERE product_id = :pid ORDER BY is_primary DESC LIMIT 1", ['pid' => $product['id']]);

            $calculatedItems[] = [
                'product_id' => $product['id'],
                'name' => $product['name'],
                'slug' => $product['slug'],
                'sku' => $product['sku'],
                'weight' => $product['weight'],
                'protein' => $product['protein'],
                'mrp' => $mrp,
                'unit_price' => $unitPrice,
                'quantity' => $qty,
                'total_price' => $lineTotal,
                'image_url' => $img['image_url'] ?? 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80',
                'stock_available' => (int)($product['stock_quantity'] ?? 0),
                'is_in_stock' => (bool)($product['is_in_stock'] ?? true)
            ];
        }

        // Apply Coupon
        $couponResult = null;
        $discountAmount = 0.0;
        if (!empty($couponCode)) {
            $couponValidation = CouponService::validate($couponCode, $subtotal, $userId);
            if ($couponValidation['valid']) {
                $couponResult = $couponValidation['coupon'];
                $discountAmount = $couponResult['discount_amount'];
            } else {
                $couponResult = [
                    'valid' => false,
                    'message' => $couponValidation['message']
                ];
            }
        }

        $subtotalAfterDiscount = max(0.0, $subtotal - $discountAmount);
        $shippingCharge = DeliveryService::calculateShippingCharge($subtotalAfterDiscount, $pincode);
        $taxPercentage = $business['commerce']['tax_percentage'];
        $taxAmount = round(($subtotalAfterDiscount * $taxPercentage) / (100.0 + $taxPercentage), 2);
        $grandTotal = round($subtotalAfterDiscount + $shippingCharge, 2);

        Response::success([
            'items' => $calculatedItems,
            'item_count' => array_sum(array_column($calculatedItems, 'quantity')),
            'subtotal' => $subtotal,
            'total_savings' => $totalSavings + $discountAmount,
            'coupon' => $couponResult,
            'discount_amount' => $discountAmount,
            'shipping_charge' => $shippingCharge,
            'free_shipping_threshold' => $business['commerce']['free_shipping_threshold'],
            'amount_needed_for_free_shipping' => max(0.0, $business['commerce']['free_shipping_threshold'] - $subtotalAfterDiscount),
            'tax_amount' => $taxAmount,
            'tax_percentage' => $taxPercentage,
            'total_amount' => $grandTotal,
            'currency' => $business['commerce']['currency'],
            'currency_symbol' => $business['commerce']['currency_symbol']
        ]);
    }

    /**
     * Validate Coupon Endpoint
     */
    public function validateCoupon(Request $request): void
    {
        $v = Validator::make($request->all(), [
            'code' => 'required',
            'subtotal' => 'required|numeric'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $user = $request->getUser();
        $userId = $user ? (int)$user['id'] : null;
        $code = $request->input('code');
        $subtotal = (float)$request->input('subtotal');

        $result = CouponService::validate($code, $subtotal, $userId);
        if (!$result['valid']) {
            Response::error($result['message'], ['coupon' => [$result['message']]], 422);
            return;
        }

        Response::success($result['coupon'], $result['message']);
    }
}
