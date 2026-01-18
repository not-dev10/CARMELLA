import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";
import { signupSchema, loginSchema, googleAuthSchema } from "../types/validation.js";

/**
 * Sign up with email and password
 * POST /api/auth/signup
 */
export async function signup(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName, phone } = signupSchema.parse(
      req.body
    );

    // Create user with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile in database
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user!.id,
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      user_type: "user",
    });

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    return res.status(201).json({
      message: "User created successfully",
      user: authData.user,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

/**
 * Login with email and password
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
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
    const { data: existingUser } = await supabase
      .from("users")
      .select()
      .eq("id", data.user!.id)
      .single();

    if (!existingUser) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user!.id,
        email: data.user!.email,
        google_id: data.user!.id,
        google_name: data.user!.user_metadata?.name,
        google_email: data.user!.email,
        google_picture: data.user!.user_metadata?.picture,
        user_type: "user",
      });

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
