<?php

namespace App\Support;

class Response
{
    public static function json(array $data, int $status = 200, array $headers = []): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        foreach ($headers as $key => $value) {
            header("{$key}: {$value}");
        }
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'Success', int $status = 200, array $meta = []): void
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'errors' => []
        ];

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        self::json($response, $status);
    }

    public static function error(string $message, array|string $errors = [], int $status = 400): void
    {
        $formattedErrors = is_array($errors) ? $errors : ['general' => [$errors]];
        self::json([
            'success' => false,
            'message' => $message,
            'data' => null,
            'errors' => $formattedErrors
        ], $status);
    }

    public static function validationError(array $errors, string $message = 'Validation failed'): void
    {
        self::json([
            'success' => false,
            'message' => $message,
            'data' => null,
            'errors' => $errors
        ], 422);
    }

    public static function unauthorized(string $message = 'Unauthorized access'): void
    {
        self::error($message, ['auth' => [$message]], 401);
    }

    public static function forbidden(string $message = 'Access forbidden'): void
    {
        self::error($message, ['auth' => [$message]], 403);
    }

    public static function notFound(string $message = 'Resource not found'): void
    {
        self::error($message, ['resource' => [$message]], 404);
    }
}
