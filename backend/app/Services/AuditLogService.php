<?php

namespace App\Services;

use App\Database\DB;
use App\Support\Logger;
use App\Support\Request;

class AuditLogService
{
    public static function log(
        string $action,
        string $entity,
        ?string $entityId = null,
        ?array $details = null,
        ?Request $request = null
    ): void {
        $user = $request ? $request->getUser() : null;
        $adminId = $user['id'] ?? null;
        $adminEmail = $user['email'] ?? 'system';
        $ip = $request ? $request->getIp() : '127.0.0.1';

        try {
            DB::insert('admin_audit_logs', [
                'admin_user_id' => $adminId,
                'admin_email' => $adminEmail,
                'action' => $action,
                'entity' => $entity,
                'entity_id' => $entityId ? (string)$entityId : null,
                'ip_address' => $ip,
                'details' => $details ? json_encode($details, JSON_UNESCAPED_SLASHES) : null,
                'created_at' => date('Y-m-d H:i:s')
            ]);
        } catch (\Throwable $e) {
            Logger::error("Audit log DB insert failed: " . $e->getMessage());
        }

        Logger::audit("Admin [{$adminEmail}] performed [{$action}] on [{$entity}:{$entityId}]", $details ?? []);
    }
}
