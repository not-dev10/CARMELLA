import { Router } from "express";
import {
  getUsers,
  getUser,
  updateUser,
  getB2BRequests,
  approveB2BRequest,
  rejectB2BRequest,
  getOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/adminController.js";
import { fixDataStructures } from "../controllers/adminFixController.js";
import { authMiddleware, adminMiddleware } from "../middleware/index.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);

// Users endpoints
router.get("/users", getUsers);
router.get("/users/:userId", getUser);
router.put("/users/:userId", updateUser);

// Orders endpoints
router.get("/orders", getOrders);
router.put("/orders/:orderId", updateOrderStatus);
router.delete("/orders/:orderId", deleteOrder);

// B2B requests endpoints
router.get("/b2b-requests", getB2BRequests);
router.put("/b2b-requests/:userId/approve", approveB2BRequest);
router.put("/b2b-requests/:userId/reject", rejectB2BRequest);

// Data structure fix endpoint
router.post("/fix-data-structures", fixDataStructures);

export default router;
