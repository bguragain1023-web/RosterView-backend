import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import { createLeaveRequestValidation } from "../middleware/validation/leaveRequestValidation";
import { createLeaveRequest } from "../controllers/leaveRequestContoller";

const router = express.Router();

router.post(
  "/createLeaveRequest",
  auth,
  requirePermission("leaveRequest", "create"),
  createLeaveRequestValidation,
  createLeaveRequest,
);

export default router;
