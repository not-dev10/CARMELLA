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
  
  // AWS S3
  aws: {
    region: process.env.AWS_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    bucketName: process.env.AWS_S3_BUCKET_NAME || "",
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
    origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      const allowedOrigins = process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
        : ["http://localhost:5173"];
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
};

// Log configuration status
if (process.env.NODE_ENV === "development") {
  console.log("\n🔧 Configuration Status:");
  console.log("✓ SUPABASE_URL:", config.supabase.url ? "✓ Loaded" : "✗ Missing");
  console.log("✓ SUPABASE_ANON_KEY:", config.supabase.anonKey ? "✓ Loaded" : "✗ Missing");
  console.log("✓ SUPABASE_SERVICE_KEY:", config.supabase.serviceKey ? "✓ Loaded" : "✗ Missing");
  console.log("☁️ AWS_REGION:", config.aws.region ? "✓ Loaded" : "✗ Missing");
  console.log("☁️ AWS_S3_BUCKET_NAME:", config.aws.bucketName ? "✓ Loaded" : "✗ Missing");
  console.log("📧 MAIL_SERVICE:", config.mail.service ? `✓ ${config.mail.service}` : "✗ Not configured");
  console.log("");
}

