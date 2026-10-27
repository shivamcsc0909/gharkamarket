<?php

namespace App\Support;

class Env
{
    private static array $variables = [];
    private static bool $loaded = false;

    public static function load(string $path): void
    {
        if (self::$loaded || !file_exists($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || str_starts_with($line, '#')) {
                continue;
            }

            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);

                // Strip quotes
                if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                    (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                    $value = substr($value, 1, -1);
                }

                // Handle boolean / null strings
                $lower = strtolower($value);
                if ($lower === 'true') {
                    $value = true;
                } elseif ($lower === 'false') {
                    $value = false;
                } elseif ($lower === 'null') {
                    $value = null;
                }

                self::$variables[$key] = $value;
                putenv("{$key}={$value}");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }

        self::$loaded = true;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        if (isset(self::$variables[$key])) {
            return self::$variables[$key];
        }

        $env = getenv($key);
        if ($env !== false) {
            return $env;
        }

        return $_ENV[$key] ?? $_SERVER[$key] ?? $default;
    }

    public static function set(string $key, mixed $value): void
    {
        self::$variables[$key] = $value;
        $_ENV[$key] = $value;
    }
}
