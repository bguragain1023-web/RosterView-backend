import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import {
  createShiftSwapValidation,
  fetchedEligibleSwapWorkerValidation,
} from "../middleware/validation/shiftSwapValidation";
import {
  createSwapShift,
  fetchSwapEligibleWorker,
} from "../controllers/swapShiftController";

const router = express.Router();

//check eligibility worker

router.post(
  "/eligibileshift",
  auth,
  requirePermission("shiftSwap", "create"),
  fetchedEligibleSwapWorkerValidation,
  fetchSwapEligibleWorker,
);

//create swapshift

router.post(
  "/createSwapShift",
  auth,
  requirePermission("shiftSwap", "create"),
  createShiftSwapValidation,
  createSwapShift,
);

export default router;
