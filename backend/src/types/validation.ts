import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const googleAuthSchema = z.object({
  token: z.string(),
});

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
});

export const b2bRequestSchema = z.object({
  companyName: z.string(),
  taxId: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  b2bPrice: z.number().positive().optional(),
  categoryId: z.string(),
  imageUrl: z.string().url(),
  moq: z.number().int().positive(),
  stock: z.number().int().nonnegative(),
});

export const createOrderSchema = z.object({
  shippingAddress: z.string().min(10),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(100),
  comment: z.string().min(10).max(1000),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().min(3).max(100).optional(),
  comment: z.string().min(10).max(1000).optional(),
});

export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});
