<?php

namespace App\Support;

class Logger
{
    private static string $logPath = '';

    public static function init(string $storagePath): void
    {
        self::$logPath = rtrim($storagePath, '/') . '/logs';
        if (!is_dir(self::$logPath)) {
            mkdir(self::$logPath, 0755, true);
        }
    }

    public static function info(string $message, array $context = []): void
    {
        self::write('INFO', $message, $context);
    }

    public static function warning(string $message, array $context = []): void
    {
        self::write('WARNING', $message, $context);
    }

    public static function error(string $message, array $context = []): void
    {
        self::write('ERROR', $message, $context);
    }

    public static function audit(string $action, array $context = []): void
    {
        self::write('AUDIT', $action, $context);
    }

    private static function write(string $level, string $message, array $context = []): void
    {
        if (empty(self::$logPath)) {
            self::$logPath = __DIR__ . '/../../storage/logs';
            if (!is_dir(self::$logPath)) {
                @mkdir(self::$logPath, 0755, true);
            }
        }

        $sanitizedContext = self::sanitize($context);
        $timestamp = date('Y-m-d H:i:s');
        $jsonContext = !empty($sanitizedContext) ? ' ' . json_encode($sanitizedContext, JSON_UNESCAPED_SLASHES) : '';
        $entry = sprintf("[%s] [%s] %s%s\n", $timestamp, $level, $message, $jsonContext);

        $file = self::$logPath . '/app-' . date('Y-m-d') . '.log';
        @file_put_contents($file, $entry, FILE_APPEND | LOCK_EX);
    }

    /**
     * Prevent logging secrets, passwords, tokens, API keys
     */
    private static function sanitize(array $data): array
    {
        $sensitiveKeys = [
            'password', 'password_confirmation', 'secret', 'key', 'token',
            'api_key', 'razorpay_secret', 'webhook_secret', 'authorization',
            'credit_card', 'cvv'
        ];

        $cleaned = [];
        foreach ($data as $key => $value) {
            $lowerKey = strtolower((string)$key);
            $isSensitive = false;
            foreach ($sensitiveKeys as $pattern) {
                if (str_contains($lowerKey, $pattern)) {
                    $isSensitive = true;
                    break;
                }
            }

            if ($isSensitive) {
                $cleaned[$key] = '********';
            } elseif (is_array($value)) {
                $cleaned[$key] = self::sanitize($value);
            } else {
                $cleaned[$key] = $value;
            }
        }

        return $cleaned;
    }
}
