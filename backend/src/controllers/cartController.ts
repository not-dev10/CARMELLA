import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase.js";

export const getCart = async (req: Request, res: Response) => {
  const userId = req.userId;
  
  const { data: cart, error: cartError } = await supabaseAdmin
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

  const { data: items, error: itemsError } = await supabaseAdmin
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

  console.log("[CART] Add to cart request:", { userId, productId, quantity });

  if (!userId) {
    console.error("[CART] No user ID found in request");
    return res.status(401).json({ error: "User not authenticated" });
  }

  if (!productId || !quantity || quantity < 1) {
    console.error("[CART] Invalid product or quantity:", { productId, quantity });
    return res.status(400).json({ error: "Invalid product or quantity" });
  }

  try {
    let { data: cart, error: cartError } = await supabaseAdmin
      .from("carts")
      .select("*")
      .eq("user_id", userId)
      .single();

    console.log("[CART] Fetched cart:", { cart, cartError });

    if (cartError && cartError.code === "PGRST116") {
      console.log("[CART] Cart not found, creating new cart for user:", userId);
      const { data: newCart, error: createError } = await supabaseAdmin
        .from("carts")
        .insert([{ user_id: userId }])
        .select()
        .single();

      if (createError) {
        console.error("[CART] Failed to create cart - Full error:", JSON.stringify(createError, null, 2));
        return res.status(500).json({ error: "Failed to create cart", details: createError.message });
      }
      cart = newCart;
      console.log("[CART] New cart created:", cart);
    } else if (cartError) {
      console.error("[CART] Error fetching cart - Full error:", JSON.stringify(cartError, null, 2));
      return res.status(500).json({ error: "Failed to fetch cart", details: cartError.message });
    }

    if (!cart) {
      console.error("[CART] Cart is null after fetch/create");
      return res.status(500).json({ error: "Failed to get or create cart" });
    }

    console.log("[CART] Adding item to cart:", { cartId: cart.id, productId, quantity });

    // First try to find existing item
    const { data: existingItem } = await supabaseAdmin
      .from("cart_items")
      .select("id")
      .eq("cart_id", cart.id)
      .eq("product_id", productId)
      .single();

    let item;
    let itemError;

    if (existingItem) {
      // Update existing item
      console.log("[CART] Item exists, updating quantity");
      const result = await supabaseAdmin
        .from("cart_items")
        .update({ quantity })
        .eq("id", existingItem.id)
        .select()
        .single();
      item = result.data;
      itemError = result.error;
    } else {
      // Insert new item
      console.log("[CART] Item doesn't exist, creating new");
      const result = await supabaseAdmin
        .from("cart_items")
        .insert([{ cart_id: cart.id, product_id: productId, quantity }])
        .select()
        .single();
      item = result.data;
      itemError = result.error;
    }

    if (itemError) {
      console.error("[CART] Failed to add item - Full error:", JSON.stringify(itemError, null, 2));
      return res.status(500).json({ error: "Failed to add item to cart", details: itemError.message });
    }

    console.log("[CART] Item added successfully:", item);
    res.json({ success: true, item });
  } catch (error) {
    console.error("[CART] Unexpected error:", error);
    res.status(500).json({ error: "Internal server error", details: String(error) });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: "Invalid quantity" });
  }

  const { data: item, error } = await supabaseAdmin
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

  const { error } = await supabaseAdmin
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

  const { data: cart, error: cartError } = await supabaseAdmin
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (cartError) {
    return res.status(500).json({ error: "Failed to fetch cart" });
  }

  const { error } = await supabaseAdmin
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id);

  if (error) {
    return res.status(500).json({ error: "Failed to clear cart" });
  }

  res.json({ success: true });
};
