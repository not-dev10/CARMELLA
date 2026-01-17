import { Router } from "express";
import {
  signup,
  login,
  googleAuth,
  getCurrentUser,
  logout,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/index.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", logout);

export default router;
