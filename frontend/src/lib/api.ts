const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get auth token from Supabase session
const getAuthToken = async () => {
  try {
    // Import supabase client
    const { supabase } = await import('./supabase');
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    // Fallback to localStorage
    const authKey = Object.keys(localStorage).find(k => k.includes('supabase'));
    if (authKey) {
      try {
        const data = localStorage.getItem(authKey);
        if (data) {
          const parsed = JSON.parse(data);
          return parsed.access_token || null;
        }
      } catch {
        return null;
      }
    }
    return null;
  }
};

// Make API request
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await getAuthToken();

  console.log("[API] Request:", { method: options.method || "GET", endpoint, hasToken: !!token });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log("[API] Response status:", response.status, "for", endpoint);

  if (!response.ok) {
    const error = await response.json();
    console.error("[API] Error response:", error);
    throw new Error(error.error || "API request failed");
  }

  const data = await response.json();
  console.log("[API] Success response:", { endpoint, dataKeys: Object.keys(data) });
  return data;
};

// Homepage API
export const homepageAPI = {
  getContent: () => apiRequest("/homepage/content"),
  getSection: (section: string) => apiRequest(`/homepage/content/${section}`),
  updateSection: (section: string, content: any) =>
    apiRequest(`/homepage/content/${section}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),
  getFeaturedProducts: () => apiRequest("/homepage/featured-products"),
  getCategories: () => apiRequest("/homepage/categories"),
};

// Products API
export const productsAPI = {
  getAll: (params?: { category?: string; search?: string; limit?: number; offset?: number }) =>
    apiRequest(`/products${params ? `?${new URLSearchParams(params as any).toString()}` : ""}`),
  getById: (id: string) => apiRequest(`/products/${id}`),
  getPricing: (id: string) => apiRequest(`/products/${id}/pricing`),
  create: (data: any) =>
    apiRequest("/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiRequest(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiRequest(`/products/${id}`, { method: "DELETE" }),
};

// Cart API
export const cartAPI = {
  get: () => apiRequest("/cart"),
  add: (productId: string, quantity: number) =>
    apiRequest("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),
  update: (itemId: string, quantity: number) =>
    apiRequest(`/cart/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),
  remove: (itemId: string) => apiRequest(`/cart/${itemId}`, { method: "DELETE" }),
  clear: () => apiRequest("/cart", { method: "DELETE" }),
};

// Orders API
export const ordersAPI = {
  create: (shippingAddress: string) =>
    apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify({ shippingAddress }),
    }),
  getAll: () => apiRequest("/orders"),
  getById: (id: string) => apiRequest(`/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    apiRequest(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

// Wishlist API
export const wishlistAPI = {
  get: () => apiRequest("/wishlist"),
  add: (productId: string) => apiRequest(`/wishlist/${productId}`, { method: "POST" }),
  remove: (productId: string) => apiRequest(`/wishlist/${productId}`, { method: "DELETE" }),
};

// User API
export const userAPI = {
  requestB2BAccess: (userId: string, data: { 
    companyName: string; 
    taxId?: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    businessType?: string;
    orderQuantity?: string;
    purchaseFrequency?: string;
    reason?: string;
  }) =>
    apiRequest(`/users/${userId}/request-b2b`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getB2BStatus: (userId: string) => apiRequest(`/users/${userId}/b2b-status`),
};

// Reviews API
export const reviewsAPI = {
  getByProduct: (productId: string) => apiRequest(`/reviews/products/${productId}`),
  create: (productId: string, data: any) =>
    apiRequest(`/reviews/products/${productId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/reviews/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiRequest(`/reviews/${id}`, { method: "DELETE" }),
  markHelpful: (id: string) => apiRequest(`/reviews/${id}/helpful`, { method: "POST" }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => apiRequest("/categories"),
  create: (data: any) =>
    apiRequest("/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiRequest(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiRequest(`/categories/${id}`, { method: "DELETE" }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => apiRequest("/admin/analytics/dashboard"),
  getSalesTrend: (days?: number) =>
    apiRequest(`/admin/analytics/sales-trend${days ? `?days=${days}` : ""}`),
  getRevenueByCategory: () => apiRequest("/admin/analytics/revenue-by-category"),
  getTopProducts: (limit?: number) =>
    apiRequest(`/admin/analytics/top-products${limit ? `?limit=${limit}` : ""}`),
};

// Admin API
export const adminAPI = {
  getUsers: (params?: { search?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;
    console.log("[adminAPI] getUsers endpoint:", endpoint);
    return apiRequest(endpoint);
  },
  getUser: (id: string) => apiRequest(`/admin/users/${id}`),
  updateUser: (id: string, data: any) =>
    apiRequest(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  getOrders: (params?: { status?: string; page?: number; limit?: number }) =>
    apiRequest(`/admin/orders${params ? `?${new URLSearchParams(params as any).toString()}` : ""}`),
  updateOrderStatus: (orderId: string, status: string) =>
    apiRequest(`/admin/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  deleteOrder: (orderId: string) =>
    apiRequest(`/admin/orders/${orderId}`, {
      method: "DELETE",
    }),
  getB2BRequests: (params?: { status?: string; page?: number; limit?: number }) =>
    apiRequest(`/admin/b2b-requests${params ? `?${new URLSearchParams(params as any).toString()}` : ""}`),
  approveB2BRequest: (userId: string, notes?: string) =>
    apiRequest(`/admin/b2b-requests/${userId}/approve`, {
      method: "PUT",
      body: JSON.stringify({ notes }),
    }),
  rejectB2BRequest: (userId: string, reason?: string) =>
    apiRequest(`/admin/b2b-requests/${userId}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),
};
