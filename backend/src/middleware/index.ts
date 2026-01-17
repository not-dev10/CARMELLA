import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase.js";
import { AppError } from "../utils/errors.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userType?: string;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  try {
    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.userId = user.id;
    req.userEmail = user.email || "";

    // Get user type from custom claims or database
    const { data: userData } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", user.id)
      .single();

    req.userType = userData?.user_type || "customer";
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.userType !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function b2bMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.userType !== "b2b_approved" && req.userType !== "admin") {
    return res.status(403).json({ error: "B2B access required" });
  }
  next();
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  return res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}
