import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

/**
 * Helper function to apply pricing visibility rules
 * Guest (not logged in): No pricing visible - locked
 * Logged-in user: Base and sale prices visible
 * Approved B2B user: All pricing visible including B2B rates
 */
async function applyPricingRules(products: any[], userId?: string) {
  if (!userId) {
    // Guest user - hide ALL pricing
    return products.map(p => ({
      ...p,
      base_price: null,
      sale_price: null,
      sale_percentage: null,
      b2b_price: null,
      b2b_min_quantity: null,
      moq: null,
      pricingLocked: true,
    }));
  }

  // Logged-in user - check B2B approval status
  const { data: user } = await supabase
    .from("users")
    .select("b2b_approval_status")
    .eq("id", userId)
    .single();

  if (user?.b2b_approval_status !== "approved") {
    // Logged-in but not B2B approved - show base/sale price only, hide B2B
    return products.map(p => ({
      ...p,
      b2b_price: null,
      b2b_min_quantity: null,
      pricingLocked: false,
    }));
  }

  // Approved B2B user - show all pricing
  return products.map(p => ({
    ...p,
    pricingLocked: false,
  }));
}

// Get all homepage content sections
export const getHomepageContent = async (req: Request, res: Response) => {
  try {
    const { data: content, error } = await supabase
      .from("admin_content")
      .select("*");

    if (error) {
      return res.status(500).json({ error: "Failed to fetch homepage content" });
    }

    // Transform to object with section names as keys
    const contentMap: { [key: string]: any } = {};
    content?.forEach((item) => {
      contentMap[item.section_name] = item.content;
    });

    res.json(contentMap);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get specific section
export const getSection = async (req: Request, res: Response) => {
  const { section } = req.params;

  try {
    const { data: content, error } = await supabase
      .from("admin_content")
      .select("*")
      .eq("section_name", section)
      .single();

    if (error || !content) {
      return res.status(404).json({ error: "Section not found" });
    }

    res.json(content.content);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update section (admin only)
export const updateSection = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { section } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  try {
    // Check if section exists
    const { data: existing } = await supabase
      .from("admin_content")
      .select("id")
      .eq("section_name", section)
      .single();

    let result;
    if (existing) {
      // Update existing
      result = await supabase
        .from("admin_content")
        .update({
          content,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq("section_name", section)
        .select()
        .single();
    } else {
      // Create new
      result = await supabase
        .from("admin_content")
        .insert([
          {
            section_name: section,
            content,
            updated_by: userId,
          },
        ])
        .select()
        .single();
    }

    if (result.error) {
      return res.status(500).json({ error: "Failed to update section" });
    }

    res.json({ success: true, content: result.data });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get featured products for homepage
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .eq("is_active", true)
      .limit(6);

    if (error) {
      return res.status(500).json({ error: "Failed to fetch featured products" });
    }

    // Apply pricing visibility rules
    const productsWithPricing = await applyPricingRules(products || [], userId);

    res.json({ 
      products: productsWithPricing,
      pricingInfo: {
        isLoggedIn: !!userId,
        b2bPricingVisible: userId ? true : false,
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get categories for homepage
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*");

    if (error) {
      return res.status(500).json({ error: "Failed to fetch categories" });
    }

    res.json({ categories: categories || [] });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
