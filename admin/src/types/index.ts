export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'support' | 'order_manager';
  status: string;
  last_login_at?: string;
  created_at: string;
}

export interface DashboardMetrics {
  total_revenue: number;
  today_revenue: number;
  total_orders: number;
  today_orders: number;
  total_users: number;
  active_users: number;
  low_stock_count: number;
  new_corporate_leads: number;
  new_contact_requests: number;
  status_breakdown: Record<string, number>;
}

export interface AdminProduct {
  id: number;
  sku: string;
  name: string;
  slug: string;
  category_id: number;
  category_name?: string;
  short_description?: string;
  description?: string;
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
  stock_quantity?: number;
  low_stock_threshold?: number;
  is_in_stock?: number;
  images?: string[];
  primary_image?: string;
  nutrition?: any;
}

export interface AdminOrder {
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
  payment_status: string;
  order_status: string;
  delivery_provider: string;
  tracking_number?: string;
  tracking_url?: string;
  shipping_address: any;
  notes?: string;
  created_at: string;
  items?: any[];
  status_history?: any[];
}

export interface AdminCoupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit?: number;
  used_count: number;
  per_user_limit: number;
  start_date?: string;
  end_date?: string;
  is_active: number;
}

export interface CorporateLead {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  employee_count: string;
  snack_requirement: string;
  estimated_budget?: string;
  message?: string;
  status: 'new' | 'contacted' | 'in_progress' | 'closed';
  admin_notes?: string;
  created_at: string;
}

export interface ContactRequest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  admin_notes?: string;
  created_at: string;
}

export interface AdminReview {
  id: number;
  product_id: number;
  product_name?: string;
  product_slug?: string;
  customer_name: string;
  rating: number;
  title?: string;
  comment: string;
  is_verified_purchase: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface AuditLog {
  id: number;
  admin_user_id?: number;
  admin_email: string;
  action: string;
  entity: string;
  entity_id?: string;
  ip_address?: string;
  details?: any;
  created_at: string;
}
