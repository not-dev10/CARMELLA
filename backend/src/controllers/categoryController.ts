import { Request, Response } from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { deleteFromS3 } from "../utils/s3.js";

/**
 * Get all categories
 * GET /api/categories
 */
export async function getCategories(req: Request, res: Response) {
  try {
    // ✅ OPTIMIZED: Select only needed fields instead of *
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, image_url, description")
      .order("name");

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ categories: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get single category
 * GET /api/categories/:id
 */
export async function getCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // ✅ OPTIMIZED: Select only needed fields instead of *
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, image_url, description")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Create category (admin only)
 * POST /api/categories
 */
export async function createCategory(req: Request, res: Response) {
  try {
    const { name, description, imageUrl } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert({
        name,
        slug,
        description,
        image_url: imageUrl,
      })
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Update category (admin only)
 * PUT /api/categories/:id
 */
export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, imageUrl } = req.body;

    console.log("[UPDATE_CATEGORY] Attempting to update category:", id);
    console.log("[UPDATE_CATEGORY] Update data:", { name, description, imageUrl });

    // Generate slug from name if name is being updated
    const slug = name
      ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      : undefined;

    const updateData: any = {
      description,
      image_url: imageUrl,
    };

    if (name) {
      updateData.name = name;
      updateData.slug = slug;
    }

    const { data, error } = await supabaseAdmin
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select();

    console.log("[UPDATE_CATEGORY] Supabase response:", { data, error });

    if (error) {
      console.error("[UPDATE_CATEGORY] Supabase error:", error);
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      console.error("[UPDATE_CATEGORY] Category not found in database:", id);
      return res.status(404).json({ error: "Category not found" });
    }

    console.log("[UPDATE_CATEGORY] Successfully updated category:", data[0]);
    return res.json(data[0]);
  } catch (error: any) {
    console.error("[UPDATE_CATEGORY] Exception:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Delete category (admin only)
 * DELETE /api/categories/:id
 */
export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Check if category has products
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("category_id", id)
      .limit(1);

    if (productsError) {
      return res.status(400).json({ error: productsError.message });
    }

    if (products && products.length > 0) {
      return res.status(400).json({ 
        error: "Cannot delete category with existing products. Please reassign or delete products first." 
      });
    }

    // Get category to retrieve image URL before deletion
    const { data: category, error: fetchError } = await supabaseAdmin
      .from("categories")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Delete from database first
    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Delete image from S3 (non-blocking, don't fail if this fails)
    if (category.image_url) {
      deleteFromS3(category.image_url).catch(err => {
        console.error("[CATEGORY] Failed to delete image from S3:", err);
      });
    }

    return res.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
