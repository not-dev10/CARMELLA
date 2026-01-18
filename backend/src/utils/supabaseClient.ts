import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config/index.js";
import { Request } from "express";

/**
 * Create a Supabase client with the user's auth context
 * This ensures RLS policies and views use the correct user's permissions
 */
export function getSupabaseClient(req: Request): SupabaseClient {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
        // Create client with user's JWT token
        return createClient(
            config.supabase.url,
            config.supabase.anonKey,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        );
    }

    // No auth token - create anonymous client
    return createClient(
        config.supabase.url,
        config.supabase.anonKey
    );
}
