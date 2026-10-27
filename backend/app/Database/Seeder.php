<?php

namespace App\Database;

use App\Config\BusinessConfig;

class Seeder
{
    public static function run(): void
    {
        self::seedCategories();
        self::seedProducts();
        self::seedCoupons();
        self::seedSettings();
    }

    private static function seedCategories(): void
    {
        $categories = [
            [
                'name' => 'Office Snack Boxes',
                'slug' => 'office-snack-boxes',
                'description' => 'Curated desk-ready snack boxes and weekly packs designed for busy Indian workdays.',
                'image_url' => 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80',
                'display_order' => 1
            ],
            [
                'name' => 'Desi Protein Snacks',
                'slug' => 'desi-protein-snacks',
                'description' => 'Oil-free slow-roasted kala chana, moong jor, soy crisps, and spiced makhana with Indian spices.',
                'image_url' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
                'display_order' => 2
            ],
            [
                'name' => 'Instant Protein Breakfast',
                'slug' => 'breakfast-mixes',
                'description' => 'High-protein chilla/dosa instant mixes, roasted sattu blends, and protein breakfast oats.',
                'image_url' => 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80',
                'display_order' => 3
            ],
            [
                'name' => 'Protein Coffee & Drinks',
                'slug' => 'protein-coffee',
                'description' => 'Convenient Arabica coffee infused with 15g plant protein for morning focus and energy.',
                'image_url' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
                'display_order' => 4
            ],
            [
                'name' => 'Corporate & Office Pantries',
                'slug' => 'corporate-boxes',
                'description' => 'Bulk employee wellness boxes and curated pantry snacks for Delhi NCR companies and co-working spaces.',
                'image_url' => 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
                'display_order' => 5
            ]
        ];

        foreach ($categories as $cat) {
            $existing = DB::fetchOne("SELECT id FROM categories WHERE slug = :slug", ['slug' => $cat['slug']]);
            if (!$existing) {
                DB::insert('categories', [
                    'name' => $cat['name'],
                    'slug' => $cat['slug'],
                    'description' => $cat['description'],
                    'image_url' => $cat['image_url'],
                    'display_order' => $cat['display_order'],
                    'is_active' => 1
                ]);
            } else {
                DB::update('categories', [
                    'name' => $cat['name'],
                    'description' => $cat['description'],
                    'image_url' => $cat['image_url'],
                    'display_order' => $cat['display_order']
                ], 'id = :id', ['id' => $existing['id']]);
            }
        }
    }

    private static function seedProducts(): void
    {
        $catMap = [];
        $rows = DB::fetchAll("SELECT id, slug FROM categories");
        foreach ($rows as $r) {
            $catMap[$r['slug']] = $r['id'];
        }

        $products = [
            // 1. High-Protein Office Snack Box
            [
                'sku' => 'OF-BOX-SNACK-399',
                'name' => 'High-Protein Office Snack Box (Desk Crate)',
                'slug' => 'high-protein-office-snack-box',
                'category_slug' => 'office-snack-boxes',
                'short_description' => 'Curated 5-item snack box with roasted chana, pudina makhana, soy nuts, seed mix & a protein bar.',
                'description' => 'The ultimate desk survival box for Delhi office professionals. Curated from compliant, certified Indian producers to beat 4 PM hunger without greasy fingers or sugar crashes. Includes Roasted Kala Chana, Peri Peri Makhana, Crunchy Soy Nuts, 5-Seed Trail Mix, and an Almond Protein Bar.',
                'mrp' => 499.00,
                'selling_price' => 399.00,
                'discount_percentage' => 20.0,
                'weight' => '450g Total',
                'servings' => '8-10 Desk Snacking Sessions',
                'protein' => '48g Total Protein in Box',
                'calories' => '140 kcal / serving',
                'ingredients' => 'Slow-Roasted Kala Chana, Popped Makhana, Roasted Soy Chunks, Pumpkin & Sunflower Seeds, Almond Protein Bar with Whey/Plant Protein.',
                'allergens' => 'Contains nuts, seeds, and soy.',
                'is_featured' => 1,
                'is_best_seller' => 1,
                'tags' => 'office_snack,protein_focused,desk_snack,best_seller,curated_box',
                'stock' => 250,
                'nutrition' => [
                    'serving_size' => '45g',
                    'protein_grams' => 6.2,
                    'total_calories' => 145.0,
                    'total_fat' => 3.8,
                    'saturated_fat' => 0.5,
                    'trans_fat' => 0.0,
                    'carbohydrates' => 19.5,
                    'dietary_fiber' => 4.8,
                    'added_sugars' => 0.0,
                    'sodium' => 135.0
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80'
                ]
            ],

            // 2. 7-Day Desk Snack Pack
            [
                'sku' => 'OF-PACK-7DAY-699',
                'name' => '7-Day Desk Snack Pack (Mon-Sun Sorted)',
                'slug' => '7-day-desk-snack-pack',
                'category_slug' => 'office-snack-boxes',
                'short_description' => '7 individually portioned desk snacks designed for the Monday-Sunday work week.',
                'description' => 'Seven individually portioned, keyboard-friendly snack pouches designed for each workday. Never wonder what to order at 4 PM. Monday: Pudina Makhana, Tuesday: Spiced Roasted Chana, Wednesday: Moong Jor, Thursday: Soya Crisps, Friday: 5-Seed Mix, Saturday: Protein Laddoo, Sunday: Almond Crunch.',
                'mrp' => 849.00,
                'selling_price' => 699.00,
                'discount_percentage' => 18.0,
                'weight' => '7 x 50g Pouches (350g)',
                'servings' => '7 Daily Packs',
                'protein' => 'Up to 14g Protein per pouch',
                'calories' => '130-160 kcal / pouch',
                'ingredients' => 'Curated variety of roasted Indian pulses, popped fox nuts, cold-pressed seed mixes, and zero-sugar protein bites.',
                'allergens' => 'Contains legumes, sesame, and tree nuts.',
                'is_featured' => 1,
                'is_best_seller' => 1,
                'tags' => 'weekly_pack,office_snack,protein_focused,desk_snack,best_seller',
                'stock' => 180,
                'nutrition' => [
                    'serving_size' => '50g',
                    'protein_grams' => 8.5,
                    'total_calories' => 155.0,
                    'total_fat' => 3.2,
                    'saturated_fat' => 0.4,
                    'trans_fat' => 0.0,
                    'carbohydrates' => 21.0,
                    'dietary_fiber' => 5.2,
                    'added_sugars' => 0.0,
                    'sodium' => 145.0
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80'
                ]
            ],

            // 3. Monthly Protein Box / Subscription
            [
                'sku' => 'OF-SUB-MONTHLY-1499',
                'name' => 'Monthly Protein Desk Box (30-Day Auto-Fuel)',
                'slug' => 'monthly-protein-desk-box',
                'category_slug' => 'office-snack-boxes',
                'short_description' => '30 curated desk-friendly protein snack portions for hassle-free monthly office snacking.',
                'description' => 'A complete month of clean, high-protein office snacking delivered in one sleek desk crate. Sourced from trusted Indian food craftspeople. 30 assorted packs of roasted chana, makhana, soy nuts, seed mixes, and energy bites. Zero reordering stress.',
                'mrp' => 1899.00,
                'selling_price' => 1499.00,
                'discount_percentage' => 21.0,
                'weight' => '1.5 kg (30 Individual Packs)',
                'servings' => '30 Workday Servings',
                'protein' => '220g Total Protein in Crate',
                'calories' => '140 kcal / pouch',
                'ingredients' => 'Assorted roasted pulses, fox nuts, roasted seeds, soy crisps, protein bars, and natural trail mixes.',
                'allergens' => 'Contains nuts, legumes, and seeds.',
                'is_featured' => 1,
                'is_best_seller' => 1,
                'tags' => 'monthly_box,subscription,office_snack,protein_focused,high_value',
                'stock' => 90,
                'nutrition' => [
                    'serving_size' => '50g',
                    'protein_grams' => 7.8,
                    'total_calories' => 145.0,
                    'total_fat' => 3.5,
                    'saturated_fat' => 0.5,
                    'trans_fat' => 0.0,
                    'carbohydrates' => 20.0,
                    'dietary_fiber' => 5.0,
                    'added_sugars' => 0.0,
                    'sodium' => 140.0
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80'
                ]
            ],

            // 4. Protein Breakfast Kit
            [
                'sku' => 'OF-KIT-BKFAST-499',
                'name' => 'High-Protein Breakfast Kit (Oats, Seeds & PB)',
                'slug' => 'high-protein-breakfast-kit',
                'category_slug' => 'breakfast-mixes',
                'short_description' => 'Rolled oats, 5-seed mix, natural peanut butter & protein boost for quick morning fuel.',
                'description' => 'Designed for busy professionals rushing to work in Delhi NCR. Mix rolled oats with chia, flax and pumpkin seeds, top with unsweetened roasted peanut butter and our plant-protein booster for an effortless 22g protein breakfast in under 3 minutes.',
                'mrp' => 599.00,
                'selling_price' => 499.00,
                'discount_percentage' => 17.0,
                'weight' => '650g Bundle',
                'servings' => '15 Breakfast Servings',
                'protein' => '22g Protein / Breakfast',
                'calories' => '290 kcal / serving',
                'ingredients' => 'Gluten-Free Rolled Oats (400g), Raw Chia & Pumpkin Seed Mix (100g), 100% Roasted Peanut Butter Creamy (150g).',
                'allergens' => 'Contains peanuts and seeds.',
                'is_featured' => 1,
                'is_best_seller' => 0,
                'tags' => 'quick_breakfast,protein_focused,desk_snack,high_fiber',
                'stock' => 140,
                'nutrition' => [
                    'serving_size' => '60g',
                    'protein_grams' => 14.5,
                    'total_calories' => 240.0,
                    'total_fat' => 8.5,
                    'saturated_fat' => 1.2,
                    'trans_fat' => 0.0,
                    'carbohydrates' => 28.0,
                    'dietary_fiber' => 6.5,
                    'added_sugars' => 0.0,
                    'sodium' => 35.0
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80'
                ]
            ],

            // 5. Desi Masala Roasted Kala Chana
            [
                'sku' => 'OF-CHANA-MASALA-200',
                'name' => 'Desi Masala Roasted Kala Chana (21g Protein)',
                'slug' => 'desi-masala-roasted-kala-chana',
                'category_slug' => 'desi-protein-snacks',
                'short_description' => 'Crisp oil-free slow-roasted black chickpeas dusted with authentic Delhi street spices.',
                'description' => 'Traditional roasted brown chickpeas (Kala Chana) spiced with cumin, amchur, black pepper, and rock salt. High in natural plant protein and dietary fiber, oil-free roasting, zero trans fat. The classic Indian guilt-free desk munch.',
                'mrp' => 189.00,
                'selling_price' => 149.00,
                'discount_percentage' => 21.0,
                'weight' => '200g',
                'servings' => '5 Servings',
                'protein' => '21g Protein / 100g',
                'calories' => '135 kcal / serving',
                'ingredients' => 'Roasted Black Chickpeas (94%), Indian Chaat Spices (Cumin, Amchur, Black Pepper, Red Chili, Coriander), Himalayan Pink Salt.',
                'allergens' => 'Contains chickpeas (legumes).',
                'is_featured' => 1,
                'is_best_seller' => 1,
                'tags' => 'office_snack,protein_focused,desi_snack,high_fiber,oil_free',
                'stock' => 300,
                'nutrition' => [
                    'serving_size' => '40g',
                    'protein_grams' => 8.4,
                    'total_calories' => 135.0,
                    'total_fat' => 2.1,
                    'saturated_fat' => 0.2,
                    'trans_fat' => 0.0,
                    'carbohydrates' => 22.0,
                    'dietary_fiber' => 6.8,
                    'added_sugars' => 0.0,
                    'sodium' => 140.0
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80'
                ]
            ],

            // 6. Crunchy Roasted Moong Jor & Soy Mix
            [
                'sku' => 'OF-MOONG-SOY-180',
                'name' => 'Crunchy Roasted Moong Jor & Spiced Soy Mix',
                'slug' => 'roasted-moong-jor-spiced-soy-mix',
                'category_slug' => 'desi-protein-snacks',
                'short_description' => 'Crisp roasted flattened moong dal and crunchy soy crisps with hing-jeera seasoning.',
                'description' => 'A powerhouse high-protein Indian namkeen substitute. Made from slow-roasted whole moong dal and non-GMO soy crisps tossed with royal cumin, hing, and dry mango powder. Packed with 24g protein per 100g and completely non-greasy.',
                'mrp' => 219.00,
                'selling_price' => 179.00,
                'discount_percentage' => 18.0,
                'weight' => '180g',
                'servings' => '4 Servings',
                'protein' => '24g Protein / 100g',
                'calories' => '142 kcal / serving',
                'ingredients' => 'Roasted Moong Dal (60%), Roasted Defatted Soy Flakes (30%), Olive Oil Spritz, Hing, Roasted Jeera, Pink Salt, Black Salt.',
                'allergens' => 'Contains soy and legumes.',
                'is_featured' => 1,
                'is_best_seller' => 0,
                'tags' => 'office_snack,protein_focused,desi_snack,namkeen_alternative',
                'stock' => 190,
                'nutrition' => [
                    'serving_size' => '45g',
                    'protein_grams' => 10.8,
                    'total_calories' => 142.0,
                    'total_fat' => 2.8,
                    'saturated_fat' => 0.3,
                    'trans_fat' => 0.0,
                    'carbohydrates' => 18.0,
                    'dietary_fiber' => 5.4,
                    'added_sugars' => 0.0,
                    'sodium' => 150.0
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80'
                ]
            ],

            // 7. Pudina & Peri Peri Roasted Makhana
            [
                'sku' => 'OF-MKN-PUDINA-120',
                'name' => 'Roasted Makhana — Garden Pudina & Chat',
                'slug' => 'roasted-makhana-garden-pudina-chat',
                'category_slug' => 'desi-protein-snacks',
                'short_description' => 'Popped fox nuts slow-roasted in cold-pressed olive oil, mint extract & tangy amchur.',
                'description' => 'Light, airy, and ultra-crisp Indian fox nuts (Makhana). Sourced from top Bihar cultivators and roasted with dry mint powder, cumin, and rock salt. Gluten-free, zero palm oil, and leaves zero oily residue on keyboards.',
                'mrp' => 219.00,
                'selling_price' => 169.00,
                'discount_percentage' => 23.0,
                'weight' => '120g',
                'servings' => '4 Servings',
                'protein' => '9g Protein / 100g',
                'calories' => '115 kcal / serving',
                'ingredients' => 'Popped Fox Nuts (Makhana 88%), Cold-Pressed Olive Oil, Dried Mint Powder, Amchur, Black Pepper, Himalayan Pink Salt.',
                'allergens' => 'May contain traces of tree nuts.',
                'is_featured' => 1,
                'is_best_seller' => 1,
                'tags' => 'office_snack,desk_snack,gluten_free,low_calorie',
                'stock' => 240,
                'nutrition' => [
                    'serving_size' => '30g',
                    'protein_grams' => 2.8,
                    'total_calories' => 115.0,
                    'total_fat' => 3.0,
                    'saturated_fat' => 0.4,
                    'trans_fat' => 0.0,
                    'carbohydrates' => 19.0,
                    'dietary_fiber' => 2.6,
                    'added_sugars' => 0.0,
                    'sodium' => 130.0
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80'
                ]
            ],

            // 8. Protein Moong Chilla / Dosa Instant Mix
            [
                'sku' => 'OF-MIX-CHILLA-300',
                'name' => 'High-Protein Instant Moong Chilla Mix (22g Protein)',
                'slug' => 'high-protein-instant-moong-chilla-mix',
                'category_slug' => 'breakfast-mixes',
                'short_description' => 'Indian-style instant lentil mix with added pea protein & ajwain for a 5-minute breakfast.',
                'description' => 'High-protein Indian breakfast made effortless. Made from stone-ground yellow and green moong dal enriched with natural plant protein, carom seeds (ajwain), ginger powder, and roasted cumin. Just add water and make hot, crispy protein chillas in 5 minutes.',
                'mrp' => 299.00,
                'selling_price' => 249.00,
                'discount_percentage' => 17.0,
                'weight' => '300g (Makes 8-10 Chillas)',
                'servings' => '5 Breakfasts',
                'protein' => '22g Protein / 100g',
                'calories' => '170 kcal / 2 chillas',
                'ingredients' => 'Yellow Moong Dal Flour, Green Moong Flour, Isolated Pea Protein, Cumin, Ajwain, Dry Ginger, Green Chili Powder, Pink Salt.',
                'allergens' => 'Contains legumes.',
                'is_featured' => 1,
                'is_best_seller' => 0,
                'tags' => 'quick_breakfast,protein_focused,instant_mix,desi_breakfast',
                'stock' => 160,
                'nutrition' => [
                    'serving_size' => '60g',
                    'protein_grams' => 13.2,
                    'total_calories' => 170.0,
                    'total_fat' => 1.8,
                    'saturated_fat' => 0.2,
                    'trans_fat' => 0.0,
                    'carbohydrates' => 25.0,
                    'dietary_fiber' => 4.8,
                    'added_sugars' => 0.0,
                    'sodium' => 160.0
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80'
                ]
            ],

            // 9. High-Protein Arabica Instant Coffee
            [
                'sku' => 'OF-DRK-COFFEE-200',
                'name' => 'High-Protein Arabica Coffee (15g Protein / Cup)',
                'slug' => 'high-protein-arabica-coffee',
                'category_slug' => 'protein-coffee',
                'short_description' => 'Premium South Indian Arabica coffee blended with 15g clean plant protein for morning focus.',
                'description' => 'For office professionals who already drink coffee every morning. Combines rich South Indian roasted Arabica coffee extract with 15g of micro-filtered plant protein. Delivers smooth caffeine alertness with sustained protein satiety. Zero added sugar.',
                'mrp' => 429.00,
                'selling_price' => 349.00,
                'discount_percentage' => 19.0,
                'weight' => '200g (10 Instant Servings)',
                'servings' => '10 Cups',
                'protein' => '15g Protein / Serving',
                'calories' => '95 kcal / serving',
                'ingredients' => '100% Arabica Coffee Extract, Hydrolyzed Plant Protein Isolate, Natural Cocoa, Stevia Leaf Extract.',
                'allergens' => 'Manufactured in a facility handling soy and nuts.',
                'is_featured' => 1,
                'is_best_seller' => 1,
                'tags' => 'protein_coffee,workout_snack,quick_breakfast,focus_energy',
                'stock' => 130,
                'nutrition' => [
                    'serving_size' => '20g',
                    'protein_grams' => 15.0,
                    'total_calories' => 95.0,
                    'total_fat' => 0.8,
                    'saturated_fat' => 0.1,
                    'trans_fat' => 0.0,
                    'carbohydrates' => 3.2,
                    'dietary_fiber' => 1.2,
                    'added_sugars' => 0.0,
                    'sodium' => 45.0
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80'
                ]
            ],

            // 10. Corporate Snack Box / Employee Wellness Box
            [
                'sku' => 'OF-B2B-CORP-399',
                'name' => 'Corporate Snack Box (Employee Wellness Crate)',
                'slug' => 'corporate-snack-box-employee-wellness',
                'category_slug' => 'corporate-boxes',
                'short_description' => 'Bulk curated healthy snack boxes for office teams, HR wellness perks & client meetings.',
                'description' => 'Custom curated employee wellness snack boxes for startups, agencies, and enterprises in Gurgaon, Noida, and Delhi. Includes 6 portion-packed healthy Indian snacks (Makhana, Roasted Chana, Trail Seeds, Energy Bar, Soy Crisps) in a premium branded desk crate. Bulk GST invoicing supported.',
                'mrp' => 499.00,
                'selling_price' => 399.00,
                'discount_percentage' => 20.0,
                'weight' => '400g Crate',
                'servings' => '1 Employee Weekly Crate',
                'protein' => '42g Total Protein',
                'calories' => '130 kcal / pack',
                'ingredients' => 'Curated mix of verified FSSAI compliant Indian roasted snacks and clean seed blends.',
                'allergens' => 'Contains nuts, soy, and legumes.',
                'is_featured' => 1,
                'is_best_seller' => 1,
                'tags' => 'corporate_order,b2b,office_snack,bulk_snack,wellness',
                'stock' => 500,
                'nutrition' => [
                    'serving_size' => '40g',
                    'protein_grams' => 7.0,
                    'total_calories' => 130.0,
                    'total_fat' => 3.0,
                    'saturated_fat' => 0.3,
                    'trans_fat' => 0.0,
                    'carbohydrates' => 18.0,
                    'dietary_fiber' => 4.5,
                    'added_sugars' => 0.0,
                    'sodium' => 125.0
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80'
                ]
            ]
        ];

        foreach ($products as $p) {
            $catId = $catMap[$p['category_slug']] ?? null;
            if (!$catId) {
                continue;
            }

            $existing = DB::fetchOne("SELECT id FROM products WHERE slug = :slug", ['slug' => $p['slug']]);
            $prodData = [
                'category_id' => $catId,
                'sku' => $p['sku'],
                'name' => $p['name'],
                'slug' => $p['slug'],
                'short_description' => $p['short_description'],
                'description' => $p['description'],
                'mrp' => $p['mrp'],
                'selling_price' => $p['selling_price'],
                'discount_percentage' => $p['discount_percentage'],
                'weight' => $p['weight'],
                'servings' => $p['servings'],
                'protein' => $p['protein'],
                'calories' => $p['calories'],
                'ingredients' => $p['ingredients'],
                'allergens' => $p['allergens'],
                'is_featured' => $p['is_featured'],
                'is_best_seller' => $p['is_best_seller'],
                'tags' => $p['tags'],
                'status' => 'active'
            ];

            if (!$existing) {
                $prodId = DB::insert('products', $prodData);
            } else {
                $prodId = $existing['id'];
                DB::update('products', $prodData, 'id = :id', ['id' => $prodId]);
            }

            // Seed Inventory
            $existInv = DB::fetchOne("SELECT id FROM inventory WHERE product_id = :pid", ['pid' => $prodId]);
            $invData = [
                'product_id' => $prodId,
                'stock_quantity' => $p['stock'] ?? 100,
                'low_stock_threshold' => 15,
                'is_in_stock' => 1,
                'updated_at' => date('Y-m-d H:i:s')
            ];
            if (!$existInv) {
                DB::insert('inventory', $invData);
            } else {
                DB::update('inventory', $invData, 'id = :id', ['id' => $existInv['id']]);
            }

            // Seed Nutrition
            $nut = $p['nutrition'];
            $existNut = DB::fetchOne("SELECT id FROM product_nutrition WHERE product_id = :pid", ['pid' => $prodId]);
            $nutData = [
                'product_id' => $prodId,
                'serving_size' => $nut['serving_size'],
                'protein_grams' => $nut['protein_grams'],
                'total_calories' => $nut['total_calories'],
                'total_fat' => $nut['total_fat'],
                'saturated_fat' => $nut['saturated_fat'],
                'trans_fat' => $nut['trans_fat'],
                'carbohydrates' => $nut['carbohydrates'],
                'dietary_fiber' => $nut['dietary_fiber'],
                'added_sugars' => $nut['added_sugars'],
                'sodium' => $nut['sodium']
            ];

            if (!$existNut) {
                DB::insert('product_nutrition', $nutData);
            } else {
                DB::update('product_nutrition', $nutData, 'id = :id', ['id' => $existNut['id']]);
            }

            // Seed Images
            DB::delete('product_images', 'product_id = :pid', ['pid' => $prodId]);
            foreach ($p['images'] as $idx => $imgUrl) {
                DB::insert('product_images', [
                    'product_id' => $prodId,
                    'image_url' => $imgUrl,
                    'alt_text' => $p['name'],
                    'display_order' => $idx,
                    'is_primary' => $idx === 0 ? 1 : 0
                ]);
            }
        }
    }

    private static function seedCoupons(): void
    {
        $coupons = [
            [
                'code' => 'FIRST10',
                'discount_type' => 'percentage',
                'discount_value' => 10.00,
                'min_order_amount' => 299.00,
                'max_discount_amount' => 100.00,
                'usage_limit' => 1000,
                'per_user_limit' => 1,
                'used_count' => 14,
                'start_date' => date('Y-m-d H:i:s', strtotime('-10 days')),
                'end_date' => date('Y-m-d H:i:s', strtotime('+90 days')),
                'is_active' => 1
            ],
            [
                'code' => 'FUEL20',
                'discount_type' => 'percentage',
                'discount_value' => 20.00,
                'min_order_amount' => 799.00,
                'max_discount_amount' => 250.00,
                'usage_limit' => 500,
                'per_user_limit' => 1,
                'used_count' => 28,
                'start_date' => date('Y-m-d H:i:s', strtotime('-10 days')),
                'end_date' => date('Y-m-d H:i:s', strtotime('+90 days')),
                'is_active' => 1
            ],
            [
                'code' => 'BULK30',
                'discount_type' => 'fixed',
                'discount_value' => 300.00,
                'min_order_amount' => 1499.00,
                'max_discount_amount' => 300.00,
                'usage_limit' => 200,
                'per_user_limit' => 1,
                'used_count' => 9,
                'start_date' => date('Y-m-d H:i:s', strtotime('-5 days')),
                'end_date' => date('Y-m-d H:i:s', strtotime('+90 days')),
                'is_active' => 1
            ]
        ];

        foreach ($coupons as $c) {
            $existing = DB::fetchOne("SELECT id FROM coupons WHERE code = :code", ['code' => $c['code']]);
            if (!$existing) {
                DB::insert('coupons', $c);
            }
        }
    }

    private static function seedSettings(): void
    {
        $settings = [
            ['setting_key' => 'site_name', 'setting_value' => 'OfficeFuel | Ghar Ka Market', 'category' => 'general'],
            ['setting_key' => 'tagline', 'setting_value' => 'Protein-Packed Convenience for Busy Indian Workdays', 'category' => 'general'],
            ['setting_key' => 'contact_email', 'setting_value' => 'support@officefuel.in', 'category' => 'contact'],
            ['setting_key' => 'contact_phone', 'setting_value' => '+91 98765 43210', 'category' => 'contact'],
            ['setting_key' => 'delivery_hub_city', 'setting_value' => 'Delhi NCR (Delhi, Gurgaon, Noida, Faridabad, Ghaziabad)', 'category' => 'delivery'],
            ['setting_key' => 'free_shipping_threshold', 'setting_value' => '499', 'category' => 'delivery'],
        ];

        foreach ($settings as $s) {
            $existing = DB::fetchOne("SELECT id FROM site_settings WHERE setting_key = :k", ['k' => $s['setting_key']]);
            if (!$existing) {
                DB::insert('site_settings', [
                    'setting_key' => $s['setting_key'],
                    'setting_value' => $s['setting_value'],
                    'category' => $s['category'],
                    'updated_at' => date('Y-m-d H:i:s')
                ]);
            }
        }
    }
}
