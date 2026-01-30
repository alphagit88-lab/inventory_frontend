const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiError {
  message: string;
}

export interface User {
  id?: string;
  userId?: string;
  email: string;
  role: 'super_admin' | 'store_admin' | 'location_user';
  tenantId?: string | null;
  locationId?: string | null;
  tenant?: { id: string; name: string } | null;
  location?: { id: string; name: string } | null;
  isActive?: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  subscription_status: string;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  tenant?: Tenant;
}

export interface Product {
  id: string;
  name: string;
  product_code?: string;
  category?: string;
  discount?: number;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  variant_name: string;
  product?: Product;
}

export interface Inventory {
  id: string;
  quantity: number;
  cost_price: number;
  selling_price: number;
  location?: Location;
  product_variant?: ProductVariant;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name?: string;
  total_amount: number;
  tax_amount: number;
  change_amount?: number | null;
  created_at: string;
  location?: Location;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  subtotal: number;
  discount?: number;
  original_price?: number;
  product_variant?: ProductVariant;
}

export interface StockReport {
  id: string;
  quantity: number;
  cost_price: number;
  selling_price: number;
  product_variant?: ProductVariant;
  location?: Location;
}

export interface StockMovement {
  id: string;
  type: 'in' | 'out';
  quantity: number;
  cost_price?: number;
  selling_price?: number;
  created_at: string;
  product_variant?: ProductVariant;
  location?: Location;
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

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        if (!response.ok) {
          const errorMessage = (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string')
            ? data.message
            : `Server error: ${response.status} ${response.statusText}`;
          throw new Error(errorMessage);
        }

        return data as T;
      } else {
        // If not JSON, read as text for better error messages
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }
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
    locationId?: string;
  }) {
    return this.request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async registerSuperAdmin(data: {
    email: string;
    password: string;
    role: 'super_admin';
  }) {
    return this.request<{ user: User }>('/auth/register-super-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string, tenantId?: string, locationId?: string) {
    return this.request<{ message: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, tenantId, locationId }),
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

  async switchContext(tenantId: string | null, locationId: string | null) {
    return this.request<{ message: string; context: { tenantId: string | null; locationId: string | null } }>('/auth/switch-context', {
      method: 'POST',
      body: JSON.stringify({ tenantId, locationId }),
    });
  }

  // Public endpoints (for registration - no authentication required)
  async getPublicTenants() {
    return this.request<Tenant[]>('/public/tenants');
  }

  async getPublicLocations(tenantId: string) {
    return this.request<Location[]>(`/public/locations/${tenantId}`);
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

  // Location endpoints
  async getLocations() {
    return this.request<Location[]>('/locations');
  }

  async getLocation(id: string) {
    return this.request<Location>(`/locations/${id}`);
  }

  async createLocation(data: { name: string; address?: string; phone?: string; tenantId?: string }) {
    return this.request<Location>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLocation(id: string, data: Partial<Location>) {
    return this.request<Location>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLocation(id: string) {
    return this.request<{ message: string }>(`/locations/${id}`, {
      method: 'DELETE',
    });
  }

  async getLocationsByTenant(tenantId: string) {
    return this.request<Location[]>(`/locations/by-tenant/${tenantId}`);
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

  async createProduct(data: { name: string; category?: string; discount?: number; product_code?: string; tenantId?: string }) {
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

  async createVariant(productId: string, data: { variant_name: string }) {
    return this.request<ProductVariant>(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async searchProductsByCode(code: string) {
    return this.request<ProductVariant[]>(`/products/search/code?code=${encodeURIComponent(code)}`);
  }

  // Inventory endpoints
  async stockIn(data: {
    productVariantId: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
    supplier?: string;
    locationId?: string;
  }) {
    return this.request<Inventory>('/inventory/stock-in', {
      method: 'POST',
      body: JSON.stringify({
        productVariantId: data.productVariantId,
        quantity: data.quantity,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        supplier: data.supplier,
        locationId: data.locationId,
      }),
    });
  }

  async getInventoryByLocation(locationId: string) {
    return this.request<Inventory[]>(`/inventory/location/${locationId}`);
  }

  async getInventoryByTenant() {
    return this.request<Inventory[]>('/inventory/tenant');
  }

  async checkStock(locationId: string, productVariantId: string) {
    return this.request<{
      available: boolean;
      quantity: number;
      costPrice: number;
      sellingPrice: number;
      discount?: number;
      discountedPrice?: number;
    }>(`/inventory/check-stock?locationId=${locationId}&productVariantId=${productVariantId}`);
  }

  async getStockMovements(params: {
    locationId: string;
    productVariantId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.set('locationId', params.locationId);
    if (params.productVariantId) queryParams.set('productVariantId', params.productVariantId);
    if (params.startDate) queryParams.set('startDate', params.startDate);
    if (params.endDate) queryParams.set('endDate', params.endDate);
    return this.request<StockMovement[]>(`/inventory/stock-movements?${queryParams.toString()}`);
  }

  async getStockStatus(params?: {
    locationId?: string;
    size?: string;
    category?: string;
    brand?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.locationId) queryParams.set('locationId', params.locationId);
    if (params?.size) queryParams.set('size', params.size);
    if (params?.category) queryParams.set('category', params.category);
    if (params?.brand) queryParams.set('brand', params.brand);
    const query = queryParams.toString();
    return this.request<Inventory[]>(`/inventory/stock-status${query ? `?${query}` : ''}`);
  }

  async getLocalStockReport(locationId: string) {
    return this.request<StockReport[]>(`/inventory/location/${locationId}/report`);
  }

  // Invoice endpoints
  async createInvoice(data: {
    items: Array<{ productVariantId: string; quantity: number }>;
    taxAmount?: number;
    changeAmount?: number;
    locationId?: string;
    customerName?: string;
  }) {
    return this.request<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInvoice(id: string) {
    return this.request<Invoice>(`/invoices/${id}`);
  }

  async getInvoicesByLocation(locationId: string) {
    return this.request<Invoice[]>(`/invoices/location/${locationId}`);
  }

  async getInvoicesByTenant() {
    return this.request<Invoice[]>('/invoices/tenant/all');
  }

  async getInvoicesByDateRange(locationId: string, startDate: string, endDate: string) {
    return this.request<Invoice[]>(
      `/invoices/reports/date-range?locationId=${locationId}&startDate=${startDate}&endDate=${endDate}`
    );
  }

  async calculateProfit(locationId: string, startDate: string, endDate: string) {
    return this.request<{
      totalRevenue: number;
      totalCost: number;
      profit: number;
      invoiceCount: number;
    }>(`/invoices/reports/profit?locationId=${locationId}&startDate=${startDate}&endDate=${endDate}`);
  }

  async getDailySales(locationId: string, date?: string) {
    const dateParam = date || new Date().toISOString().split('T')[0];
    return this.request<{
      date: string;
      locationId: string;
      totalRevenue: number;
      totalInvoices: number;
      invoices: Invoice[];
    }>(`/invoices/reports/daily-sales?locationId=${locationId}&date=${dateParam}`);
  }

  // User endpoints
  async getUsersByTenant() {
    return this.request<User[]>('/users/tenant');
  }

  async getUsersByLocation(locationId: string) {
    return this.request<User[]>(`/users/location/${locationId}`);
  }

  async getUser(id: string) {
    return this.request<User>(`/users/${id}`);
  }

  async createLocationUser(data: { email: string; password: string; locationId: string }) {
    return this.request<User>('/users/location-user', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createStoreAdmin(data: { email: string; password: string; tenantId?: string; locationId?: string }) {
    return this.request<User>('/users/store-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: { email?: string; locationId?: string }) {
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

  async toggleUserStatus(id: string) {
    return this.request<User>(`/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  // System endpoints
  async getSystemOverview() {
    return this.request<{
      summary: {
        totalTenants: number;
        totalLocations: number;
        totalUsers: number;
        totalInventoryItems: number;
        totalRevenueLast30Days: number;
      };
      tenants: Array<{
        id: string;
        name: string;
        subscriptionStatus: string;
        createdAt: string | Date;
        locationCount: number;
      }>;
      locations: Array<{
        id: string;
        name: string;
        address?: string;
        phone?: string;
        tenantName: string;
        tenantId: string;
      }>;
      users: Array<{
        id: string;
        email: string;
        role: string;
        tenantName: string | null;
        locationName: string | null;
      }>;
      inventoryItems: Array<{
        id: string;
        productName: string;
        variantName: string;
        quantity: number;
        costPrice: number;
        sellingPrice: number;
        locationName: string;
        tenantName: string;
      }>;
      revenue: {
        total: number;
        byTenant: Array<{
          tenantName: string;
          totalRevenue: number;
          invoiceCount: number;
        }>;
        byLocation?: Array<{
          tenantName: string;
          locationName: string;
          totalRevenue: number;
          invoiceCount: number;
        }>;
      };
      recentActivity: {
        recentInvoices: Array<{
          id: string;
          invoiceNumber: string;
          totalAmount: number;
          tenantName: string;
          locationName: string;
          createdAt: string | Date;
        }>;
      };
      timestamp: Date;
    }>('/system/overview');
  }
}

export const api = new ApiClient(API_BASE_URL);

