import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { generateOrderId } from "../utils/orderId.js";

export const createOrder = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const userId = req.userId;
  const { shippingAddress } = req.body;

  console.log("[ORDER] Create order request:", { userId, hasShippingAddress: !!shippingAddress });

  if (!shippingAddress) {
    const latency = Date.now() - startTime;
    console.error(`[ORDER] Missing shipping address after ${latency}ms`);
    return res.status(400).json({ error: "Shipping address is required" });
  }

  try {
    // Check if user is approved for B2B (required to see pricing and place orders)
    console.log("[ORDER] Checking B2B approval status for user:", userId);
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("b2b_approval_status")
      .eq("id", userId)
      .single();

    const userCheckTime = Date.now() - startTime;
    console.log(`[ORDER] User B2B status checked after ${userCheckTime}ms:`, user?.b2b_approval_status);

    if (user?.b2b_approval_status !== "approved") {
      const latency = Date.now() - startTime;
      console.error(`[ORDER] B2B approval required after ${latency}ms`);
      return res.status(403).json({
        error: "B2B approval required to place orders",
        message: "Please request B2B approval to access pricing and place orders"
      });
    }

    // Get user's cart
    console.log("[ORDER] Fetching cart for user:", userId);
    const { data: cart, error: cartError } = await supabaseAdmin
      .from("carts")
      .select("*")
      .eq("user_id", userId)
      .single();

    const cartFetchTime = Date.now() - startTime;

    if (cartError || !cart) {
      console.error(`[ORDER] Cart not found after ${cartFetchTime}ms:`, cartError);
      return res.status(400).json({ error: "Cart not found" });
    }

    console.log(`[ORDER] Cart found after ${cartFetchTime}ms:`, cart.id);

    // Get cart items
    console.log("[ORDER] Fetching cart items for cart:", cart.id);
    const { data: cartItems, error: itemsError } = await supabaseAdmin
      .from("cart_items")
      .select("product_id, quantity")
      .eq("cart_id", cart.id);

    const itemsFetchTime = Date.now() - startTime;

    if (itemsError || !cartItems || cartItems.length === 0) {
      console.error(`[ORDER] Cart items error after ${itemsFetchTime}ms:`, itemsError, "Items:", cartItems);
      return res.status(400).json({ error: "Cart is empty" });
    }

    console.log(`[ORDER] Cart items found after ${itemsFetchTime}ms:`, cartItems.length, cartItems);

    // Fetch products with pricing
    const productIds = cartItems.map(item => item.product_id);
    console.log("[ORDER] Fetching products with IDs:", productIds);
    
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, base_price, sale_price, b2b_price, moq, name")
      .in("id", productIds);

    const productsFetchTime = Date.now() - startTime;

    if (productsError) {
      console.error(`[ORDER] Failed to fetch products after ${productsFetchTime}ms - Query error:`, productsError);
      return res.status(500).json({ error: "Failed to fetch product pricing", details: productsError.message });
    }

    if (!products || products.length === 0) {
      console.error(`[ORDER] No products found after ${productsFetchTime}ms for IDs:`, productIds);
      return res.status(500).json({ error: "Products not found in database" });
    }

    console.log(`[ORDER] Fetched products after ${productsFetchTime}ms:`, products);

    // Verify all cart items have corresponding products
    const missingProducts = cartItems.filter(item => !products.find(p => p.id === item.product_id));
    if (missingProducts.length > 0) {
      const latency = Date.now() - startTime;
      console.error(`[ORDER] Missing products after ${latency}ms:`, missingProducts);
      return res.status(500).json({ error: `Products not found: ${missingProducts.map(p => p.product_id).join(', ')}` });
    }

    // Calculate total and prepare order items
    let total = 0;
    const orderItems = cartItems.map((item: any) => {
      const product = products.find(p => p.id === item.product_id);

      if (!product) {
        const latency = Date.now() - startTime;
        console.error(`[ORDER] Product not found after ${latency}ms:`, item.product_id);
        throw new Error(`Product ${item.product_id} not found`);
      }

      console.log("[ORDER] Processing product:", { 
        productId: product.id, 
        productName: product.name,
        prices: { base: product.base_price, sale: product.sale_price, b2b: product.b2b_price },
        quantity: item.quantity
      });

      // Use B2B price if available, otherwise sale price, otherwise base price
      const price = product.b2b_price !== null && product.b2b_price !== undefined 
        ? product.b2b_price 
        : product.sale_price !== null && product.sale_price !== undefined
        ? product.sale_price 
        : product.base_price;

      if (price === null || price === undefined) {
        console.error("[ORDER] No valid price found for product:", { productId: product.id, productName: product.name, prices: { base: product.base_price, sale: product.sale_price, b2b: product.b2b_price } });
        throw new Error(`No pricing available for product: ${product.name}`);
      }

      // Check MOQ
      if (product.moq && item.quantity < product.moq) {
        throw new Error(`Minimum order quantity for ${product.name} is ${product.moq} units (you ordered ${item.quantity})`);
      }

      total += price * item.quantity;

      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: price,
      };
    });

    // Create order with systematic order number
    const orderNumber = generateOrderId();
    console.log("[ORDER] Creating order with:", { userId, total, itemsCount: cartItems.length, orderNumber });
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          user_id: userId,
          order_number: orderNumber,
          total_amount: total,
          status: "pending",
          shipping_address: shippingAddress,
          items_count: cartItems.length,
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error("[ORDER] Failed to create order:", orderError);
      return res.status(500).json({ error: "Failed to create order", details: orderError.message });
    }

    console.log("[ORDER] Order created:", { id: order.id, orderNumber: order.order_number });

    // Insert order items
    console.log("[ORDER] Inserting order items:", orderItems);
    const { error: orderItemsError } = await supabaseAdmin
      .from("order_items")
      .insert(
        orderItems.map(item => ({
          order_id: order.id,
          ...item,
        }))
      );

    if (orderItemsError) {
      console.error("[ORDER] Failed to insert order items:", orderItemsError);
      // Rollback order if items insert fails
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return res.status(500).json({ error: "Failed to create order items", details: orderItemsError.message });
    }

    console.log("[ORDER] Order items inserted successfully");

    // Clear cart
    await supabaseAdmin.from("cart_items").delete().eq("cart_id", cart.id);
    console.log("[ORDER] Cart cleared");

    res.status(201).json({ success: true, order });
  } catch (error: any) {
    console.error("[ORDER] Unexpected error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const { data: orders, error } = await supabaseAdmin
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
    const { data: order, error } = await supabaseAdmin
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
    const { data: order, error } = await supabaseAdmin
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
