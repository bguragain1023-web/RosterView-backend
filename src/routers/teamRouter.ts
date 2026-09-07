import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import { createTeamValidation } from "../middleware/validation/teamValidation";
import {
  createTeam,
  fetchAllTeams,
  getSingleTeam,
} from "../controllers/teamController";

const router = express.Router();

router.post(
  "/createteam",
  auth,
  requirePermission("team", "create"),
  createTeamValidation,
  createTeam,
);

router.get("/getteams", auth, requirePermission("team", "read"), fetchAllTeams);

router.get("/:teamId", auth, requirePermission("team", "read"), getSingleTeam);

export default router;
