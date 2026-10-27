<?php

namespace App\Controllers\Admin;

use App\Database\DB;
use App\Services\AuditLogService;
use App\Support\Request;
use App\Support\Response;

class AdminContentController
{
    /**
     * Get All Site Settings
     */
    public function getSettings(Request $request): void
    {
        $rows = DB::fetchAll("SELECT setting_key, setting_value, category FROM site_settings");
        $settings = [];
        foreach ($rows as $r) {
            $settings[$r['setting_key']] = $r['setting_value'];
        }
        Response::success($settings);
    }

    /**
     * Update Site Settings
     */
    public function updateSettings(Request $request): void
    {
        $data = $request->all();
        foreach ($data as $key => $value) {
            if ($value === null) continue;
            $strVal = is_array($value) ? json_encode($value) : (string)$value;

            $existing = DB::fetchOne("SELECT id FROM site_settings WHERE setting_key = :k", ['k' => $key]);
            if ($existing) {
                DB::update('site_settings', ['setting_value' => $strVal, 'updated_at' => date('Y-m-d H:i:s')], 'setting_key = :k', ['k' => $key]);
            } else {
                DB::insert('site_settings', [
                    'setting_key' => $key,
                    'setting_value' => $strVal,
                    'category' => 'general',
                    'updated_at' => date('Y-m-d H:i:s')
                ]);
            }
        }

        AuditLogService::log('site_settings_updated', 'site_settings', null, ['keys' => array_keys($data)], $request);
        Response::success(null, 'Site settings updated successfully.');
    }
}
