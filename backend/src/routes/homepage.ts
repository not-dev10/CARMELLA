import { Router } from "express";
import {
  getHomepageContent,
  getSection,
  updateSection,
  getFeaturedProducts,
  getCategories,
} from "../controllers/homepageController.js";
import { authMiddleware, adminMiddleware } from "../middleware/index.js";

const router = Router();

// Public endpoints
router.get("/content", getHomepageContent);
router.get("/content/:section", getSection);
router.get("/featured-products", getFeaturedProducts);
router.get("/categories", getCategories);

// Admin endpoints
router.put("/content/:section", authMiddleware, adminMiddleware, updateSection);

export default router;
