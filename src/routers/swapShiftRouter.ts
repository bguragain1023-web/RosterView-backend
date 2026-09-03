import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import { fetchedEligibleSwapWorkerValidation } from "../middleware/validation/shiftSwapValidation";
import { fetchSwapEligibleWorker } from "../controllers/swapShiftController";

const router = express.Router();

//check eligibility worker
router.post(
  "/eligibileshift",
  auth,
  requirePermission("shiftSwap", "create"),
  fetchedEligibleSwapWorkerValidation,
  fetchSwapEligibleWorker,
);

export default router;
