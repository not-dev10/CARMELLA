import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Total orders
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    // Total revenue
    const { data: orders } = await supabase
      .from("orders")
      .select("total")
      .eq("status", "delivered");

    const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;

    // Total users
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Total products
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Pending B2B requests
    const { count: pendingB2B } = await supabase
      .from("b2b_approvals")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    res.json({
      totalOrders: totalOrders || 0,
      totalRevenue,
      totalUsers: totalUsers || 0,
      totalProducts: totalProducts || 0,
      pendingB2B: pendingB2B || 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

export const getSalesTrend = async (req: Request, res: Response) => {
  const { days = 30 } = req.query;

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const { data: orders, error } = await supabase
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
      trend[date] = (trend[date] || 0) + order.total;
    });

    const data = Object.entries(trend).map(([date, total]) => ({
      date,
      total,
    }));

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sales trend" });
  }
};

export const getRevenueByCategory = async (req: Request, res: Response) => {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name");

    if (error || !categories) {
      return res.status(500).json({ error: "Failed to fetch categories" });
    }

    const revenueData = await Promise.all(
      categories.map(async (category) => {
        const { data: orders } = await supabase
          .from("orders")
          .select("items")
          .eq("status", "delivered");

        let revenue = 0;
        orders?.forEach((order) => {
          if (Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              revenue += item.price * item.quantity;
            });
          }
        });

        return {
          category: category.name,
          revenue,
        };
      })
    );

    res.json({ data: revenueData });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch revenue by category" });
  }
};

export const getTopProducts = async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, rating, reviews_count")
      .order("rating", { ascending: false })
      .limit(parseInt(limit as string));

    if (error) {
      return res.status(500).json({ error: "Failed to fetch top products" });
    }

    res.json({ data: products || [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top products" });
  }
};
