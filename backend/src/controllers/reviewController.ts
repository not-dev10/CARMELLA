import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

export const getProductReviews = async (req: Request, res: Response) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*, users(first_name, last_name, google_id)")
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch reviews" });
    }

    res.json({ reviews: reviews || [] });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createReview = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { productId } = req.params;
  const { rating, title, comment } = req.body;

  // Validation
  if (!productId || !rating || !title || !comment) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  if (title.length < 3 || title.length > 100) {
    return res.status(400).json({ error: "Title must be 3-100 characters" });
  }

  if (comment.length < 10 || comment.length > 1000) {
    return res.status(400).json({ error: "Comment must be 10-1000 characters" });
  }

  try {
    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if user already reviewed this product
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    if (existing) {
      return res.status(400).json({ error: "You already reviewed this product" });
    }

    // Create review
    const { data: review, error } = await supabase
      .from("reviews")
      .insert([
        {
          user_id: userId,
          product_id: productId,
          rating,
          title,
          comment,
          status: "pending",
          helpful_count: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to create review" });
    }

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { rating, title, comment } = req.body;

  // Validation
  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  if (title && (title.length < 3 || title.length > 100)) {
    return res.status(400).json({ error: "Title must be 3-100 characters" });
  }

  if (comment && (comment.length < 10 || comment.length > 1000)) {
    return res.status(400).json({ error: "Comment must be 10-1000 characters" });
  }

  try {
    // Check if review exists and belongs to user
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (reviewError || !review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Update review
    const { data: updated, error } = await supabase
      .from("reviews")
      .update({
        rating: rating || review.rating,
        title: title || review.title,
        comment: comment || review.comment,
        status: "pending", // Reset to pending for re-moderation
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to update review" });
    }

    res.json({ success: true, review: updated });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    // Check if review exists and belongs to user
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (reviewError || !review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Delete review
    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      return res.status(500).json({ error: "Failed to delete review" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markHelpful = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    // Check if user already marked as helpful
    const { data: existing } = await supabase
      .from("review_helpful")
      .select("id")
      .eq("review_id", id)
      .eq("user_id", userId)
      .single();

    if (existing) {
      return res.status(400).json({ error: "You already marked this as helpful" });
    }

    // Add helpful mark
    const { error: insertError } = await supabase
      .from("review_helpful")
      .insert([{ review_id: id, user_id: userId }]);

    if (insertError) {
      return res.status(500).json({ error: "Failed to mark as helpful" });
    }

    // Increment helpful count
    const { data: review, error: updateError } = await supabase
      .from("reviews")
      .select("helpful_count")
      .eq("id", id)
      .single();

    if (!updateError && review) {
      await supabase
        .from("reviews")
        .update({ helpful_count: (review.helpful_count || 0) + 1 })
        .eq("id", id);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
