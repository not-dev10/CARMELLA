import { Request, Response } from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";

/**
 * Get all users with full details
 * GET /api/admin/users
 */
export async function getUsers(req: Request, res: Response) {
  try {
    const startTime = Date.now();
    console.log("[ADMIN] getUsers called by user:", req.userId);
    
    const { search = "", page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    console.log("[ADMIN] Query params:", { search, page: pageNum, limit: limitNum, offset });

    // Use supabaseAdmin to bypass RLS
    let query = supabaseAdmin
      .from("users")
      .select(`
        id,
        email,
        company_name,
        user_type,
        is_b2b_user,
        b2b_approval_status,
        b2b_approval_requested_at,
        b2b_approval_expires_at,
        b2b_approved_at,
        phone,
        address,
        city,
        state,
        postal_code,
        country,
        status,
        total_orders,
        total_spent,
        created_at,
        updated_at
      `, { count: "exact" });

    // Search by name or email
    if (search) {
      console.log("[ADMIN] Applying search filter:", search);
      query = query.or(`email.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    const queryTime = Date.now() - startTime;

    if (error) {
      console.error(`[ADMIN] Query error after ${queryTime}ms:`, error);
      return res.status(400).json({ error: error.message });
    }

    console.log(`[ADMIN] Query successful after ${queryTime}ms. Found users: ${count}, Returned: ${data?.length}`);
    console.log("[ADMIN] Sample user data:", data?.[0]);

    return res.json({
      users: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error: any) {
    console.error("[ADMIN] Unexpected error:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get single user details
 * GET /api/admin/users/:userId
 */
export async function getUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Update user details
 * PUT /api/admin/users/:userId
 */
export async function updateUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ user: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get all orders
 * GET /api/admin/orders
 */
export async function getOrders(req: Request, res: Response) {
  try {
    const { status = "all", page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    console.log("[ADMIN] getOrders called with:", { status, page: pageNum, limit: limitNum });

    let query = supabaseAdmin
      .from("orders")
      .select(`
        id,
        order_number,
        user_id,
        total_amount,
        status,
        items_count,
        shipping_address,
        billing_address,
        notes,
        created_at,
        updated_at
      `, { count: "exact" });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error("[ADMIN] getOrders error:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("[ADMIN] getOrders successful. Found orders:", count, "Returned:", data?.length);

    return res.json({
      orders: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error: any) {
    console.error("[ADMIN] getOrders unexpected error:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Update order status
 * PUT /api/admin/orders/:orderId
 */
export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log("[ADMIN] updateOrderStatus called:", { orderId, status });

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("[ADMIN] updateOrderStatus error:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("[ADMIN] Order status updated successfully:", order.id, "to", status);
    return res.json({ success: true, order });
  } catch (error: any) {
    console.error("[ADMIN] updateOrderStatus unexpected error:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Delete order
 * DELETE /api/admin/orders/:orderId
 */
export async function deleteOrder(req: Request, res: Response) {
  try {
    const { orderId } = req.params;

    console.log("[ADMIN] deleteOrder called:", { orderId });

    // Delete order items first (foreign key constraint)
    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("[ADMIN] Failed to delete order items:", itemsError);
      return res.status(400).json({ error: "Failed to delete order items" });
    }

    // Delete the order
    const { error: orderError } = await supabaseAdmin
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (orderError) {
      console.error("[ADMIN] Failed to delete order:", orderError);
      return res.status(400).json({ error: "Failed to delete order" });
    }

    console.log("[ADMIN] Order deleted successfully:", orderId);
    return res.json({ success: true, message: "Order deleted successfully" });
  } catch (error: any) {
    console.error("[ADMIN] deleteOrder unexpected error:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get all B2B approval requests
 * GET /api/admin/b2b-requests
 */
export async function getB2BRequests(req: Request, res: Response) {
  try {
    const { status = "pending", page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from("b2b_requests")
      .select(`
        *,
        user:users!user_id(id, email, company_name),
        approver:users!approved_by(id, email)
      `, { count: "exact" });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query
      .order("requested_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      requests: data,
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
 * Approve B2B user
 * PUT /api/admin/b2b-requests/:userId/approve
 */
export async function approveB2BRequest(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { notes } = req.body;

    // Update B2B approval status
    const { data: approval, error: approvalError } = await supabaseAdmin
      .from("b2b_requests")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: req.userId,
      })
      .eq("user_id", userId)
      .eq("status", "pending")
      .select()
      .single();

    if (approvalError) {
      return res.status(400).json({ error: approvalError.message });
    }

    // Update user's B2B status
    const { error: userError } = await supabaseAdmin
      .from("users")
      .update({ 
        b2b_approval_status: "approved",
        b2b_approved_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    return res.json({
      message: "B2B request approved",
      approval,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Reject B2B user
 * PUT /api/admin/b2b-requests/:userId/reject
 */
export async function rejectB2BRequest(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { notes } = req.body;

    const { data, error } = await supabaseAdmin
      .from("b2b_requests")
      .update({
        status: "rejected",
        rejection_reason: notes,
      })
      .eq("user_id", userId)
      .eq("status", "pending")
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Update user's B2B status
    await supabaseAdmin
      .from("users")
      .update({ 
        b2b_approval_status: "rejected",
        b2b_rejection_reason: notes,
      })
      .eq("id", userId);

    return res.json({
      message: "B2B request rejected",
      approval: data,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
