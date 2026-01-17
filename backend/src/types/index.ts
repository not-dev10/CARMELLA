export interface User {
  id: string;
  email: string;
  user_type: "customer" | "b2b_pending" | "b2b_approved" | "admin";
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_name?: string;
  google_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  b2b_price?: number;
  category_id: string;
  image_url: string;
  gallery_images?: string[];
  moq: number;
  stock: number;
  rating?: number;
  reviews_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface B2BApproval {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  company_name: string;
  tax_id?: string;
  request_date: string;
  approval_date?: string;
  expires_at?: string;
  notes?: string;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shipping_address?: string;
  created_at: string;
  updated_at: string;
}
