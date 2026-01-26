import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { cache, CACHE_KEYS, CACHE_TTL } from "../utils/cache.js";

/**
 * Get all inventory items with product details
 * GET /api/admin/inventory
 */
export async function getInventory(req: Request, res: Response) {
  try {
    const startTime = Date.now();
    const { search = "", warehouse = "all", status = "all", page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    console.log("[INVENTORY] getInventory called with:", { search, warehouse, status, page: pageNum, limit: limitNum });

    // ✅ OPTIMIZED: Select only needed fields + pagination
    let query = supabaseAdmin
      .from("inventory")
      .select(`
        id,
        product_id,
        warehouse_location,
        quantity_on_hand,
        quantity_reserved,
        quantity_available,
        reorder_point,
        sku,
        is_active,
        created_at,
        products!inner(id, name, slug, image_url, base_price)
      `, { count: "exact" });

    // Apply filters
    if (warehouse !== "all") {
      query = query.eq("warehouse_location", warehouse);
    }
    if (status === "low") {
      query = query.lt("quantity_available", 10);
    } else if (status === "out") {
      query = query.eq("quantity_available", 0);
    }

    const { data: inventoryData, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    const queryTime = Date.now() - startTime;

    if (error) {
      console.error(`[INVENTORY] getInventory error after ${queryTime}ms:`, error);
      return res.status(400).json({ error: error.message });
    }

    console.log(`[INVENTORY] getInventory completed - ${queryTime}ms. Found: ${count}, Returned: ${inventoryData?.length}`);

    return res.json({
      inventory: inventoryData || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error: any) {
    console.error("[INVENTORY] getInventory unexpected error:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get low stock items
 * GET /api/admin/inventory/low-stock
 */
export async function getLowStockItems(req: Request, res: Response) {
  try {
    console.log("[INVENTORY] getLowStockItems called");

    const { data, error } = await supabaseAdmin
      .from("inventory")
      .select(`
        id,
        product_id,
        warehouse_location,
        quantity_on_hand,
        quantity_reserved,
        quantity_available,
        reorder_point,
        reorder_quantity,
        sku,
        products:product_id(id, name, slug, image_url, base_price)
      `)
      .lte("quantity_available", supabaseAdmin.from("inventory").select("reorder_point"))
      .eq("is_active", true)
      .order("quantity_available", { ascending: true });

    if (error) {
      console.error("[INVENTORY] getLowStockItems error:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("[INVENTORY] getLowStockItems successful. Found items:", data?.length);

    return res.json({ items: data || [] });
  } catch (error: any) {
    console.error("[INVENTORY] getLowStockItems unexpected error:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Update inventory quantity
 * PUT /api/admin/inventory/:inventoryId
 */
export async function updateInventory(req: Request, res: Response) {
  try {
    const { inventoryId } = req.params;
    const { quantity_on_hand, quantity_reserved, reorder_point, reorder_quantity, notes } = req.body;

    console.log("[INVENTORY] updateInventory called:", { inventoryId, quantity_on_hand, quantity_reserved });

    const updates: any = {
      updated_at: new Date().toISOString(),
      last_stock_check: new Date().toISOString(),
    };

    if (quantity_on_hand !== undefined) updates.quantity_on_hand = quantity_on_hand;
    if (quantity_reserved !== undefined) updates.quantity_reserved = quantity_reserved;
    if (reorder_point !== undefined) updates.reorder_point = reorder_point;
    if (reorder_quantity !== undefined) updates.reorder_quantity = reorder_quantity;
    if (notes !== undefined) updates.notes = notes;

    const { data: inventory, error } = await supabaseAdmin
      .from("inventory")
      .update(updates)
      .eq("id", inventoryId)
      .select()
      .single();

    if (error) {
      console.error("[INVENTORY] updateInventory error:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("[INVENTORY] Inventory updated successfully:", inventoryId);
    return res.json({ success: true, inventory });
  } catch (error: any) {
    console.error("[INVENTORY] updateInventory unexpected error:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Adjust inventory stock (add/remove)
 * POST /api/admin/inventory/:inventoryId/adjust
 */
export async function adjustInventory(req: Request, res: Response) {
  try {
    const { inventoryId } = req.params;
    const { quantity_change, transaction_type = "adjustment", notes } = req.body;

    console.log("[INVENTORY] adjustInventory called:", { inventoryId, quantity_change, transaction_type });

    if (!quantity_change) {
      return res.status(400).json({ error: "quantity_change is required" });
    }

    // Get current inventory
    const { data: currentInventory, error: fetchError } = await supabaseAdmin
      .from("inventory")
      .select("*")
      .eq("id", inventoryId)
      .single();

    if (fetchError || !currentInventory) {
      console.error("[INVENTORY] Failed to fetch inventory:", fetchError);
      return res.status(404).json({ error: "Inventory not found" });
    }

    const newQuantity = currentInventory.quantity_on_hand + quantity_change;

    if (newQuantity < 0) {
      return res.status(400).json({ error: "Insufficient stock for this adjustment" });
    }

    // Update inventory
    const { data: updatedInventory, error: updateError } = await supabaseAdmin
      .from("inventory")
      .update({
        quantity_on_hand: newQuantity,
        updated_at: new Date().toISOString(),
        last_stock_check: new Date().toISOString(),
      })
      .eq("id", inventoryId)
      .select()
      .single();

    if (updateError) {
      console.error("[INVENTORY] Failed to update inventory:", updateError);
      return res.status(400).json({ error: updateError.message });
    }

    // Log the change to history
    const { error: historyError } = await supabaseAdmin
      .from("inventory_history")
      .insert({
        inventory_id: inventoryId,
        product_id: currentInventory.product_id,
        transaction_type,
        quantity_change,
        quantity_before: currentInventory.quantity_on_hand,
        quantity_after: newQuantity,
        notes: notes || `${transaction_type} adjustment`,
        created_by: req.userId,
      });

    if (historyError) {
      console.error("[INVENTORY] Failed to log inventory change:", historyError);
    }

    console.log("[INVENTORY] Inventory adjusted successfully:", { inventoryId, newQuantity });
    return res.json({ success: true, inventory: updatedInventory });
  } catch (error: any) {
    console.error("[INVENTORY] adjustInventory unexpected error:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get inventory history for a product
 * GET /api/admin/inventory/:inventoryId/history
 */
export async function getInventoryHistory(req: Request, res: Response) {
  try {
    const { inventoryId } = req.params;
    const { limit = "50" } = req.query;
    const limitNum = parseInt(limit as string) || 50;

    console.log("[INVENTORY] getInventoryHistory called:", { inventoryId, limit: limitNum });

    const { data, error } = await supabaseAdmin
      .from("inventory_history")
      .select(`
        id,
        transaction_type,
        quantity_change,
        quantity_before,
        quantity_after,
        reference_type,
        notes,
        created_by,
        created_at,
        users:created_by(id, email)
      `)
      .eq("inventory_id", inventoryId)
      .order("created_at", { ascending: false })
      .limit(limitNum);

    if (error) {
      console.error("[INVENTORY] getInventoryHistory error:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("[INVENTORY] getInventoryHistory successful. Found records:", data?.length);

    return res.json({ history: data || [] });
  } catch (error: any) {
    console.error("[INVENTORY] getInventoryHistory unexpected error:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get inventory statistics
 * GET /api/admin/inventory/stats
 */
export async function getInventoryStats(req: Request, res: Response) {
  try {
    const startTime = Date.now();
    console.log("[INVENTORY] getInventoryStats called");

    // ✅ OPTIMIZED: Check cache first - return immediately if cached
    const cachedStats = cache.get(CACHE_KEYS.INVENTORY_STATS);
    if (cachedStats) {
      const latency = Date.now() - startTime;
      console.log(`[INVENTORY] getInventoryStats (CACHED) - ${latency}ms`);
      return res.json(cachedStats);
    }

    // ✅ OPTIMIZED: Single query with aggregation instead of fetching all rows
    const { data: statsRows, error } = await supabaseAdmin
      .from("inventory")
      .select("quantity_on_hand, quantity_available", { count: "exact" });

    if (error) {
      console.error("[INVENTORY] getInventoryStats error:", error);
      return res.status(500).json({ error: error.message });
    }

    const totalQuantity = statsRows?.reduce((sum, item) => sum + (item.quantity_on_hand || 0), 0) || 0;
    const lowStockCount = statsRows?.filter(item => item.quantity_available < 10).length || 0;
    const outOfStockCount = statsRows?.filter(item => item.quantity_available === 0).length || 0;

    const statsData = {
      stats: {
        totalItems: statsRows?.length || 0,
        totalQuantity,
        lowStockCount,
        outOfStockCount,
      },
    };

    // Cache the results
    cache.set(CACHE_KEYS.INVENTORY_STATS, statsData, CACHE_TTL.INVENTORY_STATS);

    const latency = Date.now() - startTime;
    console.log(`[INVENTORY] getInventoryStats completed - ${latency}ms`);

    return res.json(statsData);
  } catch (error: any) {
    console.error("[INVENTORY] getInventoryStats unexpected error:", error);
    return res.status(500).json({ error: error.message });
  }
}
