import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import {
  createAvailabilityValidation,
  deleteAvailabilityValidation,
  updateAvailabilityValidation,
} from "../middleware/validation/availabilityValidation";
import {
  createAvailability,
  deleteAvailability,
  getAllAvailability,
  updateAvailability,
} from "../controllers/availabilityController";

const router = express.Router();

router.post(
  "/addavailability",
  auth,
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
  requirePermission("availability", "update"),
  updateAvailabilityValidation,
  updateAvailability,
);

// delete availability

router.delete(
  "/:availabilityId",
  auth,
  requirePermission("availability", "update"),
  deleteAvailabilityValidation,
  deleteAvailability,
);

export default router;
