import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

/**
 * Get all products with filtering
 * GET /api/products?category=&search=&sort=&minPrice=&maxPrice=
 */
export async function getProducts(req: Request, res: Response) {
  try {
    const { category, search, sort = "created_at", minPrice, maxPrice, page = "1", limit = "12" } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 12;
    const offset = (pageNum - 1) * limitNum;

    let query = supabase.from("products").select("*", { count: "exact" });

    if (category) {
      query = query.eq("category_id", category);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    if (minPrice) {
      query = query.gte("price", parseFloat(minPrice as string));
    }

    if (maxPrice) {
      query = query.lte("price", parseFloat(maxPrice as string));
    }

    const { data, error, count } = await query
      .order(sort as string, { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      products: data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get single product
 * GET /api/products/:id
 */
export async function getProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Create product (admin only)
 * POST /api/products
 */
export async function createProduct(req: Request, res: Response) {
  try {
    const { name, description, price, b2bPrice, categoryId, imageUrl, moq, stock } =
      req.body;

    const { data, error } = await supabase.from("products").insert({
      name,
      description,
      price,
      b2b_price: b2bPrice,
      category_id: categoryId,
      image_url: imageUrl,
      moq,
      stock,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Update product (admin only)
 * PUT /api/products/:id
 */
export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data[0]);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Delete product (admin only)
 * DELETE /api/products/:id
 */
export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: "Product deleted" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
