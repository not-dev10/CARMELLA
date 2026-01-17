import { Router } from "express";
import {
  getB2BRequests,
  approveB2BRequest,
  rejectB2BRequest,
} from "../controllers/adminController.js";
import { authMiddleware, adminMiddleware } from "../middleware/index.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/b2b-requests", getB2BRequests);
router.put("/b2b-requests/:userId/approve", approveB2BRequest);
router.put("/b2b-requests/:userId/reject", rejectB2BRequest);

export default router;
