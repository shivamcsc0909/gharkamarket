<?php

namespace App\Services;

use App\Config\BusinessConfig;
use App\Database\DB;

class DeliveryService
{
    /**
     * Check if a given pincode is serviceable in Delhi NCR / Pan-India
     */
    public static function checkPincode(string $pincode): array
    {
        $cleanPincode = trim($pincode);
        $business = BusinessConfig::get();
        $serviceableList = $business['serviceable_pincodes'];

        // If in our priority Delhi NCR list
        if (in_array($cleanPincode, $serviceableList, true) || str_starts_with($cleanPincode, '110') || str_starts_with($cleanPincode, '122') || str_starts_with($cleanPincode, '201') || str_starts_with($cleanPincode, '121')) {
            return [
                'serviceable' => true,
                'pincode' => $cleanPincode,
                'zone' => 'Delhi NCR Express',
                'estimated_days' => '1 - 2 Business Days',
                'estimated_delivery' => date('D, j M', strtotime('+1 day')),
                'cod_available' => false,
                'prepaid_available' => true,
                'message' => 'Express 24-48h Delivery available in Delhi NCR!'
            ];
        }

        // Standard Indian Pincode check (6 digits)
        if (preg_match('/^[1-9][0-9]{5}$/', $cleanPincode)) {
            return [
                'serviceable' => true,
                'pincode' => $cleanPincode,
                'zone' => 'Standard India Delivery',
                'estimated_days' => '3 - 5 Business Days',
                'estimated_delivery' => date('D, j M', strtotime('+3 days')),
                'cod_available' => false,
                'prepaid_available' => true,
                'message' => 'Standard shipping available across India.'
            ];
        }

        return [
            'serviceable' => false,
            'pincode' => $cleanPincode,
            'message' => 'Sorry, this pincode is currently not serviceable for snack delivery.'
        ];
    }

    /**
     * Calculate Shipping Charge based on subtotal & threshold
     */
    public static function calculateShippingCharge(float $subtotalAfterDiscount, string $pincode = ''): float
    {
        $b = BusinessConfig::get();
        $freeThreshold = $b['commerce']['free_shipping_threshold'];
        $defaultFee = $b['commerce']['default_shipping_fee'];

        if ($subtotalAfterDiscount >= $freeThreshold) {
            return 0.0;
        }

        return $defaultFee;
    }

    /**
     * Generate or Fetch Tracking Details for an Order
     */
    public static function getTrackingInfo(array $order): array
    {
        $trackingNumber = $order['tracking_number'] ?? ('OF-TRK-' . strtoupper(substr(md5($order['order_number']), 0, 8)));
        $provider = $order['delivery_provider'] ?? 'Shiprocket';

        $steps = [
            ['status' => 'Order Placed', 'date' => $order['created_at'], 'completed' => true],
            [
                'status' => 'Packed & Ready',
                'date' => $order['order_status'] !== 'pending' ? date('Y-m-d H:i:s', strtotime($order['created_at'] . ' + 2 hours')) : null,
                'completed' => in_array($order['order_status'], ['preparing', 'ready', 'out_for_delivery', 'delivered'], true)
            ],
            [
                'status' => 'Out for Delivery',
                'date' => in_array($order['order_status'], ['out_for_delivery', 'delivered'], true) ? date('Y-m-d H:i:s', strtotime($order['created_at'] . ' + 1 day')) : null,
                'completed' => in_array($order['order_status'], ['out_for_delivery', 'delivered'], true)
            ],
            [
                'status' => 'Delivered',
                'date' => $order['order_status'] === 'delivered' ? $order['updated_at'] : null,
                'completed' => $order['order_status'] === 'delivered'
            ],
        ];

        return [
            'order_number' => $order['order_number'],
            'delivery_provider' => $provider,
            'tracking_number' => $trackingNumber,
            'tracking_url' => "https://track.officefuel.in/?tracking={$trackingNumber}",
            'estimated_delivery' => date('D, j M', strtotime($order['created_at'] . ' + 2 days')),
            'current_status' => $order['order_status'],
            'steps' => $steps
        ];
    }
}
