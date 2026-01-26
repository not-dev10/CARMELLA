import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase.js";
import { AppError } from "../utils/errors.js";
import { performanceTracker } from "../utils/performanceTracker.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userType?: string;
      startTime?: number;
    }
  }
}

// Latency tracking middleware
export function latencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.startTime = Date.now();
  
  // Capture the original send function
  const originalSend = res.send;
  
  res.send = function(data: any) {
    const latency = Date.now() - (req.startTime || Date.now());
    const method = req.method;
    const path = req.path;
    const status = res.statusCode;
    
    console.log(`[LATENCY] ${method} ${path} - Status: ${status} - ${latency}ms`);
    
    // Track performance metric
    performanceTracker.recordMetric(method, path, status, latency);
    
    // Call the original send function
    return originalSend.call(this, data);
  };
  
  next();
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.warn("[AUTH] Missing authorization token");
    return res.status(401).json({ error: "Missing authorization token" });
  }

  try {
    console.log("[AUTH] Verifying token...");
    
    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("[AUTH] Token verification failed:", error);
      return res.status(401).json({ error: "Invalid token" });
    }

    req.userId = user.id;
    req.userEmail = user.email || "";

    console.log("[AUTH] Token verified for user:", user.id, user.email);

    // Get user type from custom claims or database
    const { data: userData } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", user.id)
      .single();

    req.userType = userData?.user_type || "customer";
    console.log("[AUTH] User type:", req.userType);
    
    next();
  } catch (error) {
    console.error("[AUTH] Unexpected error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("[ADMIN_MIDDLEWARE] Checking admin access for user:", req.userId, "Type:", req.userType);
  
  if (req.userType !== "admin") {
    console.warn("[ADMIN_MIDDLEWARE] Access denied. User type is:", req.userType);
    return res.status(403).json({ error: "Admin access required" });
  }
  
  console.log("[ADMIN_MIDDLEWARE] Admin access granted");
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
