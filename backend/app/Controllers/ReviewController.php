<?php

namespace App\Controllers;

use App\Database\DB;
use App\Support\Request;
use App\Support\Response;
use App\Support\Validator;

class ReviewController
{
    /**
     * Submit Product Review
     */
    public function submit(Request $request): void
    {
        $v = Validator::make($request->all(), [
            'product_id' => 'required|integer',
            'customer_name' => 'required|min:2',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|min:5'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $user = $request->getUser();
        $userId = $user ? (int)$user['id'] : null;
        $productId = (int)$request->input('product_id');

        $product = DB::fetchOne("SELECT id FROM products WHERE id = :id", ['id' => $productId]);
        if (!$product) {
            Response::notFound('Product not found.');
            return;
        }

        // Check if verified purchase
        $isVerified = 0;
        if ($userId) {
            $purchase = DB::fetchOne(
                "SELECT oi.id FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.user_id = :uid AND oi.product_id = :pid AND o.payment_status = 'paid'",
                ['uid' => $userId, 'pid' => $productId]
            );
            $isVerified = $purchase ? 1 : 0;
        }

        $reviewId = DB::insert('reviews', [
            'product_id' => $productId,
            'user_id' => $userId,
            'customer_name' => trim($request->input('customer_name')),
            'rating' => (int)$request->input('rating'),
            'title' => $request->input('title') ? trim($request->input('title')) : null,
            'comment' => trim($request->input('comment')),
            'is_verified_purchase' => $isVerified,
            'status' => 'pending', // Pending admin moderation
            'created_at' => date('Y-m-d H:i:s')
        ]);

        Response::success(['id' => $reviewId], 'Thank you for your feedback! Your review has been submitted for moderation.', 201);
    }

    /**
     * Get Reviews for a Product
     */
    public function listForProduct(Request $request, array $params): void
    {
        $productId = (int)$params['productId'];
        $reviews = DB::fetchAll("SELECT * FROM reviews WHERE product_id = :pid AND status = 'approved' ORDER BY id DESC", ['pid' => $productId]);
        
        $stats = DB::fetchOne(
            "SELECT COUNT(*) as total_reviews, AVG(rating) as average_rating FROM reviews WHERE product_id = :pid AND status = 'approved'",
            ['pid' => $productId]
        );

        Response::success([
            'reviews' => $reviews,
            'total_reviews' => (int)($stats['total_reviews'] ?? 0),
            'average_rating' => round((float)($stats['average_rating'] ?? 0), 1)
        ]);
    }
}
