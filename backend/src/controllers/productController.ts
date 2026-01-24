import { Request, Response } from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { getSupabaseClient } from "../utils/supabaseClient.js";

/**
 * SECURE PRICING IMPLEMENTATION
 * ==============================
 * Uses products_safe VIEW which implements database-level RLS pricing security
 * 
 * Role Logic:
 * - Guest (not logged in):     Can see products ✅ | Can see price ❌ → "Login to view pricing"
 * - Logged-in (Pending):       Can see products ✅ | Can see price ❌ → "Approval required"
 * - Approved User:             Can see products ✅ | Can see price ✅ → Full access
 * 
 * The VIEW automatically returns NULL for prices based on user's b2b_approval_status
 * IMPORTANT: Must use getSupabaseClient(req) to pass user's auth context to the view
 */

/**
 * Get all products with filtering
 * GET /api/products?category=&search=&sort=&minPrice=&maxPrice=
 */
export async function getProducts(req: Request, res: Response) {
  try {
    const startTime = Date.now();
    const { category, search, sort = "created_at", minPrice, maxPrice, page = "1", limit = "100" } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 100;
    const offset = (pageNum - 1) * limitNum;

    // Use user-specific client to pass auth context to products_safe view
    const userSupabase = getSupabaseClient(req);
    let query = userSupabase.from("products_safe").select("*", { count: "exact" });

    if (category) {
      query = query.eq("category_id", category);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Note: Price filtering only works for approved users (others see NULL)
    if (minPrice) {
      query = query.gte("base_price", parseFloat(minPrice as string));
    }

    if (maxPrice) {
      query = query.lte("base_price", parseFloat(maxPrice as string));
    }

    const { data, error, count } = await query
      .order(sort as string, { ascending: false })
      .range(offset, offset + limitNum - 1);

    const queryTime = Date.now() - startTime;

    if (error) {
      console.error(`[PRODUCTS] getProducts error after ${queryTime}ms:`, error);
      return res.status(400).json({ error: error.message });
    }

    // Transform database fields to camelCase for frontend
    const products = (data || []).map((p: any) => ({
      ...p,
      pricingLocked: p.pricing_locked,
      userTier: p.user_tier,
    }));

    const totalTime = Date.now() - startTime;
    console.log(`[PRODUCTS] getProducts completed - Query: ${queryTime}ms, Total: ${totalTime}ms, Items: ${products.length}`);

    return res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error: any) {
    console.error("[PRODUCTS] getProducts unexpected error:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get single product
 * GET /api/products/:id
 */
export async function getProduct(req: Request, res: Response) {
  try {
    const startTime = Date.now();
    const { id } = req.params;

    // Use user-specific client to pass auth context to products_safe view
    const userSupabase = getSupabaseClient(req);
    const { data, error } = await userSupabase
      .from("products_safe")
      .select("*")
      .eq("id", id)
      .single();

    const queryTime = Date.now() - startTime;

    if (error) {
      console.error(`[PRODUCTS] getProduct error after ${queryTime}ms:`, error);
      return res.status(404).json({ error: "Product not found" });
    }

    // Transform database fields to camelCase for frontend
    const transformedProduct = {
      ...data,
      pricingLocked: data.pricing_locked,
      userTier: data.user_tier,
    };

    console.log(`[PRODUCTS] getProduct completed - ${queryTime}ms`);
    return res.json(transformedProduct);
  } catch (error: any) {
    console.error("[PRODUCTS] getProduct unexpected error:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get product by slug
 * GET /api/products/slug/:slug
 */
export async function getProductBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    // Use user-specific client to pass auth context to products_safe view
    const userSupabase = getSupabaseClient(req);
    const { data, error } = await userSupabase
      .from("products_safe")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Transform database fields to camelCase for frontend
    const transformedProduct = {
      ...data,
      pricingLocked: data.pricing_locked,
      userTier: data.user_tier,
    };

    return res.json(transformedProduct);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Create product (admin only)
 * POST /api/products
 * Note: Admins create in base products table, not the view
 */
export async function createProduct(req: Request, res: Response) {
  try {
    const { name, slug, description, long_description, base_price, sale_price, b2b_price, category_id, image_url, stock_quantity, is_featured, moq, b2b_min_quantity } =
      req.body;

    const { data, error } = await supabaseAdmin.from("products").insert({
      name,
      slug,
      description,
      long_description,
      base_price,
      sale_price,
      b2b_price,
      category_id,
      image_url,
      stock_quantity,
      is_featured,
      moq: moq || 1,
      b2b_min_quantity: b2b_min_quantity || 1,
      is_active: true,
    }).select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
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

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Product not found" });
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

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get pricing info for a product
 * GET /api/products/:id/pricing
 * Returns pricing based on user tier (handled by products_safe view)
 */
export async function getProductPricing(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from("products_safe")
      .select("base_price, sale_price, sale_percentage, b2b_price, b2b_min_quantity, moq, pricing_locked, user_tier")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Return pricing info with appropriate message based on access level
    const getMessage = (tier: string, locked: boolean) => {
      if (tier === "guest") return "Login to view pricing";
      if (locked) return "B2B approval required to view pricing";
      return "Full pricing access";
    };

    return res.json({
      basePrice: product.base_price,
      salePrice: product.sale_price,
      salePercentage: product.sale_percentage,
      displayPrice: product.sale_price || product.base_price,
      b2bPrice: product.b2b_price,
      b2bMinQuantity: product.b2b_min_quantity,
      moq: product.moq,
      isBulkEligible: product.user_tier === "b2b_approved",
      pricingLocked: product.pricing_locked,
      userTier: product.user_tier,
      message: getMessage(product.user_tier, product.pricing_locked),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
