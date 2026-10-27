<?php

namespace App\Services;

use App\Database\DB;

class CsvImportService
{
    /**
     * Preview CSV contents and check for validation issues
     */
    public static function preview(string $filePath): array
    {
        if (!file_exists($filePath)) {
            throw new \InvalidArgumentException('CSV file not found.');
        }

        $handle = fopen($filePath, 'r');
        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            throw new \InvalidArgumentException('CSV file is empty.');
        }

        $normalizedHeader = array_map(fn($h) => strtolower(trim(str_replace([' ', '-'], '_', $h))), $header);
        
        $rows = [];
        $line = 1;
        while (($data = fgetcsv($handle)) !== false) {
            $line++;
            if (empty(array_filter($data))) continue;

            $row = [];
            foreach ($normalizedHeader as $idx => $colName) {
                $row[$colName] = $data[$idx] ?? '';
            }

            $errors = [];
            if (empty($row['sku'])) $errors[] = 'SKU is required';
            if (empty($row['name'])) $errors[] = 'Name is required';
            if (empty($row['selling_price']) || !is_numeric($row['selling_price'])) $errors[] = 'Valid selling price required';

            $rows[] = [
                'line' => $line,
                'data' => $row,
                'valid' => empty($errors),
                'errors' => $errors
            ];
        }
        fclose($handle);

        return [
            'total_rows' => count($rows),
            'valid_rows' => count(array_filter($rows, fn($r) => $r['valid'])),
            'preview' => array_slice($rows, 0, 10)
        ];
    }

    /**
     * Perform Batch Import into Products & Inventory
     */
    public static function import(string $filePath): array
    {
        $handle = fopen($filePath, 'r');
        $header = fgetcsv($handle);
        $normalizedHeader = array_map(fn($h) => strtolower(trim(str_replace([' ', '-'], '_', $h))), $header);

        $imported = 0;
        $updated = 0;
        $errors = [];

        $defaultCat = DB::fetchOne("SELECT id FROM categories LIMIT 1");
        $defaultCatId = $defaultCat ? (int)$defaultCat['id'] : 1;

        while (($data = fgetcsv($handle)) !== false) {
            if (empty(array_filter($data))) continue;
            $row = [];
            foreach ($normalizedHeader as $idx => $colName) {
                $row[$colName] = $data[$idx] ?? '';
            }

            if (empty($row['sku']) || empty($row['name']) || !is_numeric($row['selling_price'])) {
                continue;
            }

            try {
                $sku = trim($row['sku']);
                $name = trim($row['name']);
                $slug = trim($row['slug'] ?? '') ?: strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $name));
                $sellingPrice = (float)$row['selling_price'];
                $mrp = !empty($row['mrp']) && is_numeric($row['mrp']) ? (float)$row['mrp'] : $sellingPrice;
                $stock = !empty($row['stock']) && is_numeric($row['stock']) ? (int)$row['stock'] : 50;

                $existing = DB::fetchOne("SELECT id FROM products WHERE sku = :sku", ['sku' => $sku]);
                if ($existing) {
                    DB::update('products', [
                        'name' => $name,
                        'selling_price' => $sellingPrice,
                        'mrp' => $mrp,
                        'weight' => $row['weight'] ?? '100g',
                        'updated_at' => date('Y-m-d H:i:s')
                    ], 'id = :id', ['id' => $existing['id']]);

                    InventoryService::adjustStock((int)$existing['id'], $stock, 'csv_import_update');
                    $updated++;
                } else {
                    $prodId = DB::insert('products', [
                        'sku' => $sku,
                        'name' => $name,
                        'slug' => $slug . '-' . substr(md5($sku), 0, 4),
                        'category_id' => $defaultCatId,
                        'short_description' => $row['description'] ?? '',
                        'description' => $row['description'] ?? '',
                        'mrp' => $mrp,
                        'selling_price' => $sellingPrice,
                        'discount_percentage' => $mrp > $sellingPrice ? round((($mrp - $sellingPrice) / $mrp) * 100, 2) : 0,
                        'weight' => $row['weight'] ?? '100g',
                        'protein' => $row['protein'] ?? '',
                        'calories' => $row['calories'] ?? '',
                        'ingredients' => $row['ingredients'] ?? '',
                        'status' => 'active',
                        'tags' => $row['tags'] ?? 'office_snack',
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s')
                    ]);

                    if (!empty($row['image_url'])) {
                        DB::insert('product_images', [
                            'product_id' => $prodId,
                            'image_url' => $row['image_url'],
                            'alt_text' => $name,
                            'is_primary' => 1,
                            'display_order' => 1
                        ]);
                    }

                    InventoryService::adjustStock((int)$prodId, $stock, 'csv_import_create');
                    $imported++;
                }
            } catch (\Throwable $e) {
                $errors[] = "Error on SKU {$row['sku']}: " . $e->getMessage();
            }
        }
        fclose($handle);

        return [
            'imported' => $imported,
            'updated' => $updated,
            'errors' => $errors
        ];
    }
}
