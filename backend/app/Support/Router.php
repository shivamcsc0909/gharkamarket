<?php

namespace App\Support;

class Router
{
    private array $routes = [];
    private array $globalMiddleware = [];

    public function use(callable|string $middleware): self
    {
        $this->globalMiddleware[] = $middleware;
        return $this;
    }

    public function get(string $path, array|callable $handler, array $middleware = []): self
    {
        return $this->addRoute('GET', $path, $handler, $middleware);
    }

    public function post(string $path, array|callable $handler, array $middleware = []): self
    {
        return $this->addRoute('POST', $path, $handler, $middleware);
    }

    public function put(string $path, array|callable $handler, array $middleware = []): self
    {
        return $this->addRoute('PUT', $path, $handler, $middleware);
    }

    public function patch(string $path, array|callable $handler, array $middleware = []): self
    {
        return $this->addRoute('PATCH', $path, $handler, $middleware);
    }

    public function delete(string $path, array|callable $handler, array $middleware = []): self
    {
        return $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    public function options(string $path, array|callable $handler, array $middleware = []): self
    {
        return $this->addRoute('OPTIONS', $path, $handler, $middleware);
    }

    private function addRoute(string $method, string $path, array|callable $handler, array $middleware): self
    {
        $cleanPath = '/' . trim($path, '/');
        // Convert route params {id} to regex named captures
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $cleanPath);
        $regex = '#^' . $pattern . '$#';

        $this->routes[] = [
            'method' => $method,
            'path' => $cleanPath,
            'regex' => $regex,
            'handler' => $handler,
            'middleware' => $middleware,
        ];
        return $this;
    }

    public function dispatch(Request $request): void
    {
        $method = $request->getMethod();
        $uri = $request->getUri();

        // Run global middleware first
        foreach ($this->globalMiddleware as $middleware) {
            $this->executeMiddleware($middleware, $request);
        }

        // Handle OPTIONS preflight requests directly
        if ($method === 'OPTIONS') {
            Response::json(['status' => 'OK'], 200);
            return;
        }

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && preg_match($route['regex'], $uri, $matches)) {
                // Extract route parameters
                $params = [];
                foreach ($matches as $key => $value) {
                    if (is_string($key)) {
                        $params[$key] = urldecode($value);
                        $request->setAttribute($key, $params[$key]);
                    }
                }

                // Execute route-specific middleware
                foreach ($route['middleware'] as $middleware) {
                    $this->executeMiddleware($middleware, $request);
                }

                // Execute handler
                $handler = $route['handler'];
                if (is_array($handler)) {
                    [$class, $action] = $handler;
                    $controller = new $class();
                    $controller->$action($request, $params);
                    return;
                } elseif (is_callable($handler)) {
                    $handler($request, $params);
                    return;
                }
            }
        }

        Response::notFound("Endpoint not found: {$method} {$uri}");
    }

    private function executeMiddleware(callable|string $middleware, Request $request): void
    {
        if (is_string($middleware)) {
            $instance = new $middleware();
            $instance->handle($request);
        } elseif (is_callable($middleware)) {
            $middleware($request);
        }
    }
}
