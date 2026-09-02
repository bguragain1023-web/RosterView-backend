import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import {
  createShiftValidation,
  deleteShiftValidation,
  updateShiftValidation,
} from "../middleware/validation/shiftValidation";
import {
  createShift,
  deleteShift,
  fetchAllShifts,
  getSingleShift,
  updateShift,
} from "../controllers/shiftController";
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

router.get("/", auth, requirePermission("shift", "read"), fetchAllShifts);

router.get("/:id", auth, requirePermission("shift", "read"), getSingleShift);

router.patch(
  "/:id",
  auth,
  requirePermission("shift", "update"),
  updateShiftValidation,
  updateShift,
);

export default router;

router.delete(
  "/",
  auth,
  requirePermission("shift", "update"),
  deleteShiftValidation,
  deleteShift,
);
