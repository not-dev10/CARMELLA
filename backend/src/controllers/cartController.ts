import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

export const getCart = async (req: Request, res: Response) => {
  const userId = req.userId;
  
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (cartError && cartError.code !== "PGRST116") {
    return res.status(500).json({ error: "Failed to fetch cart" });
  }

  if (!cart) {
    return res.json({ items: [], total: 0 });
  }

  const { data: items, error: itemsError } = await supabase
    .from("cart_items")
    .select("*, products(*)")
    .eq("cart_id", cart.id);

  if (itemsError) {
    return res.status(500).json({ error: "Failed to fetch cart items" });
  }

  res.json({ cart, items });
};

export const addToCart = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ error: "Invalid product or quantity" });
  }

  let { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (cartError && cartError.code === "PGRST116") {
    const { data: newCart, error: createError } = await supabase
      .from("carts")
      .insert([{ user_id: userId }])
      .select()
      .single();

    if (createError) {
      return res.status(500).json({ error: "Failed to create cart" });
    }
    cart = newCart;
  }

  const { data: item, error: itemError } = await supabase
    .from("cart_items")
    .upsert([{ cart_id: cart.id, product_id: productId, quantity }])
    .select()
    .single();

  if (itemError) {
    return res.status(500).json({ error: "Failed to add item to cart" });
  }

  res.json({ success: true, item });
};

export const updateCartItem = async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: "Invalid quantity" });
  }

  const { data: item, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", itemId)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to update cart item" });
  }

  res.json({ success: true, item });
};

export const removeFromCart = async (req: Request, res: Response) => {
  const { itemId } = req.params;

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    return res.status(500).json({ error: "Failed to remove item from cart" });
  }

  res.json({ success: true });
};

export const clearCart = async (req: Request, res: Response) => {
  const userId = req.userId;

  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (cartError) {
    return res.status(500).json({ error: "Failed to fetch cart" });
  }

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id);

  if (error) {
    return res.status(500).json({ error: "Failed to clear cart" });
  }

  res.json({ success: true });
};
