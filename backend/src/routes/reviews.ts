import { Router } from "express";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
} from "../controllers/reviewController.js";
import { authMiddleware, adminMiddleware } from "../middleware/index.js";

const router = Router();

router.get("/products/:productId", getProductReviews);
router.post("/products/:productId", authMiddleware, createReview);
router.put("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, deleteReview);
router.post("/:id/helpful", authMiddleware, markHelpful);

export default router;
