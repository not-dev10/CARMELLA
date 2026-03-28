import { Router } from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { authMiddleware, adminMiddleware } from "../middleware/index.js";
import { cacheMiddleware, clearCache } from "../middleware/cache.js";

const router = Router();

// Public endpoints with caching
router.get("/", cacheMiddleware(1800), getCategories); // Cache for 30 minutes
router.get("/:id", cacheMiddleware(1800), getCategory); // Cache for 30 minutes

// Admin endpoints (clear cache on mutations)
router.post("/", authMiddleware, adminMiddleware, async (req, res, next) => {
  clearCache('categories');
  next();
}, createCategory);

router.put("/:id", authMiddleware, adminMiddleware, async (req, res, next) => {
  clearCache('categories');
  next();
}, updateCategory);

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res, next) => {
  clearCache('categories');
  next();
}, deleteCategory);

export default router;
