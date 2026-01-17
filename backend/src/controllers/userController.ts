import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";
import { updateProfileSchema, b2bRequestSchema } from "../types/validation.js";

/**
 * Get user profile
 * GET /api/users/:id
 */
export async function getUserProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Only allow users to access their own profile or admins
    if (req.userId !== id && req.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Update user profile
 * PUT /api/users/:id
 */
export async function updateUserProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Only allow users to update their own profile
    if (req.userId !== id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updates = updateProfileSchema.parse(req.body);

    const { data, error } = await supabase
      .from("users")
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone,
        company_name: updates.companyName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data[0]);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

/**
 * Request B2B access
 * POST /api/users/:id/request-b2b
 */
export async function requestB2BAccess(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Only allow users to request for themselves
    if (req.userId !== id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { companyName, taxId } = b2bRequestSchema.parse(req.body);

    // Create B2B approval request
    const { data, error } = await supabase
      .from("b2b_approvals")
      .insert({
        user_id: id,
        company_name: companyName,
        tax_id: taxId,
        status: "pending",
        request_date: new Date().toISOString(),
      })
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

/**
 * Get B2B approval status
 * GET /api/users/:id/b2b-status
 */
export async function getB2BStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Only allow users to check their own status or admins
    if (req.userId !== id && req.userType !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { data, error } = await supabase
      .from("b2b_approvals")
      .select("*")
      .eq("user_id", id)
      .order("request_date", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data || null);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
