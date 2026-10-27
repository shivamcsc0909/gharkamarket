<?php

namespace App\Controllers\Admin;

use App\Database\DB;
use App\Services\AuditLogService;
use App\Services\CsvImportService;
use App\Services\InventoryService;
use App\Support\Request;
use App\Support\Response;
use App\Support\Validator;

class AdminProductController
{
    /**
     * List all products for admin
     */
    public function index(Request $request): void
    {
        $search = $request->query('search');
        $categoryId = $request->query('category_id');
        $status = $request->query('status');
        $page = max(1, (int)$request->query('page', 1));
        $limit = max(1, min(100, (int)$request->query('limit', 20)));
        $offset = ($page - 1) * $limit;

        $where = ['1=1'];
        $params = [];

        if (!empty($search)) {
            $where[] = "(p.name LIKE :s OR p.sku LIKE :s)";
            $params['s'] = '%' . $search . '%';
        }

        if (!empty($categoryId)) {
            $where[] = "p.category_id = :cid";
            $params['cid'] = (int)$categoryId;
        }

        if (!empty($status)) {
            $where[] = "p.status = :status";
            $params['status'] = $status;
        }

        $whereSql = implode(' AND ', $where);

        $totalRow = DB::fetchOne("SELECT COUNT(*) as c FROM products p WHERE {$whereSql}", $params);
        $total = (int)($totalRow['c'] ?? 0);

        $products = DB::fetchAll(
            "SELECT p.*, c.name as category_name, i.stock_quantity, i.low_stock_threshold, i.is_in_stock
             FROM products p
             JOIN categories c ON c.id = p.category_id
             LEFT JOIN inventory i ON i.product_id = p.id
             WHERE {$whereSql}
             ORDER BY p.id DESC
             LIMIT {$limit} OFFSET {$offset}",
            $params
        );

        foreach ($products as &$p) {
            $images = DB::fetchAll("SELECT image_url, is_primary FROM product_images WHERE product_id = :pid ORDER BY is_primary DESC, display_order ASC", ['pid' => $p['id']]);
            $p['images'] = array_map(fn($img) => $img['image_url'], $images);
            $p['primary_image'] = $p['images'][0] ?? null;
            $p['nutrition'] = DB::fetchOne("SELECT * FROM product_nutrition WHERE product_id = :pid", ['pid' => $p['id']]);
        }

        Response::success($products, 'Products retrieved.', 200, [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ]);
    }

    /**
     * Create Product
     */
    public function store(Request $request): void
    {
        $v = Validator::make($request->all(), [
            'sku' => 'required|min:3',
            'name' => 'required|min:3',
            'category_id' => 'required|integer',
            'mrp' => 'required|numeric',
            'selling_price' => 'required|numeric',
            'weight' => 'required'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $sku = strtoupper(trim($request->input('sku')));
        $existing = DB::fetchOne("SELECT id FROM products WHERE sku = :sku", ['sku' => $sku]);
        if ($existing) {
            Response::validationError(['sku' => ['A product with this SKU already exists.']]);
            return;
        }

        $name = trim($request->input('name'));
        $slug = trim($request->input('slug') ?? '') ?: strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $name));
        $mrp = (float)$request->input('mrp');
        $sellingPrice = (float)$request->input('selling_price');
        $discountPercentage = $mrp > $sellingPrice ? round((($mrp - $sellingPrice) / $mrp) * 100, 2) : 0.0;

        $productId = DB::transaction(function () use ($request, $sku, $name, $slug, $mrp, $sellingPrice, $discountPercentage) {
            $id = DB::insert('products', [
                'sku' => $sku,
                'name' => $name,
                'slug' => $slug . '-' . substr(md5(uniqid()), 0, 4),
                'category_id' => (int)$request->input('category_id'),
                'short_description' => $request->input('short_description'),
                'description' => $request->input('description'),
                'mrp' => $mrp,
                'selling_price' => $sellingPrice,
                'discount_percentage' => $discountPercentage,
                'weight' => trim($request->input('weight')),
                'servings' => $request->input('servings'),
                'protein' => $request->input('protein'),
                'calories' => $request->input('calories'),
                'ingredients' => $request->input('ingredients'),
                'allergens' => $request->input('allergens'),
                'is_featured' => $request->input('is_featured') ? 1 : 0,
                'is_best_seller' => $request->input('is_best_seller') ? 1 : 0,
                'status' => $request->input('status', 'active'),
                'tags' => $request->input('tags', 'office_snack'),
                'meta_title' => $request->input('meta_title'),
                'meta_description' => $request->input('meta_description'),
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]);

            // Images
            $images = $request->input('images', []);
            if (is_array($images)) {
                foreach ($images as $idx => $imgUrl) {
                    if (!empty($imgUrl)) {
                        DB::insert('product_images', [
                            'product_id' => $id,
                            'image_url' => $imgUrl,
                            'alt_text' => $name,
                            'display_order' => $idx + 1,
                            'is_primary' => $idx === 0 ? 1 : 0,
                            'created_at' => date('Y-m-d H:i:s')
                        ]);
                    }
                }
            }

            // Nutrition
            $nutr = $request->input('nutrition', []);
            if (is_array($nutr) && !empty($nutr)) {
                DB::insert('product_nutrition', [
                    'product_id' => $id,
                    'serving_size' => $nutr['serving_size'] ?? '30g',
                    'protein_grams' => (float)($nutr['protein_grams'] ?? 0),
                    'total_calories' => (float)($nutr['total_calories'] ?? 0),
                    'total_fat' => (float)($nutr['total_fat'] ?? 0),
                    'saturated_fat' => (float)($nutr['saturated_fat'] ?? 0),
                    'trans_fat' => (float)($nutr['trans_fat'] ?? 0),
                    'carbohydrates' => (float)($nutr['carbohydrates'] ?? 0),
                    'dietary_fiber' => (float)($nutr['dietary_fiber'] ?? 0),
                    'added_sugars' => (float)($nutr['added_sugars'] ?? 0),
                    'sodium' => (float)($nutr['sodium'] ?? 0),
                    'created_at' => date('Y-m-d H:i:s')
                ]);
            }

            // Inventory
            $stock = (int)($request->input('stock_quantity', 50));
            $threshold = (int)($request->input('low_stock_threshold', 10));
            DB::insert('inventory', [
                'product_id' => $id,
                'stock_quantity' => $stock,
                'low_stock_threshold' => $threshold,
                'is_in_stock' => $stock > 0 ? 1 : 0,
                'updated_at' => date('Y-m-d H:i:s')
            ]);

            return $id;
        });

        AuditLogService::log('product_created', 'products', (string)$productId, ['name' => $name, 'sku' => $sku], $request);

        Response::success(['id' => $productId], 'Product created successfully.', 201);
    }

    /**
     * Update Product
     */
    public function update(Request $request, array $params): void
    {
        $id = (int)$params['id'];
        $product = DB::fetchOne("SELECT * FROM products WHERE id = :id", ['id' => $id]);
        if (!$product) {
            Response::notFound('Product not found.');
            return;
        }

        $mrp = $request->input('mrp') !== null ? (float)$request->input('mrp') : (float)$product['mrp'];
        $sellingPrice = $request->input('selling_price') !== null ? (float)$request->input('selling_price') : (float)$product['selling_price'];
        $discountPercentage = $mrp > $sellingPrice ? round((($mrp - $sellingPrice) / $mrp) * 100, 2) : 0.0;

        DB::transaction(function () use ($request, $id, $product, $mrp, $sellingPrice, $discountPercentage) {
            DB::update('products', [
                'name' => $request->input('name', $product['name']),
                'category_id' => (int)($request->input('category_id', $product['category_id'])),
                'short_description' => $request->input('short_description', $product['short_description']),
                'description' => $request->input('description', $product['description']),
                'mrp' => $mrp,
                'selling_price' => $sellingPrice,
                'discount_percentage' => $discountPercentage,
                'weight' => $request->input('weight', $product['weight']),
                'servings' => $request->input('servings', $product['servings']),
                'protein' => $request->input('protein', $product['protein']),
                'calories' => $request->input('calories', $product['calories']),
                'ingredients' => $request->input('ingredients', $product['ingredients']),
                'allergens' => $request->input('allergens', $product['allergens']),
                'is_featured' => $request->input('is_featured') !== null ? ($request->input('is_featured') ? 1 : 0) : $product['is_featured'],
                'is_best_seller' => $request->input('is_best_seller') !== null ? ($request->input('is_best_seller') ? 1 : 0) : $product['is_best_seller'],
                'status' => $request->input('status', $product['status']),
                'tags' => $request->input('tags', $product['tags']),
                'updated_at' => date('Y-m-d H:i:s')
            ], 'id = :id', ['id' => $id]);

            // Update images if sent
            $images = $request->input('images');
            if (is_array($images)) {
                DB::delete('product_images', 'product_id = :pid', ['pid' => $id]);
                foreach ($images as $idx => $imgUrl) {
                    if (!empty($imgUrl)) {
                        DB::insert('product_images', [
                            'product_id' => $id,
                            'image_url' => $imgUrl,
                            'alt_text' => $product['name'],
                            'display_order' => $idx + 1,
                            'is_primary' => $idx === 0 ? 1 : 0,
                            'created_at' => date('Y-m-d H:i:s')
                        ]);
                    }
                }
            }

            // Update stock if requested
            if ($request->input('stock_quantity') !== null) {
                InventoryService::adjustStock($id, (int)$request->input('stock_quantity'), 'admin_product_edit', (string)($request->getUser()['id'] ?? 'admin'));
            }
        });

        AuditLogService::log('product_updated', 'products', (string)$id, ['name' => $product['name']], $request);

        Response::success(null, 'Product updated successfully.');
    }

    /**
     * Delete Product (Mark Inactive)
     */
    public function delete(Request $request, array $params): void
    {
        $id = (int)$params['id'];
        DB::update('products', ['status' => 'archived', 'updated_at' => date('Y-m-d H:i:s')], 'id = :id', ['id' => $id]);
        AuditLogService::log('product_archived', 'products', (string)$id, [], $request);
        Response::success(null, 'Product archived.');
    }

    /**
     * Category CRUD
     */
    public function listCategories(Request $request): void
    {
        $categories = DB::fetchAll("SELECT c.*, COUNT(p.id) as products_count FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id ORDER BY c.display_order ASC");
        Response::success($categories);
    }

    public function createCategory(Request $request): void
    {
        $v = Validator::make($request->all(), ['name' => 'required']);
        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $name = trim($request->input('name'));
        $slug = trim($request->input('slug') ?? '') ?: strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $name));

        $id = DB::insert('categories', [
            'name' => $name,
            'slug' => $slug,
            'description' => $request->input('description'),
            'image_url' => $request->input('image_url'),
            'display_order' => (int)$request->input('display_order', 0),
            'is_active' => $request->input('is_active', 1) ? 1 : 0,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        AuditLogService::log('category_created', 'categories', (string)$id, ['name' => $name], $request);
        Response::success(['id' => $id], 'Category created successfully.', 201);
    }

    public function updateCategory(Request $request, array $params): void
    {
        $id = (int)$params['id'];
        DB::update('categories', [
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'image_url' => $request->input('image_url'),
            'display_order' => (int)$request->input('display_order', 0),
            'is_active' => $request->input('is_active', 1) ? 1 : 0,
            'updated_at' => date('Y-m-d H:i:s')
        ], 'id = :id', ['id' => $id]);

        Response::success(null, 'Category updated.');
    }

    /**
     * CSV Batch Import
     */
    public function importCsv(Request $request): void
    {
        $file = $request->file('csv_file');
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            Response::validationError(['csv_file' => ['A valid CSV file upload is required.']]);
            return;
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if ($ext !== 'csv') {
            Response::validationError(['csv_file' => ['Only .csv files are supported.']]);
            return;
        }

        $mode = $request->input('mode', 'import'); // preview | import

        try {
            if ($mode === 'preview') {
                $preview = CsvImportService::preview($file['tmp_name']);
                Response::success($preview);
            } else {
                $result = CsvImportService::import($file['tmp_name']);
                AuditLogService::log('csv_product_import', 'products', null, $result, $request);
                Response::success($result, "CSV import completed. Imported: {$result['imported']}, Updated: {$result['updated']}.");
            }
        } catch (\Throwable $e) {
            Response::error('CSV processing failed: ' . $e->getMessage(), ['csv' => [$e->getMessage()]], 422);
        }
    }
}
