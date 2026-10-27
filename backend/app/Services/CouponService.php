<?php

namespace App\Services;

use App\Database\DB;

class CouponService
{
    public static function validate(string $code, float $cartSubtotal, ?int $userId = null): array
    {
        $code = strtoupper(trim($code));
        $coupon = DB::fetchOne("SELECT * FROM coupons WHERE code = :code AND is_active = 1", ['code' => $code]);

        if (!$coupon) {
            return [
                'valid' => false,
                'message' => 'Invalid or inactive coupon code.'
            ];
        }

        $now = date('Y-m-d H:i:s');
        if (!empty($coupon['start_date']) && $coupon['start_date'] > $now) {
            return ['valid' => false, 'message' => 'This coupon is not active yet.'];
        }

        if (!empty($coupon['end_date']) && $coupon['end_date'] < $now) {
            return ['valid' => false, 'message' => 'This coupon has expired.'];
        }

        if ($cartSubtotal < (float)$coupon['min_order_amount']) {
            return [
                'valid' => false,
                'message' => "Minimum order of ₹{$coupon['min_order_amount']} required to apply this coupon."
            ];
        }

        if ($coupon['usage_limit'] !== null && $coupon['used_count'] >= (int)$coupon['usage_limit']) {
            return ['valid' => false, 'message' => 'This coupon code has reached its maximum usage limit.'];
        }

        if ($userId && $coupon['per_user_limit'] !== null) {
            $userUsage = DB::fetchOne(
                "SELECT COUNT(*) as count FROM coupon_usages WHERE coupon_id = :cid AND user_id = :uid",
                ['cid' => $coupon['id'], 'uid' => $userId]
            );
            if ($userUsage && (int)$userUsage['count'] >= (int)$coupon['per_user_limit']) {
                return ['valid' => false, 'message' => 'You have already used this coupon code.'];
            }
        }

        // Calculate discount
        $discountAmount = 0.0;
        if ($coupon['discount_type'] === 'percentage') {
            $discountAmount = ($cartSubtotal * (float)$coupon['discount_value']) / 100.0;
            if ($coupon['max_discount_amount'] !== null && $discountAmount > (float)$coupon['max_discount_amount']) {
                $discountAmount = (float)$coupon['max_discount_amount'];
            }
        } else {
            // Flat amount
            $discountAmount = min((float)$coupon['discount_value'], $cartSubtotal);
        }

        $discountAmount = round($discountAmount, 2);

        return [
            'valid' => true,
            'coupon' => [
                'id' => $coupon['id'],
                'code' => $coupon['code'],
                'discount_type' => $coupon['discount_type'],
                'discount_value' => (float)$coupon['discount_value'],
                'discount_amount' => $discountAmount
            ],
            'message' => "Coupon '{$code}' applied successfully! You saved ₹{$discountAmount}."
        ];
    }
}
