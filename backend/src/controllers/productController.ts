import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

/**
 * Helper function to apply pricing visibility rules
 * Guest (not logged in): No pricing visible - locked
 * Logged-in user: Base and sale prices visible
 * Approved B2B user: All pricing visible including B2B rates
 */
async function applyPricingRules(products: any[], userId?: string) {
  if (!userId) {
    // Guest user - hide ALL pricing
    return products.map(p => ({
      ...p,
      base_price: null,
      sale_price: null,
      sale_percentage: null,
      b2b_price: null,
      b2b_min_quantity: null,
      moq: null,
      pricingLocked: true,
    }));
  }

  // Logged-in user - check B2B approval status
  const { data: user } = await supabase
    .from("users")
    .select("b2b_approval_status")
    .eq("id", userId)
    .single();

  if (user?.b2b_approval_status !== "approved") {
    // Logged-in but not B2B approved - show base/sale price only, hide B2B
    return products.map(p => ({
      ...p,
      b2b_price: null,
      b2b_min_quantity: null,
      pricingLocked: false,
    }));
  }

  // Approved B2B user - show all pricing
  return products.map(p => ({
    ...p,
    pricingLocked: false,
  }));
}

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
    const userId = req.userId;

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
      query = query.gte("base_price", parseFloat(minPrice as string));
    }

    if (maxPrice) {
      query = query.lte("base_price", parseFloat(maxPrice as string));
    }

    const { data, error, count } = await query
      .order(sort as string, { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Apply pricing visibility rules
    const productsWithPricing = await applyPricingRules(data || [], userId);

    return res.json({
      products: productsWithPricing,
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
    const userId = req.userId;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Apply pricing visibility rules
    const [productWithPricing] = await applyPricingRules([data], userId);

    return res.json(productWithPricing);
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
    const { name, slug, description, long_description, base_price, sale_price, category_id, image_url, stock_quantity, is_featured } =
      req.body;

    const { data, error } = await supabase.from("products").insert({
      name,
      slug,
      description,
      long_description,
      base_price,
      sale_price,
      category_id,
      image_url,
      stock_quantity,
      is_featured,
      is_active: true,
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

/**
 * Get pricing info for a product
 * GET /api/products/:id/pricing
 * Returns pricing based on user tier:
 * - Guest: No pricing (pricingLocked: true)
 * - Logged-in: Base/sale prices
 * - Approved B2B: All prices including B2B rates
 */
export async function getProductPricing(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const { data: product, error } = await supabase
      .from("products")
      .select("base_price, sale_price, sale_percentage, b2b_price, b2b_min_quantity, moq")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Guest user - no pricing access
    if (!userId) {
      return res.json({
        basePrice: null,
        salePrice: null,
        salePercentage: null,
        displayPrice: null,
        b2bPrice: null,
        b2bMinQuantity: null,
        moq: null,
        isBulkEligible: false,
        pricingLocked: true,
        userTier: "guest",
      });
    }

    // Check user's B2B approval status
    const { data: user } = await supabase
      .from("users")
      .select("b2b_approval_status")
      .eq("id", userId)
      .single();

    const b2bApproved = user?.b2b_approval_status === "approved";

    // Logged-in user - show base/sale prices
    return res.json({
      basePrice: product.base_price,
      salePrice: product.sale_price,
      salePercentage: product.sale_percentage,
      displayPrice: product.sale_price || product.base_price,
      b2bPrice: b2bApproved ? product.b2b_price : null,
      b2bMinQuantity: b2bApproved ? product.b2b_min_quantity : null,
      moq: product.moq,
      isBulkEligible: b2bApproved,
      pricingLocked: false,
      userTier: b2bApproved ? "b2b_approved" : "user",
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
