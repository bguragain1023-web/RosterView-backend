import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import {
  assignTeamValidation,
  createTeamValidation,
} from "../middleware/validation/teamValidation";
import {
  assignTeamLeader,
  assignWorkerTeam,
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

//assign teamleader

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

//assign team to worker

router.patch(
  "/assignworkerteam",
  auth,
  requirePermission("team", "create"),

  (req, res, next) => {
    console.log("🔥 permission passed");
    next();
  },
  assignTeamValidation,
  assignWorkerTeam,
);

export default router;
