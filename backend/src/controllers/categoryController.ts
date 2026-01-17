import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

/**
 * Get all categories
 * GET /api/categories
 */
export async function getCategories(req: Request, res: Response) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
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

    const { data, error } = await supabase
      .from("categories")
      .select("*")
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

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name,
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
