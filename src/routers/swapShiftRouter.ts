import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import {
  createShiftSwapValidation,
  fetchedEligibleSwapWorkerValidation,
  swapShiftActionValidation,
} from "../middleware/validation/shiftSwapValidation";
import {
  createSwapShift,
  fetchSwapEligibleWorker,
  shiftReviewByManagers,
  swapShiftActionByWorker,
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
  (req, res, next) => {
    console.log("authPassed");
    next();
  },
  requirePermission("shiftSwap", "create"),

  (req, res, next) => {
    console.log("permission passed");
    next();
  },

  createShiftSwapValidation,
  createSwapShift,
);

// accept or reject swapShift by worker
router.patch(
  "/:swapShiftId/accept",
  auth,
  requirePermission("shiftSwap", "read"),
  swapShiftActionValidation,
  swapShiftActionByWorker,
);

router.patch(
  "/:swapShiftId/review",
  auth,
  requirePermission("shiftSwap", "approve"),
  swapShiftActionValidation,
  shiftReviewByManagers,
);

export default router;
