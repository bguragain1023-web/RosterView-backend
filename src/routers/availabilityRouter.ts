import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import { createAvailabilityValidation } from "../middleware/validation/availabilityValidation";
import {
  createAvailability,
  getAllAvailability,
} from "../controllers/availabilityController";

const router = express.Router();

router.post(
  "/addavailability",
  (req, res, next) => {
    console.log("authStarted");
    next();
  },
  auth,
  (req, res, next) => {
    console.log("authPassed");
    next();
  },
  requirePermission("availability", "update"),
  createAvailabilityValidation,
  createAvailability,
);

router.get(
  "/getallavailability",
  auth,
  requirePermission("availability", "read"),
  getAllAvailability,
);

export default router;
