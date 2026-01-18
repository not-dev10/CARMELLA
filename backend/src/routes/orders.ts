import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authMiddleware, adminMiddleware } from "../middleware/index.js";

const router = Router();

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getOrders);
router.get("/:id", authMiddleware, getOrder);
router.put("/:id", authMiddleware, adminMiddleware, updateOrderStatus);

export default router;
