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
