import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";
import { getSupabaseClient } from "../utils/supabaseClient.js";

/**
 * Homepage Controller
 * Uses products_safe view for secure pricing
 */

// Get all homepage content sections
export const getHomepageContent = async (req: Request, res: Response) => {
  try {
    // ✅ OPTIMIZED: Select only needed fields instead of *
    const { data: content, error } = await supabase
      .from("admin_content")
      .select("section_name, content");

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
    // ✅ OPTIMIZED: Select only needed fields instead of *
    const { data: content, error } = await supabase
      .from("admin_content")
      .select("section_name, content")
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
    console.log(`[HOMEPAGE] Updating section: ${section} by user: ${userId}`);

    // Check if section exists first
    const { data: existing, error: checkError } = await supabase
      .from("admin_content")
      .select("id, content")
      .eq("section_name", section);

    if (checkError) {
      console.error(`[HOMEPAGE] Error checking existing section:`, checkError);
      return res.status(500).json({ error: "Failed to check section" });
    }

    let response;
    if (existing && existing.length > 0) {
      // Update existing section
      console.log(`[HOMEPAGE] Updating existing section: ${section}`);
      const { error: updateError } = await supabase
        .from("admin_content")
        .update({ content })
        .eq("section_name", section);

      if (updateError) {
        console.error(`[HOMEPAGE] Failed to update section ${section}:`, updateError);
        return res.status(500).json({ 
          error: "Failed to update section",
          details: updateError.message 
        });
      }

      response = { success: true, content, section_name: section };
    } else {
      // Create new section
      console.log(`[HOMEPAGE] Creating new section: ${section}`);
      const { data: insertedData, error: insertError } = await supabase
        .from("admin_content")
        .insert([
          {
            section_name: section,
            content,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error(`[HOMEPAGE] Failed to insert section ${section}:`, insertError);
        return res.status(500).json({ 
          error: "Failed to create section",
          details: insertError.message 
        });
      }

      response = { success: true, content: insertedData };
    }

    console.log(`[HOMEPAGE] Section ${section} updated successfully`);
    res.json(response);
  } catch (error) {
    console.error(`[HOMEPAGE] Unexpected error updating section:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get featured products for homepage
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    // Use user-specific client to pass auth context to products_safe view
    const userSupabase = getSupabaseClient(req);
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    console.log(`[HOMEPAGE] getFeaturedProducts - Auth token present: ${!!token}`);
    
    // ✅ OPTIMIZED: Select only needed fields instead of *
    const { data: products, error } = await userSupabase
      .from("products_safe")
      .select(`
        id,
        name,
        slug,
        image_url,
        base_price,
        sale_price,
        b2b_price,
        moq,
        pricing_locked,
        user_tier
      `)
      .eq("is_featured", true)
      .limit(6);

    if (error) {
      console.error(`[HOMEPAGE] getFeaturedProducts error:`, error);
      return res.status(500).json({ error: "Failed to fetch featured products" });
    }

    console.log(`[HOMEPAGE] getFeaturedProducts - Returned ${products?.length || 0} products`);
    if (products && products.length > 0) {
      console.log(`[HOMEPAGE] First product pricing:`, {
        id: products[0].id,
        base_price: products[0].base_price,
        pricing_locked: products[0].pricing_locked,
        user_tier: products[0].user_tier
      });
    }

    // Transform database fields to camelCase for frontend
    const transformedProducts = (products || []).map((p: any) => ({
      ...p,
      pricingLocked: p.pricing_locked,
      userTier: p.user_tier,
    }));

    res.json({
      products: transformedProducts,
      pricingInfo: {
        message: "Pricing visibility based on B2B approval status"
      }
    });
  } catch (error) {
    console.error(`[HOMEPAGE] getFeaturedProducts unexpected error:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get categories for homepage
export const getCategories = async (req: Request, res: Response) => {
  try {
    // ✅ OPTIMIZED: Select only needed fields instead of *
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name, slug, image_url");

    if (error) {
      return res.status(500).json({ error: "Failed to fetch categories" });
    }

    res.json({ categories: categories || [] });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
