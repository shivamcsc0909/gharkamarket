<?php

namespace App\Controllers;

use App\Database\DB;
use App\Services\DeliveryService;
use App\Services\OrderService;
use App\Services\PaymentService;
use App\Support\Request;
use App\Support\Response;
use App\Support\Validator;

class CheckoutController
{
    /**
     * Create Order & Initialize Payment
     */
    public function createOrder(Request $request): void
    {
        $v = Validator::make($request->all(), [
            'customer_name' => 'required|min:2',
            'customer_email' => 'required|email',
            'customer_phone' => 'required|phone',
            'shipping_address' => 'required|array',
            'items' => 'required|array|min:1'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $user = $request->getUser();
        $userId = $user ? (int)$user['id'] : null;

        $shippingAddress = $request->input('shipping_address');
        $addressValidator = Validator::make($shippingAddress, [
            'address_line1' => 'required',
            'city' => 'required',
            'state' => 'required',
            'pincode' => 'required|pincode'
        ]);

        if ($addressValidator->fails()) {
            Response::validationError($addressValidator->errors(), 'Invalid shipping address details.');
            return;
        }

        try {
            $result = OrderService::createOrder(
                $userId,
                trim($request->input('customer_name')),
                strtolower(trim($request->input('customer_email'))),
                trim($request->input('customer_phone')),
                $shippingAddress,
                $request->input('items'),
                $request->input('coupon_code'),
                $request->input('notes')
            );

            Response::success($result, 'Order initiated successfully. Proceed with payment.', 201);
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), ['order' => [$e->getMessage()]], 422);
        } catch (\Throwable $e) {
            Response::error('An unexpected error occurred while placing your order. Please try again: ' . $e->getMessage(), ['system' => [$e->getMessage()]], 500);
        }
    }

    /**
     * Verify Razorpay Payment Signature
     */
    public function verifyPayment(Request $request): void
    {
        $v = Validator::make($request->all(), [
            'order_id' => 'required|integer',
            'razorpay_order_id' => 'required',
            'razorpay_payment_id' => 'required',
            'razorpay_signature' => 'required'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $orderId = (int)$request->input('order_id');
        $razorpayOrderId = $request->input('razorpay_order_id');
        $razorpayPaymentId = $request->input('razorpay_payment_id');
        $razorpaySignature = $request->input('razorpay_signature');

        $isValid = PaymentService::verifySignature($razorpayOrderId, $razorpayPaymentId, $razorpaySignature);

        if (!$isValid) {
            Response::error('Payment signature verification failed. Unauthorized payment confirmation.', ['payment' => ['Signature mismatch']], 400);
            return;
        }

        $success = PaymentService::handlePaymentSuccess($orderId, $razorpayPaymentId, $razorpaySignature);
        if (!$success) {
            Response::error('Order not found or payment could not be finalized.', [], 404);
            return;
        }

        $order = DB::fetchOne("SELECT * FROM orders WHERE id = :id", ['id' => $orderId]);
        Response::success($order, 'Payment verified and order confirmed successfully!');
    }

    /**
     * Customer Orders History (Strictly scoped by user_id)
     */
    public function myOrders(Request $request): void
    {
        $user = $request->getUser();
        $orders = DB::fetchAll(
            "SELECT id, order_number, subtotal, discount_amount, coupon_code, shipping_charge, tax_amount, total_amount, payment_status, order_status, created_at
             FROM orders
             WHERE user_id = :uid
             ORDER BY id DESC",
            ['uid' => $user['id']]
        );

        foreach ($orders as &$o) {
            $items = DB::fetchAll("SELECT product_name, product_sku, unit_price, quantity, total_price FROM order_items WHERE order_id = :oid", ['oid' => $o['id']]);
            $o['items'] = $items;
            $o['item_count'] = array_sum(array_column($items, 'quantity'));
        }

        Response::success($orders);
    }

    /**
     * Customer Order Detail
     */
    public function orderDetails(Request $request, array $params): void
    {
        $orderNumber = $params['orderNumber'];
        $user = $request->getUser();

        $order = DB::fetchOne("SELECT * FROM orders WHERE order_number = :on", ['on' => $orderNumber]);
        if (!$order) {
            Response::notFound('Order not found.');
            return;
        }

        // Verify Ownership: if user is logged in, must match user_id
        if ($user && $order['user_id'] && (int)$order['user_id'] !== (int)$user['id']) {
            Response::forbidden('You do not have permission to view this order.');
            return;
        }

        $order['shipping_address'] = json_decode($order['shipping_address'] ?? '{}', true);
        $order['items'] = DB::fetchAll("SELECT * FROM order_items WHERE order_id = :oid", ['oid' => $order['id']]);
        $order['status_history'] = DB::fetchAll("SELECT from_status, to_status, comment, created_at FROM order_status_history WHERE order_id = :oid ORDER BY id ASC", ['oid' => $order['id']]);
        $order['tracking'] = DeliveryService::getTrackingInfo($order);

        Response::success($order);
    }

    /**
     * Public Order Tracking Endpoint
     */
    public function track(Request $request): void
    {
        $orderNumber = trim($request->query('order_number') ?? $request->input('order_number', ''));
        $phone = trim($request->query('phone') ?? $request->input('phone', ''));

        if (empty($orderNumber)) {
            Response::validationError(['order_number' => ['Order number is required.']]);
            return;
        }

        $order = DB::fetchOne("SELECT * FROM orders WHERE order_number = :on", ['on' => $orderNumber]);
        if (!$order) {
            Response::notFound('Order number not found.');
            return;
        }

        // Phone check if not logged in
        if (!empty($phone) && !str_ends_with(preg_replace('/[^0-9]/', '', $order['customer_phone']), substr(preg_replace('/[^0-9]/', '', $phone), -10))) {
            Response::unauthorized('Phone number does not match the order record.');
            return;
        }

        $order['shipping_address'] = json_decode($order['shipping_address'] ?? '{}', true);
        $order['items'] = DB::fetchAll("SELECT product_name, product_sku, unit_price, quantity, total_price FROM order_items WHERE order_id = :oid", ['oid' => $order['id']]);
        $order['tracking'] = DeliveryService::getTrackingInfo($order);

        Response::success($order);
    }
}
