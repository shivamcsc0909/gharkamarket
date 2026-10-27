-- ==============================================================================
-- OFFICEFUEL / GHAR KA MARKET — INITIAL SEED DATA
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`, `display_order`, `is_active`) VALUES
(1, 'Protein Snacks', 'protein-snacks', 'High-protein roasted lentils, roasted seeds, and nut mixes seasoned with authentic Indian spices.', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80', 1, 1),
(2, 'Desk Snacks', 'desk-snacks', 'Clean, non-greasy, non-sticky snacks specifically crafted for clean keyboard desk snacking.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80', 2, 1),
(3, '7-Day & Weekly Packs', '7-day-packs', 'Portion-controlled packs sorted Monday through Sunday to power your complete work week.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', 3, 1),
(4, 'Instant Breakfast & Mixes', 'breakfast-mixes', 'Nutritious roasted sattu, multigrain porridge, and instant high-protein breakfast blends.', 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80', 4, 1),
(5, 'Corporate & Office Boxes', 'corporate-boxes', 'Curated pantry & desk snack boxes for corporate teams, client gifts, and employee wellness programs.', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80', 5, 1);

-- 2. Products
INSERT INTO `products` (`id`, `sku`, `name`, `slug`, `category_id`, `short_description`, `description`, `mrp`, `selling_price`, `discount_percentage`, `weight`, `servings`, `protein`, `calories`, `ingredients`, `allergens`, `is_featured`, `is_best_seller`, `status`, `tags`, `meta_title`, `meta_description`) VALUES
(1, 'OF-MKN-MASALA-120', 'Roasted Makhana — Pudina & Chat Masala', 'roasted-makhana-pudina-chat-masala', 1, 'Crunchy slow-roasted fox nuts tossed with fresh mint leaf extract and zesty Delhi street chaat masala.', 'Our slow-roasted Fox Nuts (Makhana) are popped to perfection and tossed with cold-pressed olive oil, garden-fresh mint, and authentic Delhi street chaat masala. Packed with 9g of plant protein per 100g, low in sodium, and 100% gluten-free. Ideal for 4 PM office hunger pangs without the post-snack slump.', 199.00, 159.00, 20.00, '120g', '4 Servings', '9g Protein / 100g', '110 kcal / serving', 'Fox Nuts (Makhana 85%), Cold-Pressed Olive Oil, Dry Mint Leaf Powder, Himalayan Pink Salt, Amchur, Cumin, Black Pepper.', 'Manufactured in a facility that also processes tree nuts.', 1, 1, 'active', 'office_snack,protein_focused,desk_snack,gluten_free,best_seller', 'Roasted Makhana Pudina Chaat Masala | OfficeFuel Delhi NCR', 'Crunchy slow-roasted fox nuts with mint and Delhi chaat masala.'),
(2, 'OF-CHANA-PERI-200', 'High-Protein Roasted Kala Chana — Desi Peri Peri', 'roasted-kala-chana-desi-peri-peri', 1, 'Crisp roasted black chickpeas packed with 21g of verified protein and fiery Indian-infused Peri Peri.', 'Traditional roasted brown chickpeas (Kala Chana) given a punchy Indian peri peri twist. Provides sustained energy for desk workers and gym-goers alike. Rich in dietary fiber, zero cholesterol, and completely oil-free roasting process.', 175.00, 139.00, 21.00, '200g', '5 Servings', '21g Protein / 100g', '135 kcal / serving', 'Roasted Black Chickpeas (92%), Peri Peri Seasoning Blend (Red Chili, Garlic, Onion, Dried Lemon), Himalayan Rock Salt.', 'Contains chickpeas (legumes).', 1, 1, 'active', 'office_snack,protein_focused,workout_snack,high_fiber', 'High Protein Roasted Kala Chana Peri Peri | OfficeFuel', '21g verified protein per 100g roasted black chickpeas.'),
(3, 'OF-SEED-TRAIL-180', '5-Seed Super Trail Crunch — Smoked Cumin', '5-seed-super-trail-crunch-smoked-cumin', 2, 'Roasted Pumpkin, Sunflower, Watermelon, Chia & Flax seeds seasoned with aromatic smoked jeera.', 'The quintessential keyboard-friendly desk snack. No messy residue, 100% roasted seeds loaded with Omega-3 fatty acids, magnesium, and plant protein. Keeps you focused throughout prolonged coding sessions or Zoom calls.', 249.00, 199.00, 20.00, '180g', '6 Servings', '24g Protein / 100g', '150 kcal / serving', 'Pumpkin Seeds (30%), Sunflower Seeds (30%), Watermelon Seeds (20%), Flax Seeds (10%), Chia Seeds (5%), Smoked Cumin, Pink Salt.', 'May contain traces of sesame.', 1, 0, 'active', 'desk_snack,protein_focused,study_snack,omega3', '5-Seed Super Trail Crunch Smoked Jeera | OfficeFuel', 'Super seed mix roasted with smoked cumin for desk snacking.'),
(4, 'OF-WEEKLY-PRO-7PK', '7-Day Office Fuel Starter Box (Weekly Snack Pack)', '7-day-office-fuel-starter-box', 3, '7 individually sealed portion packs for Monday to Sunday. Zero confusion, guaranteed daily smart snacking.', 'Solve your weekday snacking permanently. This curated 7-day box features 7 individual single-serve packs: Monday (Pudina Makhana), Tuesday (Peri Peri Chana), Wednesday (Seed Trail), Thursday (Achari Soya Crisps), Friday (Roasted Jowar Puffs), Saturday (Nut & Seed Bar), and Sunday (Moong Jor Masala). Keep it at your desk or office drawer.', 699.00, 549.00, 21.00, '350g (7 x 50g)', '7 Daily Packs', '16g Average Protein / Day', '140 kcal / pack', 'Curated assortment of Makhana, Kala Chana, Super Seeds, Roasted Jowar, and Moong Crisps.', 'Contains legumes and tree nut traces.', 1, 1, 'active', 'weekly_pack,office_snack,protein_focused,corporate,best_seller', '7-Day Office Fuel Starter Box | Monday to Sunday Snack Pack', '7 portion-controlled daily snack packs for your complete work week.'),
(5, 'OF-SATTU-PRO-400', 'Instant High-Protein Chana Sattu Drink Mix — Roasted Jeera', 'instant-chana-sattu-drink-mix-roasted-jeera', 4, 'Traditional roasted Bengal gram flour drink blend with cumin, black salt, and dry lemon. Instant Indian protein fuel.', 'The original Indian protein shake with no artificial whey or synthetic sweeteners. Made from 100% stone-ground roasted chana, spiced with roasted cumin and Kala Namak. Just stir 2 scoops into 250ml water or chaas for an instant 14g clean protein breakfast on rushed mornings.', 275.00, 219.00, 20.00, '400g', '10 Servings', '23g Protein / 100g', '145 kcal / serving', 'Stone-ground Roasted Bengal Gram (Chana 94%), Roasted Cumin Powder, Rock Salt (Kala Namak), Dry Lemon Extract, Mint Powder.', 'Contains roasted legumes (chickpea).', 1, 0, 'active', 'quick_breakfast,protein_focused,instant_drink,morning_fuel', 'Instant Chana Sattu Drink Mix Roasted Jeera | OfficeFuel', 'Traditional Indian high protein breakfast shake mix.'),
(6, 'OF-CORP-BOX-20', 'Office Pantry & Team Fuel Crate (24 Assorted Packs)', 'office-pantry-team-fuel-crate', 5, 'Bulk box of 24 assorted high-protein snack pouches for office pantries, team bays, and boardrooms.', 'Upgrade your company pantry from sugary cookies and oily chips to smart Indian nutrition. Includes 24 individually portioned snack pouches in our best-selling flavours (Makhana, Peri Peri Chana, Seed Trail, Moong Jor). Custom GST invoice provided.', 1999.00, 1599.00, 20.00, '1.5 kg (24 x ~60g)', '24 Portions', 'Over 280g Total Protein', '130-160 kcal / portion', 'Assortment of roasted Makhana, roasted Chana, super seeds mix, and jowar puffs.', 'Contains legumes and seeds.', 1, 0, 'active', 'corporate_order,bulk_pantry,office_snack,b2b', 'Office Pantry Team Fuel Crate (24 Packs) | OfficeFuel Corporate', 'Bulk pantry box of 24 smart snack packs for office teams.');

-- 3. Product Images
INSERT INTO `product_images` (`product_id`, `image_url`, `alt_text`, `display_order`, `is_primary`) VALUES
(1, 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80', 'Roasted Makhana Pudina', 1, 1),
(2, 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80', 'Roasted Kala Chana Peri Peri', 1, 1),
(3, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80', '5-Seed Super Trail Crunch', 1, 1),
(4, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', '7-Day Office Fuel Box', 1, 1),
(5, 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80', 'Instant High-Protein Chana Sattu', 1, 1),
(6, 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80', 'Office Pantry Team Fuel Crate', 1, 1);

-- 4. Nutrition
INSERT INTO `product_nutrition` (`product_id`, `serving_size`, `protein_grams`, `total_calories`, `total_fat`, `saturated_fat`, `trans_fat`, `carbohydrates`, `dietary_fiber`, `added_sugars`, `sodium`) VALUES
(1, '30g', 2.70, 112.00, 3.20, 0.40, 0.00, 18.50, 2.40, 0.00, 140.00),
(2, '40g', 8.40, 135.00, 2.10, 0.20, 0.00, 22.00, 6.80, 0.00, 160.00),
(3, '30g', 7.20, 152.00, 11.80, 1.90, 0.00, 4.50, 3.60, 0.00, 95.00),
(4, '50g', 12.50, 175.00, 5.20, 0.80, 0.00, 22.00, 5.00, 0.00, 180.00),
(5, '40g', 9.20, 148.00, 2.40, 0.30, 0.00, 24.50, 6.20, 0.00, 190.00),
(6, '60g', 12.00, 160.00, 4.50, 0.60, 0.00, 22.00, 4.80, 0.00, 170.00);

-- 5. Inventory
INSERT INTO `inventory` (`product_id`, `stock_quantity`, `low_stock_threshold`, `is_in_stock`) VALUES
(1, 150, 15, 1),
(2, 220, 20, 1),
(3, 95, 10, 1),
(4, 80, 10, 1),
(5, 110, 15, 1),
(6, 45, 5, 1);

-- 6. Coupons
INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount_amount`, `usage_limit`, `per_user_limit`, `used_count`, `start_date`, `end_date`, `is_active`) VALUES
(1, 'FUELFIRST', 'percentage', 15.00, 299.00, 100.00, 1000, 1, 0, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 1),
(2, 'OFFICE10', 'percentage', 10.00, 199.00, 50.00, 5000, 3, 0, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 1),
(3, 'DELHI50', 'fixed', 50.00, 499.00, 50.00, 500, 1, 0, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH), 1);

-- 7. Site Settings
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `category`) VALUES
('announcement_banner_text', '🚀 Launch Offer: FREE Delhi NCR Express Delivery on orders above ₹499! Use code FUELFIRST for 15% off.', 'general'),
('announcement_banner_active', '1', 'general'),
('hero_title', 'Smart Indian Snacking for Busy Workdays', 'general'),
('hero_subtitle', 'Ditch the sugary biscuits and oily samosas. High-protein, clean-label roasted Indian snacks portioned for office desks and active lives in Delhi NCR.', 'general'),
('hero_cta_text', 'Explore Smart Snacks', 'general'),
('hero_cta_url', '/shop', 'general'),
('business_email', 'support@officefuel.in', 'contact'),
('business_phone', '+91 98765 43210', 'contact'),
('business_whatsapp', '+91 98765 43210', 'contact'),
('business_address', 'OfficeFuel HQ, DLF Cyber City, Phase 2, Gurugram, Delhi NCR - 122002', 'contact'),
('default_shipping_fee', '49.00', 'commerce'),
('free_shipping_threshold', '499.00', 'commerce'),
('tax_percentage', '5.0', 'commerce');

SET FOREIGN_KEY_CHECKS = 1;
