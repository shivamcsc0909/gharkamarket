<?php

use App\Controllers\Admin\AdminAuditController;
use App\Controllers\Admin\AdminAuthController;
use App\Controllers\Admin\AdminContentController;
use App\Controllers\Admin\AdminCouponController;
use App\Controllers\Admin\AdminDashboardController;
use App\Controllers\Admin\AdminInventoryController;
use App\Controllers\Admin\AdminLeadController;
use App\Controllers\Admin\AdminOrderController;
use App\Controllers\Admin\AdminProductController;
use App\Controllers\Admin\AdminReviewController;
use App\Controllers\Admin\AdminUserController;
use App\Controllers\AuthController;
use App\Controllers\CartController;
use App\Controllers\CheckoutController;
use App\Controllers\ContactController;
use App\Controllers\CorporateController;
use App\Controllers\PaymentController;
use App\Controllers\ProductController;
use App\Controllers\ReviewController;
use App\Controllers\SetupController;
use App\Middleware\AdminAuthMiddleware;
use App\Middleware\AuthMiddleware;
use App\Middleware\RateLimiterMiddleware;
use App\Support\Router;

return function (Router $router) {
    // -------------------------------------------------------------
    // SETUP WIZARD (Disabled once initialized)
    // -------------------------------------------------------------
    $router->get('/api/setup/status', [SetupController::class, 'status']);
    $router->post('/api/setup/install', [SetupController::class, 'install']);

    // -------------------------------------------------------------
    // PUBLIC CUSTOMER AUTH
    // -------------------------------------------------------------
    $router->post('/api/auth/register', [AuthController::class, 'register'], [new RateLimiterMiddleware(20, 60)]);
    $router->post('/api/auth/login', [AuthController::class, 'login'], [new RateLimiterMiddleware(20, 60)]);
    $router->post('/api/auth/google', [AuthController::class, 'googleLogin']);
    $router->post('/api/auth/forgot-password', [AuthController::class, 'forgotPassword'], [new RateLimiterMiddleware(10, 60)]);
    $router->post('/api/auth/reset-password', [AuthController::class, 'resetPassword'], [new RateLimiterMiddleware(10, 60)]);

    // PROTECTED CUSTOMER PROFILE
    $router->get('/api/auth/me', [AuthController::class, 'me'], [AuthMiddleware::class]);
    $router->put('/api/auth/profile', [AuthController::class, 'updateProfile'], [AuthMiddleware::class]);
    $router->get('/api/auth/addresses', [AuthController::class, 'getAddresses'], [AuthMiddleware::class]);
    $router->post('/api/auth/addresses', [AuthController::class, 'addAddress'], [AuthMiddleware::class]);
    $router->delete('/api/auth/addresses/{id}', [AuthController::class, 'deleteAddress'], [AuthMiddleware::class]);

    // -------------------------------------------------------------
    // PRODUCTS & CATEGORIES
    // -------------------------------------------------------------
    $router->get('/api/products', [ProductController::class, 'index']);
    $router->get('/api/products/need-discovery', [ProductController::class, 'needDiscovery']);
    $router->get('/api/products/{slug}', [ProductController::class, 'show']);
    $router->get('/api/categories', [ProductController::class, 'categories']);
    $router->get('/api/delivery/check-pincode', [ProductController::class, 'checkPincode']);

    // -------------------------------------------------------------
    // CART & COUPONS
    // -------------------------------------------------------------
    $router->post('/api/cart/calculate', [CartController::class, 'calculate']);
    $router->post('/api/cart/validate-coupon', [CartController::class, 'validateCoupon']);

    // -------------------------------------------------------------
    // CHECKOUT & ORDERS
    // -------------------------------------------------------------
    $router->post('/api/checkout/create-order', [CheckoutController::class, 'createOrder'], [new RateLimiterMiddleware(30, 60)]);
    $router->post('/api/checkout/verify-payment', [CheckoutController::class, 'verifyPayment']);
    $router->get('/api/orders/my-orders', [CheckoutController::class, 'myOrders'], [AuthMiddleware::class]);
    $router->get('/api/orders/track', [CheckoutController::class, 'track']);
    $router->get('/api/orders/{orderNumber}', [CheckoutController::class, 'orderDetails']);

    // -------------------------------------------------------------
    // RAZORPAY WEBHOOKS
    // -------------------------------------------------------------
    $router->post('/api/payments/webhook', [PaymentController::class, 'webhook']);

    // -------------------------------------------------------------
    // CORPORATE & CONTACT INQUIRIES
    // -------------------------------------------------------------
    $router->post('/api/corporate/submit', [CorporateController::class, 'submit'], [new RateLimiterMiddleware(15, 60)]);
    $router->post('/api/contact/submit', [ContactController::class, 'submit'], [new RateLimiterMiddleware(15, 60)]);

    // -------------------------------------------------------------
    // REVIEWS
    // -------------------------------------------------------------
    $router->get('/api/reviews/product/{productId}', [ReviewController::class, 'listForProduct']);
    $router->post('/api/reviews/submit', [ReviewController::class, 'submit'], [new RateLimiterMiddleware(10, 60)]);

    // -------------------------------------------------------------
    // ADMIN PANEL APIs (admin.DOMAIN.com)
    // -------------------------------------------------------------
    $router->post('/api/admin/auth/login', [AdminAuthController::class, 'login'], [new RateLimiterMiddleware(10, 60)]);
    $router->get('/api/admin/auth/me', [AdminAuthController::class, 'me'], [AdminAuthMiddleware::class]);

    // Admin Dashboard
    $router->get('/api/admin/dashboard/stats', [AdminDashboardController::class, 'stats'], [AdminAuthMiddleware::class]);

    // Admin Products & Categories
    $router->get('/api/admin/products', [AdminProductController::class, 'index'], [AdminAuthMiddleware::class]);
    $router->post('/api/admin/products', [AdminProductController::class, 'store'], [AdminAuthMiddleware::class]);
    $router->put('/api/admin/products/{id}', [AdminProductController::class, 'update'], [AdminAuthMiddleware::class]);
    $router->delete('/api/admin/products/{id}', [AdminProductController::class, 'delete'], [AdminAuthMiddleware::class]);
    $router->post('/api/admin/products/import-csv', [AdminProductController::class, 'importCsv'], [AdminAuthMiddleware::class]);

    $router->get('/api/admin/categories', [AdminProductController::class, 'listCategories'], [AdminAuthMiddleware::class]);
    $router->post('/api/admin/categories', [AdminProductController::class, 'createCategory'], [AdminAuthMiddleware::class]);
    $router->put('/api/admin/categories/{id}', [AdminProductController::class, 'updateCategory'], [AdminAuthMiddleware::class]);

    // Admin Inventory
    $router->get('/api/admin/inventory', [AdminInventoryController::class, 'index'], [AdminAuthMiddleware::class]);
    $router->post('/api/admin/inventory/adjust', [AdminInventoryController::class, 'adjust'], [AdminAuthMiddleware::class]);
    $router->get('/api/admin/inventory/logs', [AdminInventoryController::class, 'logs'], [AdminAuthMiddleware::class]);

    // Admin Orders
    $router->get('/api/admin/orders', [AdminOrderController::class, 'index'], [AdminAuthMiddleware::class]);
    $router->get('/api/admin/orders/{id}', [AdminOrderController::class, 'show'], [AdminAuthMiddleware::class]);
    $router->put('/api/admin/orders/{id}/status', [AdminOrderController::class, 'updateStatus'], [AdminAuthMiddleware::class]);
    $router->put('/api/admin/orders/{id}/tracking', [AdminOrderController::class, 'updateTracking'], [AdminAuthMiddleware::class]);

    // Admin Coupons
    $router->get('/api/admin/coupons', [AdminCouponController::class, 'index'], [AdminAuthMiddleware::class]);
    $router->post('/api/admin/coupons', [AdminCouponController::class, 'store'], [AdminAuthMiddleware::class]);
    $router->put('/api/admin/coupons/{id}', [AdminCouponController::class, 'update'], [AdminAuthMiddleware::class]);
    $router->delete('/api/admin/coupons/{id}', [AdminCouponController::class, 'delete'], [AdminAuthMiddleware::class]);

    // Admin Leads & Inquiries
    $router->get('/api/admin/leads/corporate', [AdminLeadController::class, 'corporateLeads'], [AdminAuthMiddleware::class]);
    $router->put('/api/admin/leads/corporate/{id}', [AdminLeadController::class, 'updateCorporateLead'], [AdminAuthMiddleware::class]);
    $router->get('/api/admin/leads/contact', [AdminLeadController::class, 'contactRequests'], [AdminAuthMiddleware::class]);
    $router->put('/api/admin/leads/contact/{id}', [AdminLeadController::class, 'updateContactRequest'], [AdminAuthMiddleware::class]);

    // Admin Reviews Moderation
    $router->get('/api/admin/reviews', [AdminReviewController::class, 'index'], [AdminAuthMiddleware::class]);
    $router->put('/api/admin/reviews/{id}/status', [AdminReviewController::class, 'updateStatus'], [AdminAuthMiddleware::class]);
    $router->delete('/api/admin/reviews/{id}', [AdminReviewController::class, 'delete'], [AdminAuthMiddleware::class]);

    // Admin Customers & Staff Users
    $router->get('/api/admin/users/customers', [AdminUserController::class, 'customers'], [AdminAuthMiddleware::class]);
    $router->get('/api/admin/users/customers/{id}', [AdminUserController::class, 'customerDetail'], [AdminAuthMiddleware::class]);
    $router->get('/api/admin/users/staff', [AdminUserController::class, 'admins'], [AdminAuthMiddleware::class]);
    $router->post('/api/admin/users/staff', [AdminUserController::class, 'createAdmin'], [AdminAuthMiddleware::class]);

    // Admin Site Content & Settings
    $router->get('/api/admin/content/settings', [AdminContentController::class, 'getSettings'], [AdminAuthMiddleware::class]);
    $router->put('/api/admin/content/settings', [AdminContentController::class, 'updateSettings'], [AdminAuthMiddleware::class]);

    // Admin Audit Logs
    $router->get('/api/admin/audit-logs', [AdminAuditController::class, 'index'], [AdminAuthMiddleware::class]);
};
