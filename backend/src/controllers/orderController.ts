import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

export const createOrder = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    return res.status(400).json({ error: "Shipping address is required" });
  }

  try {
    // Check if user is approved for B2B (required to see pricing and place orders)
    const { data: user } = await supabase
      .from("users")
      .select("b2b_approval_status")
      .eq("id", userId)
      .single();

    if (user?.b2b_approval_status !== "approved") {
      return res.status(403).json({
        error: "B2B approval required to place orders",
        message: "Please request B2B approval to access pricing and place orders"
      });
    }

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
      .select("product_id, quantity")
      .eq("cart_id", cart.id);

    if (itemsError || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Fetch products with secure pricing from products_safe view
    const productIds = cartItems.map(item => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products_safe")
      .select("id, base_price, sale_price, b2b_price, moq")
      .in("id", productIds);

    if (productsError || !products) {
      return res.status(500).json({ error: "Failed to fetch product pricing" });
    }

    // Calculate total and prepare order items
    let total = 0;
    const orderItems = cartItems.map((item: any) => {
      const product = products.find(p => p.id === item.product_id);

      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }

      // Use B2B price if available, otherwise sale price, otherwise base price
      const price = product.b2b_price || product.sale_price || product.base_price;

      if (!price) {
        throw new Error("Pricing not available. Please ensure B2B approval is active.");
      }

      // Check MOQ
      if (product.moq && item.quantity < product.moq) {
        throw new Error(`Minimum order quantity for product ${product.id} is ${product.moq}`);
      }

      total += price * item.quantity;

      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: price,
      };
    });

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: userId,
          total_amount: total,
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

    // Insert order items
    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(
        orderItems.map(item => ({
          order_id: order.id,
          ...item,
        }))
      );

    if (orderItemsError) {
      // Rollback order if items insert fails
      await supabase.from("orders").delete().eq("id", order.id);
      return res.status(500).json({ error: "Failed to create order items" });
    }

    // Clear cart
    await supabase.from("cart_items").delete().eq("cart_id", cart.id);

    res.status(201).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
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
