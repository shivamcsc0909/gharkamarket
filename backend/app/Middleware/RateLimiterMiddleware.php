<?php

namespace App\Middleware;

use App\Support\Request;
use App\Support\Response;

class RateLimiterMiddleware
{
    private int $maxAttempts;
    private int $decaySeconds;

    public function __construct(int $maxAttempts = 30, int $decaySeconds = 60)
    {
        $this->maxAttempts = $maxAttempts;
        $this->decaySeconds = $decaySeconds;
    }

    public function handle(Request $request): void
    {
        $ip = $request->getIp();
        $key = md5($ip . '_' . $request->getUri());
        $cacheDir = __DIR__ . '/../../storage/cache/ratelimit';

        if (!is_dir($cacheDir)) {
            @mkdir($cacheDir, 0755, true);
        }

        $file = "{$cacheDir}/{$key}.json";
        $now = time();

        $data = ['count' => 0, 'expires_at' => $now + $this->decaySeconds];
        if (file_exists($file)) {
            $content = @file_get_contents($file);
            $parsed = json_decode((string)$content, true);
            if (is_array($parsed) && isset($parsed['expires_at']) && $parsed['expires_at'] > $now) {
                $data = $parsed;
            }
        }

        if ($data['count'] >= $this->maxAttempts) {
            $retryAfter = $data['expires_at'] - $now;
            header("Retry-After: {$retryAfter}");
            Response::error('Too many requests. Please try again later.', ['rate_limit' => ['Limit exceeded']], 429);
            return;
        }

        $data['count']++;
        @file_put_contents($file, json_encode($data));
    }
}
