import { Router } from "express";
import {
  getHomepageContent,
  getSection,
  updateSection,
  getFeaturedProducts,
  getCategories,
} from "../controllers/homepageController.js";
import { authMiddleware, adminMiddleware } from "../middleware/index.js";
import { cacheMiddleware } from "../middleware/cache.js";

const router = Router();

// Public endpoints with caching
router.get("/content", cacheMiddleware(3600), getHomepageContent); // Cache for 1 hour
router.get("/content/:section", cacheMiddleware(3600), getSection); // Cache for 1 hour
router.get("/featured-products", getFeaturedProducts); // No cache (user-specific pricing)
router.get("/categories", cacheMiddleware(1800), getCategories); // Cache for 30 minutes

// Admin endpoints
router.put("/content/:section", authMiddleware, adminMiddleware, updateSection);

export default router;
