export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  short_description: string;
  description: string;
  mrp: number;
  selling_price: number;
  discount_percentage: number;
  weight: string;
  servings?: string;
  protein?: string;
  calories?: string;
  ingredients?: string;
  allergens?: string;
  is_featured: number;
  is_best_seller: number;
  status: string;
  tags?: string;
  images: string[];
  primary_image: string;
  stock_quantity?: number;
  is_in_stock?: boolean;
  nutrition?: ProductNutrition;
  reviews?: Review[];
  related_products?: Partial<Product>[];
}

export interface ProductNutrition {
  serving_size: string;
  protein_grams: number;
  total_calories: number;
  total_fat: number;
  saturated_fat: number;
  trans_fat: number;
  carbohydrates: number;
  dietary_fiber: number;
  added_sugars: number;
  sodium: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  products_count?: number;
}

export interface CartItem {
  product_id: number;
  name: string;
  slug: string;
  sku: string;
  weight: string;
  protein?: string;
  mrp: number;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url: string;
  stock_available?: number;
  is_in_stock?: boolean;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
}

export interface CartCalculation {
  items: CartItem[];
  item_count: number;
  subtotal: number;
  total_savings: number;
  coupon: Coupon | { valid: false; message: string } | null;
  discount_amount: number;
  shipping_charge: number;
  free_shipping_threshold: number;
  amount_needed_for_free_shipping: number;
  tax_amount: number;
  tax_percentage: number;
  total_amount: number;
  currency: string;
  currency_symbol: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: string;
  is_admin: number;
  created_at: string;
}

export interface Address {
  id: number;
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  address_type: 'home' | 'work' | 'other';
  is_default: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  shipping_charge: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  delivery_provider: string;
  tracking_number?: string;
  tracking_url?: string;
  shipping_address: Address | Record<string, any>;
  notes?: string;
  created_at: string;
  items?: OrderItem[];
  tracking?: OrderTracking;
  status_history?: {
    from_status: string;
    to_status: string;
    comment: string;
    created_at: string;
  }[];
}

export interface OrderItem {
  id?: number;
  product_id: number;
  product_sku: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface OrderTracking {
  order_number: string;
  delivery_provider: string;
  tracking_number: string;
  tracking_url: string;
  estimated_delivery: string;
  current_status: string;
  steps: {
    status: string;
    date: string | null;
    completed: boolean;
  }[];
}

export interface Review {
  id: number;
  product_id: number;
  customer_name: string;
  rating: number;
  title?: string;
  comment: string;
  is_verified_purchase: number;
  created_at: string;
}
