import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { cache, CACHE_KEYS, CACHE_TTL } from "../utils/cache.js";
import { performanceTracker } from "../utils/performanceTracker.js";

export const getDashboardStats = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    // ✅ OPTIMIZED: Check cache first
    const cachedStats = cache.get(CACHE_KEYS.DASHBOARD_STATS);
    if (cachedStats) {
      const latency = Date.now() - startTime;
      console.log(`[ANALYTICS] getDashboardStats (CACHED) - ${latency}ms`);
      return res.json(cachedStats);
    }

    // ✅ OPTIMIZED: Reduce to just 4 essential count queries + 1 revenue query
    const [
      { count: totalOrders },
      { count: totalUsers },
      { count: totalProducts },
      { count: pendingB2B },
      { data: revenueData }
    ] = await Promise.all([
      supabaseAdmin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "delivered"),
      supabaseAdmin
        .from("users")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("products")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("b2b_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      // ✅ OPTIMIZED: Fetch only total_amount field for delivered orders
      supabaseAdmin
        .from("orders")
        .select("total_amount")
        .eq("status", "delivered")
    ]);

    // Sum revenue
    const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    
    const statsData = {
      totalOrders: totalOrders || 0,
      totalRevenue,
      totalUsers: totalUsers || 0,
      totalProducts: totalProducts || 0,
      pendingB2B: pendingB2B || 0,
    };

    // Cache the results
    cache.set(CACHE_KEYS.DASHBOARD_STATS, statsData, CACHE_TTL.DASHBOARD_STATS);
    
    const latency = Date.now() - startTime;
    console.log(`[ANALYTICS] getDashboardStats completed - ${latency}ms`);

    res.json(statsData);
  } catch (error) {
    console.error("[ANALYTICS] getDashboardStats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

export const getSalesTrend = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { days = 30 } = req.query;

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("created_at, total")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch sales trend" });
    }

    // Group by date
    const trend: { [key: string]: number } = {};
    orders?.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split("T")[0];
      trend[date] = (trend[date] || 0) + (order.total || 0);
    });

    const data = Object.entries(trend).map(([date, total]) => ({
      date,
      total,
    }));

    const latency = Date.now() - startTime;
    console.log(`[ANALYTICS] getSalesTrend completed - ${latency}ms`);

    res.json({ data });
  } catch (error) {
    console.error("[ANALYTICS] getSalesTrend error:", error);
    res.status(500).json({ error: "Failed to fetch sales trend" });
  }
};

export const getRevenueByCategory = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    // ✅ OPTIMIZED: Single query with aggregation instead of N+1
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select("id, name");

    if (error || !categories) {
      return res.status(500).json({ error: "Failed to fetch categories" });
    }

    // Fetch all delivered orders once
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("items")
      .eq("status", "delivered");

    // Process all orders in memory
    const revenueByCategory: { [key: string]: number } = {};
    categories.forEach(cat => {
      revenueByCategory[cat.id] = 0;
    });

    orders?.forEach((order) => {
      if (Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const categoryId = item.category_id;
          if (categoryId && revenueByCategory.hasOwnProperty(categoryId)) {
            revenueByCategory[categoryId] += (item.price || 0) * (item.quantity || 0);
          }
        });
      }
    });

    const revenueData = categories.map(category => ({
      category: category.name,
      revenue: revenueByCategory[category.id] || 0,
    }));

    const latency = Date.now() - startTime;
    console.log(`[ANALYTICS] getRevenueByCategory completed - ${latency}ms`);

    res.json({ data: revenueData });
  } catch (error) {
    console.error("[ANALYTICS] getRevenueByCategory error:", error);
    res.status(500).json({ error: "Failed to fetch revenue by category" });
  }
};

export const getTopProducts = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { limit = 10 } = req.query;

  try {
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("id, name, rating, reviews_count")
      .order("rating", { ascending: false })
      .limit(parseInt(limit as string));

    if (error) {
      return res.status(500).json({ error: "Failed to fetch top products" });
    }

    const latency = Date.now() - startTime;
    console.log(`[ANALYTICS] getTopProducts completed - ${latency}ms`);

    res.json({ data: products || [] });
  } catch (error) {
    console.error("[ANALYTICS] getTopProducts error:", error);
    res.status(500).json({ error: "Failed to fetch top products" });
  }
};


/**
 * Combined dashboard endpoint that returns all analytics data including performance metrics
 */
export const getDashboard = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    // Get dashboard stats
    const cachedStats = cache.get(CACHE_KEYS.DASHBOARD_STATS);
    let dashboardStats;

    if (cachedStats) {
      console.log("[ANALYTICS] Using cached dashboard stats");
      dashboardStats = cachedStats;
    } else {
      console.log("[ANALYTICS] Fetching fresh dashboard stats from database");
      const [
        { count: totalOrders },
        { count: totalUsers },
        { count: totalProducts },
        { count: pendingB2B },
        { data: revenueData }
      ] = await Promise.all([
        supabaseAdmin
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("status", "delivered"),
        supabaseAdmin
          .from("users")
          .select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("products")
          .select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("b2b_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabaseAdmin
          .from("orders")
          .select("total_amount")
          .eq("status", "delivered")
      ]);

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      
      dashboardStats = {
        totalOrders: totalOrders || 0,
        totalRevenue,
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        pendingB2B: pendingB2B || 0,
      };

      cache.set(CACHE_KEYS.DASHBOARD_STATS, dashboardStats, CACHE_TTL.DASHBOARD_STATS);
    }

    // Get performance metrics
    const performanceSummary = performanceTracker.getSummary();
    console.log("[ANALYTICS] Performance summary:", {
      totalRequests: performanceSummary.totalRequests,
      avgLatency: performanceSummary.avgLatency,
      maxLatency: performanceSummary.maxLatency,
      minLatency: performanceSummary.minLatency,
      recentRequestsCount: performanceSummary.recentRequests.length,
    });

    const latency = Date.now() - startTime;
    console.log(`[ANALYTICS] getDashboard completed - ${latency}ms`);

    // Return combined response
    const response = {
      dashboardStats,
      performance: {
        avgLatency: performanceSummary.avgLatency,
        maxLatency: performanceSummary.maxLatency,
        minLatency: performanceSummary.minLatency,
        totalRequests: performanceSummary.totalRequests,
        recentRequests: performanceSummary.recentRequests,
      },
    };

    console.log("[ANALYTICS] Sending response with performance data:", {
      hasDashboardStats: !!response.dashboardStats,
      hasPerformance: !!response.performance,
      performanceKeys: Object.keys(response.performance),
    });

    res.json(response);
  } catch (error) {
    console.error("[ANALYTICS] getDashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
};
