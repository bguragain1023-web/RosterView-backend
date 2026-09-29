import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import { createLeaveRequestValidation } from "../middleware/validation/leaveRequestValidation";
import {
  cancelLeaveRequest,
  createLeaveRequest,
  getLeaveRequests,
} from "../controllers/leaveRequestContoller";

const router = express.Router();

router.post(
  "/createLeaveRequest",
  auth,
  requirePermission("leaveRequest", "create"),
  createLeaveRequestValidation,
  createLeaveRequest,
);

router.get(
  "/",
  auth,
  requirePermission("leaveRequest", "read"),
  getLeaveRequests,
);

router.patch(
  "/:id/cancel",
  auth,
  requirePermission("leaveRequest", "update"),
  cancelLeaveRequest,
);

export default router;
