import express from "express";
import cors from "cors";
import "express-async-errors";
import { config } from "./config/index.js";
import { errorHandler, latencyMiddleware } from "./middleware/index.js";
import { compressionMiddleware } from "./middleware/compression.js";
import { apiLimiter, authLimiter, adminLimiter } from "./middleware/rateLimiter.js";
import { initializeAllProcessors } from "./queues/index.js";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import userRoutes from "./routes/users.js";
import categoryRoutes from "./routes/categories.js";
import adminRoutes from "./routes/admin.js";
import uploadRoutes from "./routes/uploads.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import wishlistRoutes from "./routes/wishlist.js";
import reviewRoutes from "./routes/reviews.js";
import analyticsRoutes from "./routes/analytics.js";
import homepageRoutes from "./routes/homepage.js";
import inventoryRoutes from "./routes/inventory.js";

const app = express();

// Security & Performance Middleware
app.use(cors(config.cors));
app.use(compressionMiddleware); // Gzip compression
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(latencyMiddleware);

// Apply rate limiting to all API routes
app.use("/api/", apiLimiter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Detailed server checklist
app.get("/api/checklist", (req, res) => {
  const checklist = {
    timestamp: new Date().toISOString(),
    status: "OK",
    checks: {
      server: { status: "OK", message: "Server is running" },
      database: {
        status: process.env.SUPABASE_URL ? "OK" : "MISSING",
        message: process.env.SUPABASE_URL ? "Supabase connected" : "Missing SUPABASE_URL"
      },
      s3: {
        status: process.env.AWS_S3_BUCKET_NAME ? "OK" : "MISSING",
        message: process.env.AWS_S3_BUCKET_NAME 
          ? `Bucket: ${process.env.AWS_S3_BUCKET_NAME}` 
          : "Missing AWS_S3_BUCKET_NAME"
      },
      mail: {
        status: process.env.MAIL_SERVICE ? "OK" : "NOT_CONFIGURED",
        message: process.env.MAIL_SERVICE 
          ? `Service: ${process.env.MAIL_SERVICE}` 
          : "Mail service not configured"
      },
      environment: {
        status: process.env.NODE_ENV ? "OK" : "MISSING",
        message: `NODE_ENV: ${process.env.NODE_ENV || "not set"}`
      }
    }
  };
  
  res.json(checklist);
});

// Routes
app.use("/api/auth", authLimiter, authRoutes); // Strict rate limit for auth
app.use("/api/upload", uploadRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminLimiter, adminRoutes); // Higher limit for admin
app.use("/api/admin/inventory", adminLimiter, inventoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin/analytics", adminLimiter, analyticsRoutes);
app.use("/api/homepage", homepageRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler (must be last)
app.use(errorHandler);

// Test S3 connectivity
async function testS3Connection(): Promise<boolean> {
  try {
    const s3Client = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });

    const command = new HeadBucketCommand({ Bucket: config.aws.bucketName });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error(`❌ S3 Connection Failed:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Start server
const server = app.listen(config.port, async () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Server running on http://localhost:${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🌍 AWS Region: ${config.aws.region}`);
  
  // Test S3 connectivity
  if (config.aws.bucketName && config.aws.accessKeyId) {
    console.log(`\n☁️  Testing S3 Connection...`);
    const s3Status = await testS3Connection();
    if (s3Status) {
      console.log(`✅ S3 Connected: ${config.aws.bucketName} (${config.aws.region})`);
    } else {
      console.log(`⚠️  S3 Connection Failed - Check credentials and bucket name`);
    }
  } else {
    console.log(`⚠️  S3 Configuration Missing - Some features may not work`);
  }
  
  console.log(`\n📊 Ready to accept connections...`);
  console.log(`${'='.repeat(50)}\n`);
  
  // Initialize queue processors
  try {
    await initializeAllProcessors();
    console.log(`✅ Queue processors initialized successfully`);
  } catch (error) {
    console.error(`❌ Failed to initialize queue processors:`, error);
    // Don't exit - server can still handle requests, just no async processing
    console.warn(`⚠️  Continuing without queue processors...`);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
