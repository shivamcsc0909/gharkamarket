<?php

namespace App\Controllers;

use App\Services\PaymentService;
use App\Support\Request;
use App\Support\Response;

class PaymentController
{
    /**
     * Razorpay Webhook Endpoint
     */
    public function webhook(Request $request): void
    {
        $rawPayload = file_get_contents('php://input');
        $signature = $request->getHeader('x-razorpay-signature') ?? '';

        $result = PaymentService::handleWebhook($rawPayload, $signature);
        if (!$result['success']) {
            Response::error($result['message'], [], 400);
            return;
        }

        Response::success(null, $result['message']);
    }
}
