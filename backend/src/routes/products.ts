import { Router } from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductPricing,
} from "../controllers/productController.js";
import { authMiddleware, adminMiddleware } from "../middleware/index.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id/pricing", getProductPricing);
router.get("/:id", getProduct);
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;
