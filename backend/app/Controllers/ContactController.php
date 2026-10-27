<?php

namespace App\Controllers;

use App\Database\DB;
use App\Services\NotificationService;
use App\Support\Request;
use App\Support\Response;
use App\Support\Validator;

class ContactController
{
    /**
     * Submit Customer Contact Form
     */
    public function submit(Request $request): void
    {
        $v = Validator::make($request->all(), [
            'name' => 'required|min:2',
            'email' => 'required|email',
            'subject' => 'required|min:3',
            'message' => 'required|min:10'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $id = DB::insert('contact_requests', [
            'name' => trim($request->input('name')),
            'email' => strtolower(trim($request->input('email'))),
            'phone' => $request->input('phone') ? trim($request->input('phone')) : null,
            'subject' => trim($request->input('subject')),
            'message' => trim($request->input('message')),
            'status' => 'new',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        NotificationService::sendEmail(
            $request->input('email'),
            "We have received your message - OfficeFuel Support",
            "<p>Hi {$request->input('name')},</p><p>Thank you for reaching out. We have logged your query regarding '{$request->input('subject')}' and will get back to you shortly.</p>"
        );

        Response::success(['id' => $id], 'Your message has been received. We will respond shortly.', 201);
    }
}
