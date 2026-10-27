<?php

namespace App\Middleware;

use App\Support\Request;

class SecurityHeadersMiddleware
{
    public function handle(Request $request): void
    {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
    }
}
