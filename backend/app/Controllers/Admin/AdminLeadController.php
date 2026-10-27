<?php

namespace App\Controllers\Admin;

use App\Database\DB;
use App\Services\AuditLogService;
use App\Support\Request;
use App\Support\Response;
use App\Support\Validator;

class AdminLeadController
{
    /**
     * Corporate B2B Leads List
     */
    public function corporateLeads(Request $request): void
    {
        $status = $request->query('status');
        $where = ['1=1'];
        $params = [];

        if (!empty($status)) {
            $where[] = "status = :s";
            $params['s'] = $status;
        }

        $leads = DB::fetchAll("SELECT * FROM corporate_requests WHERE " . implode(' AND ', $where) . " ORDER BY id DESC", $params);
        Response::success($leads);
    }

    /**
     * Update Corporate Lead Status & Notes
     */
    public function updateCorporateLead(Request $request, array $params): void
    {
        $id = (int)$params['id'];
        DB::update('corporate_requests', [
            'status' => $request->input('status'),
            'admin_notes' => $request->input('admin_notes'),
            'updated_at' => date('Y-m-d H:i:s')
        ], 'id = :id', ['id' => $id]);

        Response::success(null, 'Lead updated.');
    }

    /**
     * Contact Enquiries List
     */
    public function contactRequests(Request $request): void
    {
        $contacts = DB::fetchAll("SELECT * FROM contact_requests ORDER BY id DESC");
        Response::success($contacts);
    }

    /**
     * Update Contact Enquiry Status
     */
    public function updateContactRequest(Request $request, array $params): void
    {
        $id = (int)$params['id'];
        DB::update('contact_requests', [
            'status' => $request->input('status'),
            'admin_notes' => $request->input('admin_notes'),
            'updated_at' => date('Y-m-d H:i:s')
        ], 'id = :id', ['id' => $id]);

        Response::success(null, 'Contact inquiry updated.');
    }
}
