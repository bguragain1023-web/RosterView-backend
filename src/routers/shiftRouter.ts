import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import { createShiftValidation } from "../middleware/validation/shiftValidation";
import { createShift, fetchAllShifts } from "../controllers/shiftController";
const router = express.Router();

//create shift

router.post(
  "/createshift",
  auth,
  requirePermission("shift", "create"),
  createShiftValidation,
  createShift,
);

//get all shifts

router.get("/", auth, requirePermission("shift", "create"), fetchAllShifts);
export default router;
