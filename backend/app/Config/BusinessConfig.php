<?php

namespace App\Config;

use App\Support\Env;

class BusinessConfig
{
    public static function get(): array
    {
        return [
            'brand' => [
                'name' => Env::get('BUSINESS_BRAND_NAME', 'OfficeFuel'),
                'parent_company' => Env::get('BUSINESS_PARENT_COMPANY', 'Ghar Ka Market'),
                'tagline' => 'Protein-Packed Convenience for Busy Indian Workdays',
                'description' => 'Curated high-protein Indian desk snacks, 7-day work packs, and instant breakfast mixes for busy Delhi NCR professionals. Zero cooking, zero hassle.',
                'logo_url' => Env::get('BUSINESS_LOGO_URL', '/assets/officefuel-logo.svg'),
                'favicon_url' => Env::get('BUSINESS_FAVICON_URL', '/favicon.ico'),
            ],
            'contact' => [
                'email' => Env::get('BUSINESS_EMAIL', 'support@officefuel.in'),
                'phone' => Env::get('BUSINESS_PHONE', '+91 98765 43210'),
                'whatsapp' => Env::get('BUSINESS_WHATSAPP', '+91 98765 43210'),
                'address' => Env::get('BUSINESS_ADDRESS', 'OfficeFuel HQ, DLF Cyber City, Phase 2, Gurugram, Delhi NCR - 122002, India'),
                'operating_hours' => 'Mon - Sat, 9:00 AM - 8:00 PM IST',
            ],
            'social' => [
                'instagram' => Env::get('BUSINESS_INSTAGRAM', 'https://instagram.com/officefuel.in'),
                'linkedin' => Env::get('BUSINESS_LINKEDIN', 'https://linkedin.com/company/officefuel'),
                'twitter' => Env::get('BUSINESS_TWITTER', 'https://twitter.com/officefuel'),
            ],
            'commerce' => [
                'currency' => 'INR',
                'currency_symbol' => '₹',
                'default_shipping_fee' => (float)Env::get('DEFAULT_SHIPPING_FEE', 49.00),
                'free_shipping_threshold' => (float)Env::get('FREE_SHIPPING_THRESHOLD', 499.00),
                'tax_percentage' => (float)Env::get('TAX_PERCENTAGE', 5.0), // 5% GST on packaged snacks
                'initial_focus_area' => 'Delhi NCR',
            ],
            'serviceable_pincodes' => [
                // Delhi NCR core delivery network
                '110001', '110002', '110003', '110005', '110006', '110007', '110008', '110015', '110016', '110017', '110019', '110020',
                '110025', '110029', '110030', '110037', '110048', '110049', '110065', '110070', '110075', '110085', '110092',
                '122001', '122002', '122003', '122008', '122011', '122018', '122022', // Gurugram
                '201301', '201303', '201304', '201305', '201306', '201307', '201310', // Noida & Greater Noida
                '121001', '121002', '121003', '121006', // Faridabad
                '201001', '201002', '201010', '201012'  // Ghaziabad
            ],
            'legal' => [
                'fssai_license' => Env::get('BUSINESS_FSSAI_LICENSE', 'FSSAI Lic No: [CONFIGURED_AT_LAUNCH]'),
                'gstin' => Env::get('BUSINESS_GSTIN', 'GSTIN: [CONFIGURED_AT_LAUNCH]'),
                'company_entity' => 'Ghar Ka Market E-Commerce LLP'
            ]
        ];
    }
}
