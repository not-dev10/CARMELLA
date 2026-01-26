import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase.js";

export const getWishlist = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const userId = req.userId;

  try {
    // ✅ OPTIMIZED: Fetch wishlist with product IDs
    const { data: wishlistItems, error: wishlistError } = await supabaseAdmin
      .from("wishlists")
      .select("product_id")
      .eq("user_id", userId);

    if (wishlistError) {
      const latency = Date.now() - startTime;
      console.error(`[WISHLIST] getWishlist error after ${latency}ms:`, wishlistError);
      return res.status(500).json({ error: "Failed to fetch wishlist" });
    }

    if (!wishlistItems || wishlistItems.length === 0) {
      const latency = Date.now() - startTime;
      console.log(`[WISHLIST] getWishlist completed - ${latency}ms, Items: 0`);
      return res.json({ items: [] });
    }

    // Fetch products in single query
    const productIds = wishlistItems.map(w => w.product_id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select(`
        id,
        name,
        slug,
        image_url,
        base_price,
        sale_price,
        b2b_price,
        rating,
        reviews_count
      `)
      .in("id", productIds);

    if (productsError) {
      const latency = Date.now() - startTime;
      console.error(`[WISHLIST] getWishlist products error after ${latency}ms:`, productsError);
      return res.status(500).json({ error: "Failed to fetch products" });
    }

    const latency = Date.now() - startTime;
    console.log(`[WISHLIST] getWishlist completed - ${latency}ms, Items: ${products?.length || 0}`);
    res.json({ items: products || [] });
  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(`[WISHLIST] getWishlist error after ${latency}ms:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    // Check if product exists
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if already in wishlist
    const { data: existing } = await supabaseAdmin
      .from("wishlists")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    if (existing) {
      return res.status(400).json({ error: "Product already in wishlist" });
    }

    // Add to wishlist
    const { data: item, error } = await supabaseAdmin
      .from("wishlists")
      .insert([{ user_id: userId, product_id: productId }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to add to wishlist" });
    }

    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    const { error } = await supabaseAdmin
      .from("wishlists")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) {
      return res.status(500).json({ error: "Failed to remove from wishlist" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
