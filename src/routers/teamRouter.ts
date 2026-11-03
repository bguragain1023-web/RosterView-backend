import express from "express";
import { auth } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/permissionMiddleware";
import {
  assignTeamValidation,
  createTeamValidation,
  teamMemberParamsValidation,
  updateTeamValidation,
} from "../middleware/validation/teamValidation";
import {
  assignTeamLeader,
  assignWorkerTeam,
  createTeam,
  fetchAllTeams,
  getSingleTeam,
  removeTeamMember,
  updateTeam,
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
  assignTeamValidation,
  assignTeamLeader,
);

//assign team to worker

router.patch(
  "/assignworkerteam",
  auth,
  requirePermission("team", "create"),
  assignTeamValidation,
  assignWorkerTeam,
);

// update team. Keep last so "/assignteamleader" and "/assignworkerteam" match first.
router.patch(
  "/:teamId",
  auth,
  requirePermission("team", "update"),
  updateTeamValidation,
  updateTeam,
);

// remove a member from a team
router.delete(
  "/:teamId/members/:userId",
  auth,
  requirePermission("team", "update"),
  teamMemberParamsValidation,
  removeTeamMember,
);

export default router;
