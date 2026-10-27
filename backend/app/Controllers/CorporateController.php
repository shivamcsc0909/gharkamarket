<?php

namespace App\Controllers;

use App\Database\DB;
use App\Services\NotificationService;
use App\Support\Request;
use App\Support\Response;
use App\Support\Validator;

class CorporateController
{
    /**
     * Submit B2B Corporate Request
     */
    public function submit(Request $request): void
    {
        $v = Validator::make($request->all(), [
            'company_name' => 'required|min:2|max:200',
            'contact_person' => 'required|min:2|max:150',
            'email' => 'required|email|max:191',
            'phone' => 'required|phone',
            'employee_count' => 'required',
            'snack_requirement' => 'required'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $id = DB::insert('corporate_requests', [
            'company_name' => trim($request->input('company_name')),
            'contact_person' => trim($request->input('contact_person')),
            'email' => strtolower(trim($request->input('email'))),
            'phone' => trim($request->input('phone')),
            'employee_count' => trim($request->input('employee_count')),
            'snack_requirement' => trim($request->input('snack_requirement')),
            'estimated_budget' => $request->input('estimated_budget') ? trim($request->input('estimated_budget')) : null,
            'message' => $request->input('message') ? trim($request->input('message')) : null,
            'status' => 'new',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        // Send confirmation email
        NotificationService::sendEmail(
            $request->input('email'),
            "Thank you for contacting OfficeFuel for Corporate Snacking!",
            "<p>Hi {$request->input('contact_person')},</p><p>We have received your corporate snack box requirement for <strong>{$request->input('company_name')}</strong>. Our corporate account manager will reach out within 4 business hours.</p>"
        );

        Response::success(['id' => $id], 'Thank you! Your corporate inquiry has been submitted. Our Delhi NCR team will contact you shortly.', 201);
    }
}
