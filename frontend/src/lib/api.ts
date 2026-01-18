const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get auth token from localStorage
const getAuthToken = () => {
  const session = localStorage.getItem("sb-session");
  if (session) {
    try {
      const parsed = JSON.parse(session);
      return parsed.access_token;
    } catch {
      return null;
    }
  }
  return null;
};

// Make API request
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }

  return response.json();
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
