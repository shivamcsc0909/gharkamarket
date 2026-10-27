<?php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Config;
use App\Database\DB;
use App\Database\Schema;
use App\Database\Seeder;
use App\Services\CouponService;
use App\Services\DeliveryService;
use App\Services\InventoryService;
use App\Services\OrderService;
use App\Services\PaymentService;
use App\Services\SetupService;
use App\Support\Env;
use App\Support\JWT;

echo "====================================================\n";
echo "OFFICEFUEL / GHAR KA MARKET — BACKEND TEST SUITE\n";
echo "====================================================\n\n";

// Set isolated test environment in memory/temp SQLite
$testDbFile = __DIR__ . '/../storage/test_db.sqlite';
if (file_exists($testDbFile)) {
    @unlink($testDbFile);
}
Env::set('DB_CONNECTION', 'sqlite');
Env::set('DB_SQLITE_PATH', $testDbFile);
Env::set('JWT_SECRET', 'test_secret_for_automated_testing_key_123');

$testsRun = 0;
$testsPassed = 0;

function it(string $description, callable $testCase) {
    global $testsRun, $testsPassed;
    $testsRun++;
    echo "  → Test: {$description} ... ";
    try {
        $testCase();
        $testsPassed++;
        echo "\033[32mPASSED\033[0m\n";
    } catch (\Throwable $e) {
        echo "\033[31mFAILED\033[0m\n";
        echo "    Error: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "\n";
    }
}

function assertStrict(mixed $expected, mixed $actual, string $message = '') {
    if ($expected !== $actual) {
        throw new \Exception("Assertion failed: Expected [" . var_export($expected, true) . "] but got [" . var_export($actual, true) . "]. " . $message);
    }
}

function assertTrue(bool $condition, string $message = '') {
    if (!$condition) {
        throw new \Exception("Assertion failed: Expected TRUE. " . $message);
    }
}

// -------------------------------------------------------------
// 1. DATABASE SCHEMA & SEEDING TESTS
// -------------------------------------------------------------
it('Creates complete database schema', function () {
    Schema::createTables();
    $tables = DB::fetchAll("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    $tableNames = array_column($tables, 'name');
    assertTrue(in_array('products', $tableNames), 'products table exists');
    assertTrue(in_array('orders', $tableNames), 'orders table exists');
    assertTrue(in_array('inventory', $tableNames), 'inventory table exists');
    assertTrue(in_array('coupons', $tableNames), 'coupons table exists');
});

it('Seeds product catalog, categories and coupons', function () {
    Seeder::run();
    $products = DB::fetchAll("SELECT * FROM products");
    assertTrue(count($products) >= 5, 'At least 5 seeded products');

    $categories = DB::fetchAll("SELECT * FROM categories");
    assertTrue(count($categories) >= 4, 'At least 4 categories');

    $coupons = DB::fetchAll("SELECT * FROM coupons");
    assertTrue(count($coupons) >= 3, 'At least 3 seeded coupons');
});

// -------------------------------------------------------------
// 2. AUTHENTICATION & JWT TESTS
// -------------------------------------------------------------
it('Encodes and decodes JWT tokens securely', function () {
    $token = JWT::encode(['sub' => 42, 'email' => 'test@officefuel.in', 'type' => 'customer'], 3600);
    $payload = JWT::decode($token);
    assertStrict(42, $payload['sub']);
    assertStrict('test@officefuel.in', $payload['email']);
    assertStrict('customer', $payload['type']);
});

it('Fails invalid or tampered JWT tokens', function () {
    $token = JWT::encode(['sub' => 42], 3600);
    $tampered = $token . 'tampered';
    $payload = JWT::decode($tampered);
    assertStrict(null, $payload);
});

// -------------------------------------------------------------
// 3. DELIVERY & PINCODE TESTS
// -------------------------------------------------------------
it('Verifies Delhi NCR priority pincodes', function () {
    $res = DeliveryService::checkPincode('110001'); // Central Delhi
    assertTrue($res['serviceable'], '110001 is serviceable');
    assertStrict('Delhi NCR Express', $res['zone']);

    $resGurugram = DeliveryService::checkPincode('122002'); // Gurugram
    assertTrue($resGurugram['serviceable'], '122002 is serviceable');

    $resInvalid = DeliveryService::checkPincode('000000');
    assertTrue(!$resInvalid['serviceable'], '000000 is invalid');
});

it('Calculates shipping fee with free threshold', function () {
    $feeForSmallOrder = DeliveryService::calculateShippingCharge(299.00);
    assertStrict(49.00, $feeForSmallOrder);

    $feeForFreeOrder = DeliveryService::calculateShippingCharge(549.00);
    assertStrict(0.0, $feeForFreeOrder);
});

// -------------------------------------------------------------
// 4. COUPON VALIDATION TESTS
// -------------------------------------------------------------
it('Validates FUELFIRST 15% discount coupon', function () {
    $res = CouponService::validate('FUELFIRST', 500.00);
    assertTrue($res['valid']);
    assertStrict(75.00, $res['coupon']['discount_amount']); // 15% of 500
});

it('Rejects coupon when minimum order amount not met', function () {
    $res = CouponService::validate('FUELFIRST', 150.00);
    assertTrue(!$res['valid']);
});

// -------------------------------------------------------------
// 5. ORDER PLACEMENT & INVENTORY DEDUCTION TESTS
// -------------------------------------------------------------
it('Creates order with deterministic ID and recalculates prices', function () {
    $product = DB::fetchOne("SELECT id, selling_price, sku FROM products LIMIT 1");
    $initialStock = DB::fetchOne("SELECT stock_quantity FROM inventory WHERE product_id = :pid", ['pid' => $product['id']]);

    $cartItems = [
        ['product_id' => $product['id'], 'quantity' => 2]
    ];

    $shippingAddress = [
        'name' => 'Rahul Sharma',
        'phone' => '9876543210',
        'address_line1' => 'Flat 402, Cyber Heights',
        'city' => 'Gurugram',
        'state' => 'Haryana',
        'pincode' => '122002'
    ];

    $result = OrderService::createOrder(
        null,
        'Rahul Sharma',
        'rahul.sharma@example.com',
        '9876543210',
        $shippingAddress,
        $cartItems,
        'FUELFIRST'
    );

    assertTrue(!empty($result['order']['id']), 'Order created');
    assertTrue(str_starts_with($result['order']['order_number'], 'OF-2026-'), 'Order number matches OF-2026-XXXXXX format');
    
    // Check stock was deducted by 2
    $updatedStock = DB::fetchOne("SELECT stock_quantity FROM inventory WHERE product_id = :pid", ['pid' => $product['id']]);
    assertStrict((int)$initialStock['stock_quantity'] - 2, (int)$updatedStock['stock_quantity'], 'Inventory correctly decremented');

    // Check payment order created
    assertTrue(!empty($result['payment']['id']), 'Payment order ID generated');
});

// -------------------------------------------------------------
// 6. PAYMENT SIGNATURE & WEBHOOK TESTS
// -------------------------------------------------------------
it('Verifies Razorpay payment signature & updates order status', function () {
    $order = DB::fetchOne("SELECT id, order_number FROM orders LIMIT 1");
    $payment = DB::fetchOne("SELECT gateway_order_id FROM payments WHERE order_id = :oid", ['oid' => $order['id']]);

    $res = PaymentService::handlePaymentSuccess((int)$order['id'], 'pay_test_payment_id_999');
    assertTrue($res, 'Payment processed');

    $updatedOrder = DB::fetchOne("SELECT payment_status, order_status FROM orders WHERE id = :id", ['id' => $order['id']]);
    assertStrict('paid', $updatedOrder['payment_status']);
    assertStrict('confirmed', $updatedOrder['order_status']);
});

// -------------------------------------------------------------
// 7. SETUP WIZARD & SUPER ADMIN INITIALIZATION
// -------------------------------------------------------------
it('Creates initial Super Admin safely', function () {
    $lock = __DIR__ . '/../storage/installed.lock';
    if (file_exists($lock)) @unlink($lock);

    $res = SetupService::install('Admin OfficeFuel', 'admin@officefuel.in', 'SuperAdminSecret123!');
    assertTrue(!empty($res['token']), 'Admin JWT token generated');
    assertStrict('super_admin', $res['admin']['role']);

    // Attempting to install again must be locked
    $failed = false;
    try {
        SetupService::install('Hacker', 'hacker@example.com', 'hack1234');
    } catch (\Throwable $e) {
        $failed = true;
    }
    assertTrue($failed, 'Secondary install attempt blocked by setup lock');
});

echo "\n====================================================\n";
echo "SUMMARY: {$testsPassed} / {$testsRun} Tests Passed (" . round(($testsPassed / $testsRun) * 100) . "%)\n";
echo "====================================================\n";

if ($testsPassed === $testsRun) {
    exit(0);
} else {
    exit(1);
}
