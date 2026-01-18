import { Router } from "express";
import {
  getDashboardStats,
  getSalesTrend,
  getRevenueByCategory,
  getTopProducts,
} from "../controllers/analyticsController.js";
import { authMiddleware, adminMiddleware } from "../middleware/index.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/dashboard", getDashboardStats);
router.get("/sales-trend", getSalesTrend);
router.get("/revenue-by-category", getRevenueByCategory);
router.get("/top-products", getTopProducts);

export default router;
