import { Request, Response } from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { signupSchema, loginSchema, googleAuthSchema } from "../types/validation.js";

/**
 * Sign up with email and password
 * POST /api/auth/signup
 */
export async function signup(req: Request, res: Response) {
  try {
    console.log("[SIGNUP] Request received:", { email: req.body.email });
    
    const { email, password, firstName, lastName, phone } = signupSchema.parse(
      req.body
    );

    console.log("[SIGNUP] Validation passed for:", email);

    // Create user with Supabase Auth
    console.log("[SIGNUP] Creating auth user...");
    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (authError) {
      console.error("[SIGNUP] Auth error:", authError);
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      console.error("[SIGNUP] No user returned from auth");
      return res.status(400).json({ error: "Failed to create user" });
    }

    console.log("[SIGNUP] Auth user created:", authData.user.id);

    // Create or update user profile in database using admin client to bypass RLS
    console.log("[SIGNUP] Creating user profile in database...");
    const { error: profileError } = await supabaseAdmin.from("users").upsert({
      id: authData.user.id,
      email,
      user_type: "user",
    }, { onConflict: "id" });

    if (profileError) {
      console.error("[SIGNUP] Profile creation error:", profileError);
      return res.status(400).json({ error: profileError.message });
    }

    console.log("[SIGNUP] User profile created successfully:", authData.user.id);

    return res.status(201).json({
      message: "User created successfully. Please verify your email.",
      user: authData.user,
    });
  } catch (error: any) {
    console.error("[SIGNUP] Unexpected error:", error);
    return res.status(400).json({ error: error.message });
  }
}

/**
 * Login with email and password
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response) {
  try {
    console.log("[LOGIN] Request received:", { email: req.body.email });
    
    const { email, password } = loginSchema.parse(req.body);

    console.log("[LOGIN] Validation passed for:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[LOGIN] Auth error:", error);
      return res.status(401).json({ error: error.message });
    }

    console.log("[LOGIN] Login successful for user:", data.user?.id);

    return res.json({
      user: data.user,
      session: data.session,
    });
  } catch (error: any) {
    console.error("[LOGIN] Unexpected error:", error);
    return res.status(400).json({ error: error.message });
  }
}

/**
 * Google OAuth callback
 * POST /api/auth/google
 */
export async function googleAuth(req: Request, res: Response) {
  try {
    const { token } = googleAuthSchema.parse(req.body);

    // Get user info from Google token (frontend should send this)
    // In production, verify the token on the backend
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Check if user profile exists, if not create it
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select()
      .eq("id", data.user!.id)
      .single();

    if (!existingUser) {
      const { error: profileError } = await supabaseAdmin.from("users").upsert({
        id: data.user!.id,
        email: data.user!.email,
        google_id: data.user!.id,
        google_name: data.user!.user_metadata?.name,
        google_email: data.user!.email,
        google_picture: data.user!.user_metadata?.picture,
        user_type: "user",
      }, { onConflict: "id" });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }

    return res.json({
      user: data.user,
      session: data.session,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

/**
 * Get current user
 * GET /api/auth/me
 */
export async function getCurrentUser(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get user profile from database
    const { data: userProfile } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    return res.json({
      user: data.user,
      profile: userProfile,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

/**
 * Logout
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
