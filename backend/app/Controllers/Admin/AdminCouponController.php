<?php

namespace App\Controllers\Admin;

use App\Database\DB;
use App\Services\AuditLogService;
use App\Support\Request;
use App\Support\Response;
use App\Support\Validator;

class AdminCouponController
{
    /**
     * List all coupons
     */
    public function index(Request $request): void
    {
        $coupons = DB::fetchAll("SELECT * FROM coupons ORDER BY id DESC");
        Response::success($coupons);
    }

    /**
     * Create Coupon
     */
    public function store(Request $request): void
    {
        $v = Validator::make($request->all(), [
            'code' => 'required|min:3',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0.1'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $code = strtoupper(trim($request->input('code')));
        $existing = DB::fetchOne("SELECT id FROM coupons WHERE code = :c", ['c' => $code]);
        if ($existing) {
            Response::validationError(['code' => ['Coupon code already exists.']]);
            return;
        }

        $id = DB::insert('coupons', [
            'code' => $code,
            'discount_type' => $request->input('discount_type'),
            'discount_value' => (float)$request->input('discount_value'),
            'min_order_amount' => (float)$request->input('min_order_amount', 0),
            'max_discount_amount' => $request->input('max_discount_amount') ? (float)$request->input('max_discount_amount') : null,
            'usage_limit' => $request->input('usage_limit') ? (int)$request->input('usage_limit') : null,
            'per_user_limit' => (int)$request->input('per_user_limit', 1),
            'start_date' => $request->input('start_date') ? date('Y-m-d H:i:s', strtotime($request->input('start_date'))) : date('Y-m-d H:i:s'),
            'end_date' => $request->input('end_date') ? date('Y-m-d H:i:s', strtotime($request->input('end_date'))) : null,
            'is_active' => $request->input('is_active', 1) ? 1 : 0,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        AuditLogService::log('coupon_created', 'coupons', (string)$id, ['code' => $code], $request);
        Response::success(['id' => $id], 'Coupon created successfully.', 201);
    }

    /**
     * Update Coupon
     */
    public function update(Request $request, array $params): void
    {
        $id = (int)$params['id'];
        DB::update('coupons', [
            'discount_type' => $request->input('discount_type'),
            'discount_value' => (float)$request->input('discount_value'),
            'min_order_amount' => (float)$request->input('min_order_amount', 0),
            'max_discount_amount' => $request->input('max_discount_amount') ? (float)$request->input('max_discount_amount') : null,
            'usage_limit' => $request->input('usage_limit') ? (int)$request->input('usage_limit') : null,
            'per_user_limit' => (int)$request->input('per_user_limit', 1),
            'is_active' => $request->input('is_active', 1) ? 1 : 0,
            'updated_at' => date('Y-m-d H:i:s')
        ], 'id = :id', ['id' => $id]);

        AuditLogService::log('coupon_updated', 'coupons', (string)$id, [], $request);
        Response::success(null, 'Coupon updated successfully.');
    }

    /**
     * Delete Coupon
     */
    public function delete(Request $request, array $params): void
    {
        $id = (int)$params['id'];
        DB::delete('coupons', 'id = :id', ['id' => $id]);
        AuditLogService::log('coupon_deleted', 'coupons', (string)$id, [], $request);
        Response::success(null, 'Coupon deleted.');
    }
}
