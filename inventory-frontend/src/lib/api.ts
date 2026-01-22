const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiError {
  message: string;
}

export interface User {
  id?: string;
  userId?: string;
  email: string;
  role: 'super_admin' | 'store_admin' | 'branch_user';
  tenantId?: string | null;
  branchId?: string | null;
  branch?: Branch | null;
}

export interface Tenant {
  id: string;
  name: string;
  subscription_status: string;
  created_at: string;
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  tenant?: Tenant;
}

export interface Product {
  id: string;
  name: string;
  category?: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  brand: string;
  size: string;
  product?: Product;
}

export interface Inventory {
  id: string;
  quantity: number;
  cost_price: number;
  selling_price: number;
  branch?: Branch;
  product_variant?: ProductVariant;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  tax_amount: number;
  change_amount?: number | null;
  created_at: string;
  branch?: Branch;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  subtotal: number;
  product_variant?: ProductVariant;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for session cookies
    };

    try {
      const response = await fetch(url, config);
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, read as text for better error messages
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        // Improve error messages for connection issues
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error(`Cannot connect to backend at ${url}. Make sure backend is running on http://localhost:5000`);
        }
        throw error;
      }
      throw new Error('Network error - check if backend is running');
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    role: string;
    tenantId?: string;
    branchId?: string;
  }) {
    return this.request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ message: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request<{ user: User }>('/auth/profile');
  }

  // Public endpoints (for registration - no authentication required)
  async getPublicTenants() {
    return this.request<Tenant[]>('/public/tenants');
  }

  async getPublicBranches(tenantId: string) {
    return this.request<Branch[]>(`/public/branches/${tenantId}`);
  }

  // Tenant endpoints
  async getTenants() {
    return this.request<Tenant[]>('/tenants');
  }

  async getTenant(id: string) {
    return this.request<Tenant>(`/tenants/${id}`);
  }

  async createTenant(data: { name: string; subscription_status?: string }) {
    return this.request<Tenant>('/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTenant(id: string, data: Partial<Tenant>) {
    return this.request<Tenant>(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTenant(id: string) {
    return this.request<{ message: string }>(`/tenants/${id}`, {
      method: 'DELETE',
    });
  }

  // Branch endpoints
  async getBranches() {
    return this.request<Branch[]>('/branches');
  }

  async getBranch(id: string) {
    return this.request<Branch>(`/branches/${id}`);
  }

  async createBranch(data: { name: string; address?: string; phone?: string }) {
    return this.request<Branch>('/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBranch(id: string, data: Partial<Branch>) {
    return this.request<Branch>(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBranch(id: string) {
    return this.request<{ message: string }>(`/branches/${id}`, {
      method: 'DELETE',
    });
  }

  // Product endpoints
  async getProducts() {
    return this.request<Product[]>('/products');
  }

  async getProduct(id: string) {
    return this.request<Product>(`/products/${id}`);
  }

  async searchProducts(search: string) {
    return this.request<ProductVariant[]>(`/products/search?search=${encodeURIComponent(search)}`);
  }

  async createProduct(data: { name: string; category?: string }) {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<Product>) {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Product Variant endpoints
  async getVariants(productId: string) {
    return this.request<ProductVariant[]>(`/products/${productId}/variants`);
  }

  async createVariant(productId: string, data: { brand: string; size: string }) {
    return this.request<ProductVariant>(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Inventory endpoints
  async stockIn(data: {
    productVariantId: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
    supplier?: string;
    branchId?: string;
  }) {
    return this.request<Inventory>('/inventory/stock-in', {
      method: 'POST',
      body: JSON.stringify({
        productVariantId: data.productVariantId,
        quantity: data.quantity,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        supplier: data.supplier,
        branchId: data.branchId,
      }),
    });
  }

  async getInventoryByBranch(branchId: string) {
    return this.request<Inventory[]>(`/inventory/branch/${branchId}`);
  }

  async getInventoryByTenant() {
    return this.request<Inventory[]>('/inventory/tenant');
  }

  async checkStock(branchId: string, productVariantId: string) {
    return this.request<{
      available: boolean;
      quantity: number;
      costPrice: number;
      sellingPrice: number;
    }>(`/inventory/check-stock?branchId=${branchId}&productVariantId=${productVariantId}`);
  }

  async getStockMovements(params: {
    branchId: string;
    productVariantId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.set('branchId', params.branchId);
    if (params.productVariantId) queryParams.set('productVariantId', params.productVariantId);
    if (params.startDate) queryParams.set('startDate', params.startDate);
    if (params.endDate) queryParams.set('endDate', params.endDate);
    return this.request<any[]>(`/inventory/stock-movements?${queryParams.toString()}`);
  }

  async getStockStatus(params?: {
    branchId?: string;
    size?: string;
    category?: string;
    brand?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.branchId) queryParams.set('branchId', params.branchId);
    if (params?.size) queryParams.set('size', params.size);
    if (params?.category) queryParams.set('category', params.category);
    if (params?.brand) queryParams.set('brand', params.brand);
    const query = queryParams.toString();
    return this.request<any[]>(`/inventory/stock-status${query ? `?${query}` : ''}`);
  }

  async getLocalStockReport(branchId: string) {
    return this.request<any[]>(`/inventory/branch/${branchId}/report`);
  }

  // Invoice endpoints
  async createInvoice(data: {
    items: Array<{ productVariantId: string; quantity: number }>;
    taxAmount?: number;
    changeAmount?: number;
    branchId?: string;
  }) {
    return this.request<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInvoice(id: string) {
    return this.request<Invoice>(`/invoices/${id}`);
  }

  async getInvoicesByBranch(branchId: string) {
    return this.request<Invoice[]>(`/invoices/branch/${branchId}`);
  }

  async getInvoicesByTenant() {
    return this.request<Invoice[]>('/invoices/tenant/all');
  }

  async getInvoicesByDateRange(branchId: string, startDate: string, endDate: string) {
    return this.request<Invoice[]>(
      `/invoices/reports/date-range?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`
    );
  }

  async calculateProfit(branchId: string, startDate: string, endDate: string) {
    return this.request<{
      totalRevenue: number;
      totalCost: number;
      profit: number;
      invoiceCount: number;
    }>(`/invoices/reports/profit?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`);
  }

  async getDailySales(branchId: string, date?: string) {
    const dateParam = date || new Date().toISOString().split('T')[0];
    return this.request<{
      date: string;
      branchId: string;
      totalRevenue: number;
      totalInvoices: number;
      invoices: Invoice[];
    }>(`/invoices/reports/daily-sales?branchId=${branchId}&date=${dateParam}`);
  }

  // User endpoints
  async getUsersByTenant() {
    return this.request<User[]>('/users/tenant');
  }

  async getUsersByBranch(branchId: string) {
    return this.request<User[]>(`/users/branch/${branchId}`);
  }

  async getUser(id: string) {
    return this.request<User>(`/users/${id}`);
  }

  async createBranchUser(data: { email: string; password: string; branchId: string }) {
    return this.request<User>('/users/branch-user', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: { email?: string; branchId?: string }) {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // System endpoints
  async getSystemOverview() {
    return this.request<{
      summary: {
        totalTenants: number;
        totalBranches: number;
        totalUsers: number;
        totalInventoryItems: number;
        totalRevenueLast30Days: number;
      };
      tenants: any[];
      branches: any[];
      users: any[];
      inventoryItems: any[];
      revenue: {
        total: number;
        byTenant: Array<{
          tenantName: string;
          totalRevenue: number;
          invoiceCount: number;
        }>;
      };
      recentActivity: {
        recentInvoices: Invoice[];
      };
      timestamp: Date;
    }>('/system/overview');
  }
}

export const api = new ApiClient(API_BASE_URL);

