import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

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

    let query = supabase
      .from("b2b_approvals")
      .select("*, users(*)", { count: "exact" });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query
      .order("request_date", { ascending: false })
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
    const { data: approval, error: approvalError } = await supabase
      .from("b2b_approvals")
      .update({
        status: "approved",
        approval_date: new Date().toISOString(),
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        notes,
      })
      .eq("user_id", userId)
      .eq("status", "pending")
      .select()
      .single();

    if (approvalError) {
      return res.status(400).json({ error: approvalError.message });
    }

    // Update user type to b2b_approved
    const { error: userError } = await supabase
      .from("users")
      .update({ user_type: "b2b_approved" })
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

    const { data, error } = await supabase
      .from("b2b_approvals")
      .update({
        status: "rejected",
        notes,
      })
      .eq("user_id", userId)
      .eq("status", "pending")
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: "B2B request rejected",
      approval: data,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
