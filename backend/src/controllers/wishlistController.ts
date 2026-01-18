import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

export const getWishlist = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    // Fetch wishlist with product details from products_safe (secure pricing)
    const { data: wishlistIds, error: wishlistError } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", userId);

    if (wishlistError) {
      return res.status(500).json({ error: "Failed to fetch wishlist" });
    }

    if (!wishlistIds || wishlistIds.length === 0) {
      return res.json({ items: [] });
    }

    // Fetch products with secure pricing
    const productIds = wishlistIds.map(w => w.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products_safe")
      .select("*")
      .in("id", productIds);

    if (productsError) {
      return res.status(500).json({ error: "Failed to fetch products" });
    }

    res.json({ items: products || [] });
  } catch (error) {
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
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    if (existing) {
      return res.status(400).json({ error: "Product already in wishlist" });
    }

    // Add to wishlist
    const { data: item, error } = await supabase
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
    const { error } = await supabase
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
