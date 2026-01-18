import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

export const createOrder = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    return res.status(400).json({ error: "Shipping address is required" });
  }

  try {
    // Get user's cart
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (cartError || !cart) {
      return res.status(400).json({ error: "Cart not found" });
    }

    // Get cart items
    const { data: cartItems, error: itemsError } = await supabase
      .from("cart_items")
      .select("*, products(price, b2b_price)")
      .eq("cart_id", cart.id);

    if (itemsError || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Calculate total
    let total = 0;
    const orderItems = cartItems.map((item: any) => {
      const price = req.userType === "b2b_approved" 
        ? item.products.b2b_price || item.products.price 
        : item.products.price;
      total += price * item.quantity;
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price,
      };
    });

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: userId,
          items: orderItems,
          total,
          status: "pending",
          shipping_address: shippingAddress,
          items_count: cartItems.length,
        },
      ])
      .select()
      .single();

    if (orderError) {
      return res.status(500).json({ error: "Failed to create order" });
    }

    // Clear cart
    await supabase.from("cart_items").delete().eq("cart_id", cart.id);

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch orders" });
    }

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const { data: order, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error || !order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
