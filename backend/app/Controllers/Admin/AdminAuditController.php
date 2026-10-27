<?php

namespace App\Controllers\Admin;

use App\Database\DB;
use App\Support\Request;
use App\Support\Response;

class AdminAuditController
{
    /**
     * List Admin Audit Logs
     */
    public function index(Request $request): void
    {
        $action = $request->query('action');
        $entity = $request->query('entity');
        $page = max(1, (int)$request->query('page', 1));
        $limit = max(1, min(100, (int)$request->query('limit', 30)));
        $offset = ($page - 1) * $limit;

        $where = ['1=1'];
        $params = [];

        if (!empty($action)) {
            $where[] = "action LIKE :a";
            $params['a'] = '%' . $action . '%';
        }

        if (!empty($entity)) {
            $where[] = "entity = :e";
            $params['e'] = $entity;
        }

        $whereSql = implode(' AND ', $where);

        $totalRow = DB::fetchOne("SELECT COUNT(*) as c FROM admin_audit_logs WHERE {$whereSql}", $params);
        $total = (int)($totalRow['c'] ?? 0);

        $logs = DB::fetchAll(
            "SELECT * FROM admin_audit_logs
             WHERE {$whereSql}
             ORDER BY id DESC
             LIMIT {$limit} OFFSET {$offset}",
            $params
        );

        foreach ($logs as &$log) {
            $log['details'] = json_decode($log['details'] ?? '{}', true);
        }

        Response::success($logs, 'Audit logs retrieved.', 200, [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ]);
    }
}
