import express from "express";
import cors from "cors";
import "express-async-errors";
import { config } from "./config/index.js";
import { errorHandler } from "./middleware/index.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import userRoutes from "./routes/users.js";
import categoryRoutes from "./routes/categories.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log(`✅ Server running on http://localhost:${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`📊 Ready to accept connections...`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
