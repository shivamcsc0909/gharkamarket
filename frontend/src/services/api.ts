import { CartCalculation, Category, Order, Product, Review, User } from '../types';

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('of_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; message?: string; data: T; errors?: any; meta?: any }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({
      success: false,
      message: 'Network error. Please check your connection.',
      data: null,
      errors: []
    }));

    if (!response.ok && data.success !== false) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // Auth APIs
  async register(payload: { name: string; email: string; password: string; phone?: string }) {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async login(payload: { email: string; password: string }) {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async googleLogin(idToken: string, fallbackProfile?: any) {
    return this.request<{ user: User; token: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken, ...fallbackProfile })
    });
  }

  async getProfile() {
    return this.request<{ user: User; profile: any; addresses: any[]; total_orders: number }>('/auth/me');
  }

  async updateProfile(payload: { name: string; phone?: string; password?: string }) {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async getAddresses() {
    return this.request<any[]>('/auth/addresses');
  }

  async addAddress(payload: any) {
    return this.request<any>('/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async deleteAddress(id: number) {
    return this.request<null>(`/auth/addresses/${id}`, {
      method: 'DELETE'
    });
  }

  async forgotPassword(email: string) {
    return this.request<null>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(payload: { email: string; token: string; password: string }) {
    return this.request<null>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Products & Categories
  async getProducts(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<Product[]>(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(slugOrId: string | number) {
    return this.request<Product>(`/products/${slugOrId}`);
  }

  async getCategories() {
    return this.request<Category[]>('/categories');
  }

  async getNeedDiscovery(need: string) {
    return this.request<Product[]>(`/products/need-discovery?need=${encodeURIComponent(need)}`);
  }

  async checkPincode(pincode: string) {
    return this.request<any>(`/delivery/check-pincode?pincode=${encodeURIComponent(pincode)}`);
  }

  // Cart & Coupon
  async calculateCart(items: { product_id: number; quantity: number }[], couponCode?: string, pincode?: string) {
    return this.request<CartCalculation>('/cart/calculate', {
      method: 'POST',
      body: JSON.stringify({ items, coupon_code: couponCode, pincode })
    });
  }

  async validateCoupon(code: string, subtotal: number) {
    return this.request<any>('/cart/validate-coupon', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal })
    });
  }

  // Checkout & Orders
  async createOrder(payload: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: any;
    items: { product_id: number; quantity: number }[];
    coupon_code?: string;
    notes?: string;
  }) {
    return this.request<{ order: Order; items: any[]; payment: any }>('/checkout/create-order', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async verifyPayment(payload: {
    order_id: number;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    return this.request<Order>('/checkout/verify-payment', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getMyOrders() {
    return this.request<Order[]>('/orders/my-orders');
  }

  async getOrderDetails(orderNumber: string) {
    return this.request<Order>(`/orders/${orderNumber}`);
  }

  async trackOrder(orderNumber: string, phone?: string) {
    const params = new URLSearchParams({ order_number: orderNumber });
    if (phone) params.append('phone', phone);
    return this.request<Order>(`/orders/track?${params.toString()}`);
  }

  // Corporate & Contact
  async submitCorporateInquiry(payload: any) {
    return this.request<any>('/corporate/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async submitContact(payload: any) {
    return this.request<any>('/contact/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Reviews
  async getProductReviews(productId: number) {
    return this.request<{ reviews: Review[]; total_reviews: number; average_rating: number }>(`/reviews/product/${productId}`);
  }

  async submitReview(payload: { product_id: number; customer_name: string; rating: number; title?: string; comment: string }) {
    return this.request<any>('/reviews/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

export const api = new ApiClient();
