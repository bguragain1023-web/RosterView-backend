import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import { createTeamValidation } from "../middleware/validation/teamValidation";
import { createTeam, fetchAllTeams } from "../controllers/teamController";

const router = express.Router();

router.post(
  "/createteam",
  auth,
  requirePermission("team", "create"),
  createTeamValidation,
  createTeam,
);

router.get("/getteams", auth, requirePermission("team", "read"), fetchAllTeams);

export default router;
