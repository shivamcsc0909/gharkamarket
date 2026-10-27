<?php

namespace App\Services;

use App\Config\Config;
use App\Database\DB;
use App\Support\Logger;

class PaymentService
{
    /**
     * Create Razorpay Order via REST API
     */
    public static function createRazorpayOrder(int $orderId, float $amountInInr, string $receipt): array
    {
        $razorpay = Config::razorpay();

        // Convert INR to Paise (e.g. 159.00 -> 15900)
        $amountInPaise = (int)round($amountInInr * 100);

        if (!$razorpay['is_configured']) {
            Logger::warning("Razorpay credentials missing. Generating test order ID for simulation.");
            $mockRazorpayOrderId = 'order_mock_' . bin2hex(random_bytes(8));

            DB::insert('payments', [
                'order_id' => $orderId,
                'gateway' => 'razorpay',
                'gateway_order_id' => $mockRazorpayOrderId,
                'amount' => $amountInInr,
                'currency' => 'INR',
                'status' => 'created',
                'created_at' => date('Y-m-d H:i:s')
            ]);

            return [
                'id' => $mockRazorpayOrderId,
                'amount' => $amountInPaise,
                'currency' => 'INR',
                'key' => 'rzp_test_mock_key',
                'is_simulated' => true
            ];
        }

        $url = 'https://api.razorpay.com/v1/orders';
        $payload = json_encode([
            'amount' => $amountInPaise,
            'currency' => 'INR',
            'receipt' => $receipt,
            'payment_capture' => 1
        ]);

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_USERPWD, $razorpay['key_id'] . ':' . $razorpay['key_secret']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $data = json_decode((string)$response, true);
        if ($httpCode !== 200 || empty($data['id'])) {
            Logger::error("Razorpay order creation failed: " . ($data['error']['description'] ?? 'Unknown error'), [
                'http_code' => $httpCode,
                'response' => $data
            ]);
            throw new \RuntimeException('Failed to create payment session with payment gateway: ' . ($data['error']['description'] ?? 'Unknown error'));
        }

        DB::insert('payments', [
            'order_id' => $orderId,
            'gateway' => 'razorpay',
            'gateway_order_id' => $data['id'],
            'amount' => $amountInInr,
            'currency' => 'INR',
            'status' => 'created',
            'raw_response' => json_encode($data),
            'created_at' => date('Y-m-d H:i:s')
        ]);

        return [
            'id' => $data['id'],
            'amount' => $amountInPaise,
            'currency' => 'INR',
            'key' => $razorpay['key_id'],
            'is_simulated' => false
        ];
    }

    /**
     * Verify Razorpay Client Signature
     */
    public static function verifySignature(string $razorpayOrderId, string $razorpayPaymentId, string $razorpaySignature): bool
    {
        $razorpay = Config::razorpay();

        if (!$razorpay['is_configured']) {
            // If simulated test mode
            return str_starts_with($razorpayOrderId, 'order_mock_');
        }

        $expectedSignature = hash_hmac('sha256', "{$razorpayOrderId}|{$razorpayPaymentId}", $razorpay['key_secret']);
        return hash_equals($expectedSignature, $razorpaySignature);
    }

    /**
     * Process Payment Success & Update Order State
     */
    public static function handlePaymentSuccess(int $orderId, string $gatewayPaymentId, ?string $gatewaySignature = null): bool
    {
        return DB::transaction(function () use ($orderId, $gatewayPaymentId, $gatewaySignature) {
            $order = DB::fetchOne("SELECT * FROM orders WHERE id = :id", ['id' => $orderId]);
            if (!$order) {
                return false;
            }

            // Update payment record
            DB::update('payments', [
                'gateway_payment_id' => $gatewayPaymentId,
                'gateway_signature' => $gatewaySignature,
                'status' => 'captured',
                'updated_at' => date('Y-m-d H:i:s')
            ], 'order_id = :oid', ['oid' => $orderId]);

            // Update order record
            DB::update('orders', [
                'payment_status' => 'paid',
                'order_status' => 'confirmed',
                'updated_at' => date('Y-m-d H:i:s')
            ], 'id = :id', ['id' => $orderId]);

            // Record status history
            DB::insert('order_status_history', [
                'order_id' => $orderId,
                'from_status' => $order['order_status'],
                'to_status' => 'confirmed',
                'comment' => "Payment captured via Razorpay ID: {$gatewayPaymentId}",
                'created_by' => 'system',
                'created_at' => date('Y-m-d H:i:s')
            ]);

            // Send notification
            $items = DB::fetchAll("SELECT * FROM order_items WHERE order_id = :oid", ['oid' => $orderId]);
            $updatedOrder = DB::fetchOne("SELECT * FROM orders WHERE id = :id", ['id' => $orderId]);
            NotificationService::sendOrderConfirmation($updatedOrder, $items);

            return true;
        });
    }

    /**
     * Process Razorpay Webhook with Signature Verification & Idempotency
     */
    public static function handleWebhook(string $rawPayload, string $webhookSignature): array
    {
        $razorpay = Config::razorpay();
        $secret = $razorpay['webhook_secret'];

        if (!empty($secret)) {
            $expectedSignature = hash_hmac('sha256', $rawPayload, $secret);
            if (!hash_equals($expectedSignature, $webhookSignature)) {
                Logger::error('Invalid Razorpay webhook signature');
                return ['success' => false, 'message' => 'Invalid webhook signature'];
            }
        }

        $event = json_decode($rawPayload, true);
        if (!$event || empty($event['event'])) {
            return ['success' => false, 'message' => 'Invalid JSON payload'];
        }

        $eventId = $event['id'] ?? md5($rawPayload);

        // Check duplicate webhook event
        $existing = DB::fetchOne("SELECT id FROM payment_webhooks WHERE event_id = :eid", ['eid' => $eventId]);
        if ($existing) {
            return ['success' => true, 'message' => 'Webhook already processed (Idempotent response)'];
        }

        // Store webhook log
        DB::insert('payment_webhooks', [
            'event_id' => $eventId,
            'event_type' => $event['event'],
            'payload' => $rawPayload,
            'status' => 'processed',
            'processed_at' => date('Y-m-d H:i:s')
        ]);

        if ($event['event'] === 'payment.captured' || $event['event'] === 'order.paid') {
            $paymentEntity = $event['payload']['payment']['entity'] ?? [];
            $razorpayOrderId = $paymentEntity['order_id'] ?? null;
            $razorpayPaymentId = $paymentEntity['id'] ?? null;

            if ($razorpayOrderId && $razorpayPaymentId) {
                $payment = DB::fetchOne("SELECT order_id FROM payments WHERE gateway_order_id = :goid", ['goid' => $razorpayOrderId]);
                if ($payment) {
                    self::handlePaymentSuccess((int)$payment['order_id'], $razorpayPaymentId);
                }
            }
        }

        return ['success' => true, 'message' => 'Webhook processed successfully'];
    }
}
