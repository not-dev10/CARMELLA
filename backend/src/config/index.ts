import dotenv from "dotenv";

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000"),
  
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || "",
    serviceKey: process.env.SUPABASE_SERVICE_KEY || "",
  },
  
  // Google OAuth (for frontend)
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
};

// Log configuration status
if (process.env.NODE_ENV === "development") {
  console.log("✓ SUPABASE_URL:", config.supabase.url ? "✓ Loaded" : "✗ Missing");
  console.log("✓ SUPABASE_ANON_KEY:", config.supabase.anonKey ? "✓ Loaded" : "✗ Missing");
  console.log("✓ SUPABASE_SERVICE_KEY:", config.supabase.serviceKey ? "✓ Loaded" : "✗ Missing");
}

