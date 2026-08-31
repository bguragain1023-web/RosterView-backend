import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import { createShiftValidation } from "../middleware/validation/shiftValidation";
import { createShift } from "../controllers/shiftController";
const router = express.Router();

//create user

router.post(
  "/createshift",
  auth,
  requirePermission("shift", "create"),
  createShiftValidation,
  createShift,
);

export default router;
