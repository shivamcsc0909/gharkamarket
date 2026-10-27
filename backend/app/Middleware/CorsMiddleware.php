<?php

namespace App\Middleware;

use App\Support\Request;

class CorsMiddleware
{
    public function handle(Request $request): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        
        // In production or development, allow appropriate origins
        header("Access-Control-Allow-Origin: {$origin}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Requested-With, X-Session-Token');
        header('Access-Control-Max-Age: 86400');
    }
}
