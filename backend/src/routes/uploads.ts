import { Router } from "express";
import { getSignedUploadUrl } from "../controllers/uploadController.js";
import { authMiddleware } from "../middleware/index.js";
import { uploadLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// All upload endpoints require authentication and have their own rate limiter
router.use(authMiddleware);
router.use(uploadLimiter); // Apply upload-specific rate limiter

// Get presigned S3 upload URL
router.post("/get-signed-url", getSignedUploadUrl);

export default router;
