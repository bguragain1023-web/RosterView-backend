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

export default router;
