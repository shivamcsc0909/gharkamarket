<?php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Config;
use App\Database\DB;
use App\Database\Schema;
use App\Database\Seeder;
use App\Middleware\CorsMiddleware;
use App\Middleware\SecurityHeadersMiddleware;
use App\Support\Env;
use App\Support\Logger;
use App\Support\Request;
use App\Support\Response;
use App\Support\Router;

// 1. Load Environment
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    Env::load($envFile);
}

// 2. Init Logger
Logger::init(__DIR__ . '/../storage');

// 3. Error & Exception Handling
$appConfig = Config::app();
if ($appConfig['debug']) {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    error_reporting(0);
}

set_exception_handler(function (\Throwable $e) use ($appConfig) {
    Logger::error("Uncaught exception: " . $e->getMessage(), [
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);

    $msg = $appConfig['debug'] ? $e->getMessage() : 'An internal server error occurred.';
    Response::error($msg, ['system' => [$msg]], 500);
});

// 4. Auto-initialize Database tables & seed data if SQLite and missing
try {
    $dbConfig = Config::database();
    if ($dbConfig['driver'] === 'sqlite' && !file_exists($dbConfig['sqlite_path'])) {
        Schema::createTables();
        Seeder::run();
    }
} catch (\Throwable $e) {
    Logger::warning("Auto DB schema init skipped: " . $e->getMessage());
}

// 5. Build Router & Dispatch Request
$router = new Router();
$router->use(new CorsMiddleware());
$router->use(new SecurityHeadersMiddleware());

$routesRegistrar = require __DIR__ . '/../routes/api.php';
$routesRegistrar($router);

$request = new Request();
$router->dispatch($request);
