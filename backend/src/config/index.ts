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
  
  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  
  // Mail Configuration
  mail: {
    service: process.env.MAIL_SERVICE || "",
    host: process.env.MAIL_HOST || "",
    port: parseInt(process.env.MAIL_PORT || "587"),
    user: process.env.MAIL_USER || "",
    password: process.env.MAIL_PASSWORD || "",
    from: process.env.MAIL_FROM || "",
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
};

// Log configuration status
if (process.env.NODE_ENV === "development") {
  console.log("\n🔧 Configuration Status:");
  console.log("✓ SUPABASE_URL:", config.supabase.url ? "✓ Loaded" : "✗ Missing");
  console.log("✓ SUPABASE_ANON_KEY:", config.supabase.anonKey ? "✓ Loaded" : "✗ Missing");
  console.log("✓ SUPABASE_SERVICE_KEY:", config.supabase.serviceKey ? "✓ Loaded" : "✗ Missing");
  console.log("☁️ CLOUDINARY_CLOUD_NAME:", config.cloudinary.cloudName ? "✓ Loaded" : "✗ Missing");
  console.log("☁️ CLOUDINARY_UPLOAD_PRESET:", config.cloudinary.uploadPreset ? "✓ Loaded" : "✗ Missing");
  console.log("📧 MAIL_SERVICE:", config.mail.service ? `✓ ${config.mail.service}` : "✗ Not configured");
  console.log("");
}

