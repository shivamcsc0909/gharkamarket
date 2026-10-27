<?php

namespace App\Controllers;

use App\Database\DB;
use App\Services\DeliveryService;
use App\Support\Request;
use App\Support\Response;

class ProductController
{
    /**
     * List Products with Filtering, Search and Sorting
     */
    public function index(Request $request): void
    {
        $categorySlug = $request->query('category');
        $search = $request->query('q');
        $tag = $request->query('tag');
        $featured = $request->query('featured');
        $sort = $request->query('sort', 'default');
        $limit = max(1, min(50, (int)$request->query('limit', 20)));
        $page = max(1, (int)$request->query('page', 1));
        $offset = ($page - 1) * $limit;

        $where = ["p.status = 'active'"];
        $params = [];

        if (!empty($categorySlug)) {
            $cat = DB::fetchOne("SELECT id FROM categories WHERE slug = :cslug", ['cslug' => $categorySlug]);
            if ($cat) {
                $where[] = "p.category_id = :cid";
                $params['cid'] = $cat['id'];
            }
        }

        if (!empty($search)) {
            $where[] = "(p.name LIKE :search OR p.short_description LIKE :search OR p.tags LIKE :search)";
            $params['search'] = '%' . $search . '%';
        }

        if (!empty($tag)) {
            $where[] = "p.tags LIKE :tag";
            $params['tag'] = '%' . $tag . '%';
        }

        if ($featured !== null && $featured !== '') {
            $where[] = "p.is_featured = 1";
        }

        $orderBy = match ($sort) {
            'price_asc' => 'p.selling_price ASC',
            'price_desc' => 'p.selling_price DESC',
            'best_seller' => 'p.is_best_seller DESC, p.id DESC',
            'newest' => 'p.id DESC',
            default => 'p.is_featured DESC, p.is_best_seller DESC, p.id ASC'
        };

        $whereSql = implode(' AND ', $where);

        $total = DB::fetchOne("SELECT COUNT(*) as c FROM products p WHERE {$whereSql}", $params);
        $totalCount = (int)($total['c'] ?? 0);

        $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug, i.stock_quantity, i.is_in_stock
                FROM products p
                JOIN categories c ON c.id = p.category_id
                LEFT JOIN inventory i ON i.product_id = p.id
                WHERE {$whereSql}
                ORDER BY {$orderBy}
                LIMIT {$limit} OFFSET {$offset}";

        $products = DB::fetchAll($sql, $params);

        // Attach primary images
        foreach ($products as &$p) {
            $images = DB::fetchAll("SELECT image_url, is_primary FROM product_images WHERE product_id = :pid ORDER BY is_primary DESC, display_order ASC", ['pid' => $p['id']]);
            $p['images'] = array_map(fn($img) => $img['image_url'], $images);
            $p['primary_image'] = $p['images'][0] ?? 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80';
        }

        Response::success($products, 'Products retrieved successfully.', 200, [
            'total' => $totalCount,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($totalCount / $limit)
        ]);
    }

    /**
     * Get Single Product by Slug or ID
     */
    public function show(Request $request, array $params): void
    {
        $identifier = $params['slug'];

        $product = DB::fetchOne(
            "SELECT p.*, c.name as category_name, c.slug as category_slug, i.stock_quantity, i.is_in_stock
             FROM products p
             JOIN categories c ON c.id = p.category_id
             LEFT JOIN inventory i ON i.product_id = p.id
             WHERE (p.slug = :ident OR p.id = :ident_id) AND p.status = 'active'",
            ['ident' => $identifier, 'ident_id' => is_numeric($identifier) ? (int)$identifier : 0]
        );

        if (!$product) {
            Response::notFound('Product not found or inactive.');
            return;
        }

        // Fetch all product images
        $images = DB::fetchAll("SELECT image_url, is_primary, alt_text FROM product_images WHERE product_id = :pid ORDER BY display_order ASC", ['pid' => $product['id']]);
        $product['images'] = array_map(fn($img) => $img['image_url'], $images);

        // Fetch nutrition data
        $nutrition = DB::fetchOne("SELECT * FROM product_nutrition WHERE product_id = :pid", ['pid' => $product['id']]);
        $product['nutrition'] = $nutrition;

        // Fetch verified reviews
        $reviews = DB::fetchAll("SELECT * FROM reviews WHERE product_id = :pid AND status = 'approved' ORDER BY id DESC LIMIT 10", ['pid' => $product['id']]);
        $product['reviews'] = $reviews;

        // Fetch related products
        $related = DB::fetchAll(
            "SELECT p.id, p.name, p.slug, p.selling_price, p.mrp, p.weight, p.protein, p.discount_percentage
             FROM products p
             WHERE p.category_id = :cid AND p.id != :pid AND p.status = 'active'
             LIMIT 4",
            ['cid' => $product['category_id'], 'pid' => $product['id']]
        );

        foreach ($related as &$rel) {
            $img = DB::fetchOne("SELECT image_url FROM product_images WHERE product_id = :pid ORDER BY is_primary DESC LIMIT 1", ['pid' => $rel['id']]);
            $rel['primary_image'] = $img['image_url'] ?? 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80';
        }
        $product['related_products'] = $related;

        Response::success($product);
    }

    /**
     * List Categories
     */
    public function categories(Request $request): void
    {
        $categories = DB::fetchAll("SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC");
        foreach ($categories as &$cat) {
            $count = DB::fetchOne("SELECT COUNT(*) as c FROM products WHERE category_id = :cid AND status = 'active'", ['cid' => $cat['id']]);
            $cat['products_count'] = (int)($count['c'] ?? 0);
        }
        Response::success($categories);
    }

    /**
     * Need-Based Discovery Filter
     */
    public function needDiscovery(Request $request): void
    {
        $need = strtolower(trim($request->query('need', 'office_snack')));

        $tagPattern = match ($need) {
            'study_snack' => '%study_snack%',
            'quick_breakfast' => '%quick_breakfast%',
            'workout_snack' => '%workout%',
            'travel_snack' => '%desk_snack%',
            'weekly_pack' => '%weekly_pack%',
            'corporate_order' => '%corporate%',
            default => '%office_snack%'
        };

        $products = DB::fetchAll(
            "SELECT p.*, c.name as category_name, i.stock_quantity, i.is_in_stock
             FROM products p
             JOIN categories c ON c.id = p.category_id
             LEFT JOIN inventory i ON i.product_id = p.id
             WHERE p.status = 'active' AND (p.tags LIKE :tag OR p.is_featured = 1)
             ORDER BY p.is_best_seller DESC
             LIMIT 8",
            ['tag' => $tagPattern]
        );

        foreach ($products as &$p) {
            $img = DB::fetchOne("SELECT image_url FROM product_images WHERE product_id = :pid ORDER BY is_primary DESC LIMIT 1", ['pid' => $p['id']]);
            $p['primary_image'] = $img['image_url'] ?? 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80';
        }

        Response::success($products, "Recommended snacks for need: {$need}");
    }

    /**
     * Check Pincode Serviceability
     */
    public function checkPincode(Request $request): void
    {
        $pincode = $request->query('pincode') ?? $request->input('pincode');
        if (empty($pincode)) {
            Response::validationError(['pincode' => ['PIN code is required.']]);
            return;
        }

        $result = DeliveryService::checkPincode($pincode);
        Response::success($result);
    }
}
