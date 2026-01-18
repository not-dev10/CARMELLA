import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { authMiddleware } from "../middleware/index.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:itemId", updateCartItem);
router.delete("/:itemId", removeFromCart);
router.delete("/", clearCart);

export default router;
