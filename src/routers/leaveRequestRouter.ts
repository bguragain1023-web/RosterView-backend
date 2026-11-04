import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import {
  createLeaveRequestValidation,
  reviewLeaveRequestValidation,
} from "../middleware/validation/leaveRequestValidation";
import {
  cancelApprovedLeaveRequest,
  cancelLeaveRequest,
  createLeaveRequest,
  getLeaveRequests,
  reviewLeaveRequests,
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

router.patch(
  "/:id/review",
  auth,
  requirePermission("leaveRequest", "approve"),
  reviewLeaveRequestValidation,
  reviewLeaveRequests,
);

// cancel APPROVED leave: admin + coordinator only (leave:delete)
router.patch(
  "/:id/cancel-approved",
  auth,
  requirePermission("leaveRequest", "delete"),
  cancelApprovedLeaveRequest,
);

export default router;
