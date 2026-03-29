import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase.js";

export const getCart = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const userId = req.userId;
  
  try {
    // ✅ OPTIMIZED: Single nested query with all product details + buy_mode
    const { data: cart, error: cartError } = await supabaseAdmin
      .from("carts")
      .select(`
        id,
        cart_items(
          id,
          quantity,
          buy_mode,
          products(
            id, 
            name, 
            slug, 
            image_url, 
            gallery_urls,
            base_price, 
            sale_price,
            b2b_price,
            moq,
            stock_quantity,
            category_id
          )
        )
      `)
      .eq("user_id", userId)
      .single();

    if (cartError) {
      const latency = Date.now() - startTime;
      console.error(`[CART] getCart error after ${latency}ms:`, cartError);
      return res.status(500).json({ error: "Failed to fetch cart" });
    }

    if (!cart) {
      const latency = Date.now() - startTime;
      console.log(`[CART] getCart completed - ${latency}ms, Items: 0`);
      return res.json({ items: [], total: 0 });
    }

    const latency = Date.now() - startTime;
    const items = cart.cart_items || [];
    
    // ✅ Calculate total based on buy_mode
    const total = items.reduce((sum, item: any) => {
      const buyMode = item.buy_mode || 'retail';
      let price = 0;
      
      if (buyMode === 'bulk' && item.products?.b2b_price) {
        price = item.products.b2b_price;
      } else if (item.products?.sale_price) {
        price = item.products.sale_price;
      } else {
        price = item.products?.base_price || 0;
      }
      
      return sum + (price * item.quantity);
    }, 0);
    
    console.log(`[CART] getCart completed - ${latency}ms, Items: ${items.length}, Total: $${total.toFixed(2)}`);
    res.json({ items, total });
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error(`[CART] getCart error after ${latency}ms:`, error);
    return res.status(500).json({ error: error.message });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const userId = req.userId;
  const { productId, quantity, buyMode } = req.body; // ✅ Extract buyMode

  console.log("[CART] Add to cart request:", { userId, productId, quantity, buyMode });

  if (!userId) {
    const latency = Date.now() - startTime;
    console.error(`[CART] No user ID found after ${latency}ms`);
    return res.status(401).json({ error: "User not authenticated" });
  }

  if (!productId || !quantity || quantity < 1) {
    const latency = Date.now() - startTime;
    console.error(`[CART] Invalid product or quantity after ${latency}ms:`, { productId, quantity });
    return res.status(400).json({ error: "Invalid product or quantity" });
  }

  // Validate buyMode
  const validBuyMode = buyMode === 'bulk' || buyMode === 'retail' ? buyMode : 'retail';

  try {
    let { data: cart, error: cartError } = await supabaseAdmin
      .from("carts")
      .select("id, user_id")
      .eq("user_id", userId)
      .single();

    const cartFetchTime = Date.now() - startTime;
    console.log(`[CART] Fetched cart after ${cartFetchTime}ms:`, { cart, cartError });

    if (cartError && cartError.code === "PGRST116") {
      console.log("[CART] Cart not found, creating new cart for user:", userId);
      const { data: newCart, error: createError } = await supabaseAdmin
        .from("carts")
        .insert([{ user_id: userId }])
        .select()
        .single();

      const cartCreateTime = Date.now() - startTime;

      if (createError) {
        console.error(`[CART] Failed to create cart after ${cartCreateTime}ms - Full error:`, JSON.stringify(createError, null, 2));
        return res.status(500).json({ error: "Failed to create cart", details: createError.message });
      }
      cart = newCart;
      console.log(`[CART] New cart created after ${cartCreateTime}ms:`, cart);
    } else if (cartError) {
      const cartErrorTime = Date.now() - startTime;
      console.error(`[CART] Error fetching cart after ${cartErrorTime}ms - Full error:`, JSON.stringify(cartError, null, 2));
      return res.status(500).json({ error: "Failed to fetch cart", details: cartError.message });
    }

    if (!cart) {
      const latency = Date.now() - startTime;
      console.error(`[CART] Cart is null after ${latency}ms`);
      return res.status(500).json({ error: "Failed to get or create cart" });
    }

    console.log("[CART] Adding item to cart:", { cartId: cart.id, productId, quantity, buyMode: validBuyMode });

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
      // Update existing item - update both quantity and buy_mode
      console.log("[CART] Item exists, updating quantity and buy_mode");
      const result = await supabaseAdmin
        .from("cart_items")
        .update({ quantity, buy_mode: validBuyMode }) // ✅ Update buy_mode
        .eq("id", existingItem.id)
        .select()
        .single();
      item = result.data;
      itemError = result.error;
    } else {
      // Insert new item with buy_mode
      console.log("[CART] Item doesn't exist, creating new");
      const result = await supabaseAdmin
        .from("cart_items")
        .insert([{ 
          cart_id: cart.id, 
          product_id: productId, 
          quantity,
          buy_mode: validBuyMode // ✅ Include buy_mode
        }])
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

  // ✅ OPTIMIZED: Get cart ID in single query
  const { data: cart, error: cartError } = await supabaseAdmin
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (cartError || !cart) {
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
