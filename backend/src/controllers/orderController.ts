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
    // ✅ OPTIMIZED: Get user B2B status first (fast)
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("b2b_approval_status")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      const latency = Date.now() - startTime;
      console.error(`[ORDER] User not found after ${latency}ms:`, userError);
      return res.status(500).json({ error: "User not found" });
    }

    if (user.b2b_approval_status !== "approved") {
      const latency = Date.now() - startTime;
      console.error(`[ORDER] B2B approval required after ${latency}ms`);
      return res.status(403).json({
        error: "B2B approval required to place orders",
        message: "Please request B2B approval to access pricing and place orders"
      });
    }

    // Get cart with nested items and products in single query (include buy_mode)
    const { data: cartWithItems, error: cartError } = await supabaseAdmin
      .from("carts")
      .select(`
        id,
        cart_items(
          product_id,
          quantity,
          buy_mode,
          products(id, base_price, sale_price, b2b_price, moq, name)
        )
      `)
      .eq("user_id", userId)
      .single();

    const cartFetchTime = Date.now() - startTime;
    console.log(`[ORDER] Cart fetched after ${cartFetchTime}ms`);

    if (cartError || !cartWithItems) {
      console.error(`[ORDER] Cart not found after ${cartFetchTime}ms:`, cartError);
      return res.status(400).json({ error: "Cart not found" });
    }

    const cartItems = cartWithItems.cart_items || [];
    if (cartItems.length === 0) {
      console.error(`[ORDER] Cart is empty after ${cartFetchTime}ms`);
      return res.status(400).json({ error: "Cart is empty" });
    }

    console.log(`[ORDER] Cart items found after ${cartFetchTime}ms:`, cartItems.length);

    // Verify all cart items have corresponding products
    const missingProducts = cartItems.filter((item: any) => !item.products);
    if (missingProducts.length > 0) {
      const latency = Date.now() - startTime;
      console.error(`[ORDER] Missing products after ${latency}ms:`, missingProducts);
      return res.status(500).json({ error: "Some products are missing from cart" });
    }

    // Calculate total and prepare order items
    let total = 0;
    const orderItems = cartItems.map((item: any) => {
      const product = item.products;
      const buyMode = item.buy_mode || 'retail'; // ✅ Get buy_mode from cart item

      if (!product) {
        const latency = Date.now() - startTime;
        console.error(`[ORDER] Product not found after ${latency}ms:`, item.product_id);
        throw new Error(`Product ${item.product_id} not found`);
      }

      console.log("[ORDER] Processing product:", { 
        productId: product.id, 
        productName: product.name,
        prices: { base: product.base_price, sale: product.sale_price, b2b: product.b2b_price },
        quantity: item.quantity,
        buyMode // ✅ Log buy_mode
      });

      // ✅ Use correct price based on buy_mode
      let price: number;
      if (buyMode === 'bulk' && product.b2b_price !== null && product.b2b_price !== undefined) {
        price = product.b2b_price;
      } else if (product.sale_price !== null && product.sale_price !== undefined) {
        price = product.sale_price;
      } else {
        price = product.base_price;
      }

      if (price === null || price === undefined) {
        console.error("[ORDER] No valid price found for product:", { 
          productId: product.id, 
          productName: product.name, 
          prices: { base: product.base_price, sale: product.sale_price, b2b: product.b2b_price },
          buyMode 
        });
        throw new Error(`No pricing available for product: ${product.name}`);
      }

      // ✅ Check MOQ only for bulk orders
      if (buyMode === 'bulk' && product.moq && item.quantity < product.moq) {
        throw new Error(`Minimum order quantity for ${product.name} is ${product.moq} units (you ordered ${item.quantity})`);
      }

      total += price * item.quantity;

      return {
        product_id: item.product_id,
        product_name: product.name, // Store for error messages
        quantity: item.quantity,
        price_at_purchase: price,
      };
    });

    // ✅ NEW: Verify inventory availability for all items
    console.log("[ORDER] Verifying inventory availability...");
    for (const item of orderItems) {
      const { data: inventory, error: invError } = await supabaseAdmin
        .from("inventory")
        .select("quantity_available, warehouse_location")
        .eq("product_id", item.product_id)
        .single();

      if (invError) {
        console.warn(`[ORDER] No inventory record for product ${item.product_id}, skipping check`);
        // Continue - some products may not have inventory tracking
        continue;
      }

      if (inventory && inventory.quantity_available < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.product_name}. ` +
          `Available: ${inventory.quantity_available}, Requested: ${item.quantity}`
        );
      }

      console.log(`[ORDER] Inventory check passed for ${item.product_name}: ${inventory.quantity_available} available`);
    }

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
    await supabaseAdmin.from("cart_items").delete().eq("cart_id", cartWithItems.id);
    console.log("[ORDER] Cart cleared");

    res.status(201).json({ success: true, order });
  } catch (error: any) {
    console.error("[ORDER] Unexpected error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const userId = req.userId;
  const { page = "1", limit = "20" } = req.query;
  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 20;
  const offset = (pageNum - 1) * limitNum;

  try {
    // ✅ OPTIMIZED: Select only needed fields + pagination
    const { data: orders, error, count } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        order_number,
        total_amount,
        status,
        items_count,
        created_at
      `, { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    const queryTime = Date.now() - startTime;

    if (error) {
      console.error(`[ORDERS] getOrders error after ${queryTime}ms:`, error);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }

    console.log(`[ORDERS] getOrders completed - ${queryTime}ms, Items: ${orders?.length}`);

    res.json({ 
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      }
    });
  } catch (error) {
    console.error("[ORDERS] getOrders unexpected error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const userId = req.userId;
  const { id } = req.params;

  try {
    // ✅ OPTIMIZED: Select only needed fields
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        order_number,
        total_amount,
        status,
        shipping_address,
        items_count,
        created_at,
        updated_at,
        order_items(
          id,
          product_id,
          quantity,
          price_at_purchase
        )
      `)
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    const queryTime = Date.now() - startTime;

    if (error || !order) {
      console.error(`[ORDERS] getOrder error after ${queryTime}ms:`, error);
      return res.status(404).json({ error: "Order not found" });
    }

    console.log(`[ORDERS] getOrder completed - ${queryTime}ms`);
    res.json({ order });
  } catch (error) {
    console.error("[ORDERS] getOrder unexpected error:", error);
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
