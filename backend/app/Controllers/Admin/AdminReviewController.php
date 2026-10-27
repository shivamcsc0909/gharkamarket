<?php

namespace App\Controllers\Admin;

use App\Database\DB;
use App\Services\AuditLogService;
use App\Support\Request;
use App\Support\Response;

class AdminReviewController
{
    /**
     * List all reviews with product details
     */
    public function index(Request $request): void
    {
        $status = $request->query('status');
        $where = ['1=1'];
        $params = [];

        if (!empty($status)) {
            $where[] = "r.status = :s";
            $params['s'] = $status;
        }

        $reviews = DB::fetchAll(
            "SELECT r.*, p.name as product_name, p.slug as product_slug
             FROM reviews r
             JOIN products p ON p.id = r.product_id
             WHERE " . implode(' AND ', $where) . "
             ORDER BY r.id DESC",
            $params
        );

        Response::success($reviews);
    }

    /**
     * Update Review Status (Approved, Rejected, Pending)
     */
    public function updateStatus(Request $request, array $params): void
    {
        $id = (int)$params['id'];
        $status = $request->input('status'); // approved | rejected | pending

        DB::update('reviews', ['status' => $status], 'id = :id', ['id' => $id]);
        AuditLogService::log('review_status_updated', 'reviews', (string)$id, ['status' => $status], $request);

        Response::success(null, "Review status updated to {$status}.");
    }

    /**
     * Delete Review
     */
    public function delete(Request $request, array $params): void
    {
        $id = (int)$params['id'];
        DB::delete('reviews', 'id = :id', ['id' => $id]);
        Response::success(null, 'Review deleted.');
    }
}
