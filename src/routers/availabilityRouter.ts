import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import {
  createAvailabilityValidation,
  updateAvailabilityValidation,
} from "../middleware/validation/availabilityValidation";
import {
  createAvailability,
  getAllAvailability,
  updateAvailability,
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

router.patch(
  "/:availabilityId",
  auth,
  (req, res, next) => {
    console.log("authPassed");
    next();
  },
  requirePermission("availability", "update"),
  updateAvailabilityValidation,
  (req, res, next) => {
    console.log("Validation passed");
    next();
  },
  updateAvailability,
);

export default router;
