<?php

namespace App\Controllers;

use App\Services\SetupService;
use App\Support\Request;
use App\Support\Response;
use App\Support\Validator;

class SetupController
{
    /**
     * Check if initial installation wizard is required
     */
    public function status(Request $request): void
    {
        $isInstalled = SetupService::isInstalled();
        Response::success([
            'is_installed' => $isInstalled
        ]);
    }

    /**
     * Complete First-Deployment Admin Setup Wizard
     */
    public function install(Request $request): void
    {
        if (SetupService::isInstalled()) {
            Response::forbidden('Setup is already completed. This endpoint is permanently disabled.');
            return;
        }

        $v = Validator::make($request->all(), [
            'name' => 'required|min:2|max:100',
            'email' => 'required|email',
            'password' => 'required|min:8|max:100'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        try {
            $result = SetupService::install(
                $request->input('name'),
                $request->input('email'),
                $request->input('password')
            );

            Response::success($result, 'Super Admin account created and database initialized successfully! Setup is now locked.', 201);
        } catch (\Throwable $e) {
            Response::error('Installation failed: ' . $e->getMessage(), ['setup' => [$e->getMessage()]], 500);
        }
    }
}
