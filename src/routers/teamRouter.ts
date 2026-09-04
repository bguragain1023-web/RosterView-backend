import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import { createTeamValidation } from "../middleware/validation/teamValidation";
import { createTeam } from "../controllers/teamController";

const router = express.Router();

router.post(
  "/createteam",
  auth,
  requirePermission("team", "create"),
  createTeamValidation,
  createTeam,
);

export default router;
