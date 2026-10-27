import { AdminCoupon, AdminOrder, AdminProduct, AdminReview, AdminUser, AuditLog, ContactRequest, CorporateLead, DashboardMetrics } from '../types';

const API_BASE = '/api';

class AdminApiClient {
  private getToken(): string | null {
    return localStorage.getItem('of_admin_token');
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

  // Setup Wizard
  async getSetupStatus() {
    return this.request<{ is_installed: boolean }>('/setup/status');
  }

  async installSetup(payload: { name: string; email: string; password: string }) {
    return this.request<{ admin: AdminUser; token: string }>('/setup/install', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Admin Auth
  async login(payload: { email: string; password: string }) {
    return this.request<{ admin: AdminUser; token: string }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getMe() {
    return this.request<AdminUser>('/admin/auth/me');
  }

  // Dashboard
  async getStats() {
    return this.request<{ metrics: DashboardMetrics; low_stock_products: any[]; recent_orders: any[] }>('/admin/dashboard/stats');
  }

  // Products
  async getProducts(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<AdminProduct[]>(`/admin/products${query ? `?${query}` : ''}`);
  }

  async createProduct(payload: any) {
    return this.request<{ id: number }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateProduct(id: number, payload: any) {
    return this.request<null>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteProduct(id: number) {
    return this.request<null>(`/admin/products/${id}`, {
      method: 'DELETE'
    });
  }

  async importCsv(formData: FormData) {
    const token = this.getToken();
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/admin/products/import-csv`, {
      method: 'POST',
      headers,
      body: formData
    });
    return res.json();
  }

  // Categories
  async getCategories() {
    return this.request<any[]>('/admin/categories');
  }

  async createCategory(payload: any) {
    return this.request<{ id: number }>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateCategory(id: number, payload: any) {
    return this.request<null>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // Inventory
  async getInventory(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any[]>(`/admin/inventory${query ? `?${query}` : ''}`);
  }

  async adjustStock(productId: number, stockQuantity: number, reason: string) {
    return this.request<null>('/admin/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, stock_quantity: stockQuantity, reason })
    });
  }

  async getInventoryLogs(productId?: number) {
    const query = productId ? `?product_id=${productId}` : '';
    return this.request<any[]>(`/admin/inventory/logs${query}`);
  }

  // Orders
  async getOrders(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<AdminOrder[]>(`/admin/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: number) {
    return this.request<AdminOrder>(`/admin/orders/${id}`);
  }

  async updateOrderStatus(id: number, status: string, comment?: string) {
    return this.request<null>(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comment })
    });
  }

  async updateOrderTracking(id: number, trackingNumber: string, deliveryProvider: string, trackingUrl?: string) {
    return this.request<null>(`/admin/orders/${id}/tracking`, {
      method: 'PUT',
      body: JSON.stringify({ tracking_number: trackingNumber, delivery_provider: deliveryProvider, tracking_url: trackingUrl })
    });
  }

  // Coupons
  async getCoupons() {
    return this.request<AdminCoupon[]>('/admin/coupons');
  }

  async createCoupon(payload: any) {
    return this.request<{ id: number }>('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateCoupon(id: number, payload: any) {
    return this.request<null>(`/admin/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteCoupon(id: number) {
    return this.request<null>(`/admin/coupons/${id}`, {
      method: 'DELETE'
    });
  }

  // Corporate & Contact Leads
  async getCorporateLeads(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<CorporateLead[]>(`/admin/leads/corporate${query}`);
  }

  async updateCorporateLead(id: number, status: string, adminNotes?: string) {
    return this.request<null>(`/admin/leads/corporate/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, admin_notes: adminNotes })
    });
  }

  async getContactRequests() {
    return this.request<ContactRequest[]>('/admin/leads/contact');
  }

  async updateContactRequest(id: number, status: string, adminNotes?: string) {
    return this.request<null>(`/admin/leads/contact/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, admin_notes: adminNotes })
    });
  }

  // Reviews
  async getReviews(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<AdminReview[]>(`/admin/reviews${query}`);
  }

  async updateReviewStatus(id: number, status: string) {
    return this.request<null>(`/admin/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async deleteReview(id: number) {
    return this.request<null>(`/admin/reviews/${id}`, {
      method: 'DELETE'
    });
  }

  // Customers & Staff
  async getCustomers(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<any[]>(`/admin/users/customers${query}`);
  }

  async getCustomerDetail(id: number) {
    return this.request<any>(`/admin/users/customers/${id}`);
  }

  async getStaffAdmins() {
    return this.request<AdminUser[]>('/admin/users/staff');
  }

  async createStaffAdmin(payload: any) {
    return this.request<{ id: number }>('/admin/users/staff', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Content Settings
  async getSettings() {
    return this.request<Record<string, string>>('/admin/content/settings');
  }

  async updateSettings(payload: Record<string, string>) {
    return this.request<null>('/admin/content/settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // Audit Logs
  async getAuditLogs(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<AuditLog[]>(`/admin/audit-logs${query ? `?${query}` : ''}`);
  }
}

export const adminApi = new AdminApiClient();
