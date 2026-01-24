import { Router } from "express";
import {
  getInventory,
  getLowStockItems,
  updateInventory,
  adjustInventory,
  getInventoryHistory,
  getInventoryStats,
} from "../controllers/inventoryController.js";
import { authMiddleware, adminMiddleware } from "../middleware/index.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);

// Inventory endpoints
router.get("/", getInventory);
router.get("/stats", getInventoryStats);
router.get("/low-stock", getLowStockItems);
router.put("/:inventoryId", updateInventory);
router.post("/:inventoryId/adjust", adjustInventory);
router.get("/:inventoryId/history", getInventoryHistory);

export default router;
