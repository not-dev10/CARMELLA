import { Router } from "express";
import { getSignedUploadUrl } from "../controllers/uploadController.js";
import { authMiddleware } from "../middleware/index.js";

const router = Router();

// All upload endpoints require authentication
router.use(authMiddleware);

// Get presigned S3 upload URL
router.post("/get-signed-url", getSignedUploadUrl);

export default router;
