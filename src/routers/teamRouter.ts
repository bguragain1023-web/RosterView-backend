import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import {
  assignTeamValidation,
  createTeamValidation,
} from "../middleware/validation/teamValidation";
import {
  assignTeamLeader,
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

router.get(
  "/:teamId",
  auth,
  requirePermission("team", "read"),

  getSingleTeam,
);

router.patch(
  "/assignteamleader",
  auth,
  requirePermission("team", "create"),

  (req, res, next) => {
    console.log("🔥 permission passed");
    next();
  },
  assignTeamValidation,
  assignTeamLeader,
);

export default router;
