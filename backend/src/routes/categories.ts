import { Router } from "express";
import {
  getCategories,
  getCategory,
  createCategory,
} from "../controllers/categoryController.js";
import { authMiddleware, adminMiddleware } from "../middleware/index.js";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategory);
router.post("/", authMiddleware, adminMiddleware, createCategory);

export default router;
