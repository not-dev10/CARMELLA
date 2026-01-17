import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  requestB2BAccess,
  getB2BStatus,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/index.js";

const router = Router();

router.get("/:id", authMiddleware, getUserProfile);
router.put("/:id", authMiddleware, updateUserProfile);
router.post("/:id/request-b2b", authMiddleware, requestB2BAccess);
router.get("/:id/b2b-status", authMiddleware, getB2BStatus);

export default router;
