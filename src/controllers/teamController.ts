import type { NextFunction, Request, Response } from "express";
import {
  addTeam,
  assignLeader,
  getActiveTeamById,
  getActiveTeams,
  getAllTeams,
  getTeamById,
  getTeamByLeaderId,
  getTeamByName,
  updateTeamById,
  type TeamUpdate,
} from "../models/team/teamModel";
import { AppError } from "../utlis/AppError";
import { getRoleById } from "../models/role/roleModel";
import {
  clearUserTeam,
  getTeamMembers,
  getUserById,
  updateUserDetailById,
} from "../models/user/userModel";

export const createTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, description } = req.body;
    const teamName = name.trim();
    const existingTeam = await getTeamByName(teamName);

    if (existingTeam) {
      throw new AppError("Team name already existed", 409);
    }

    const teamObj = {
      name: teamName,
      normalizedName: teamName.toLowerCase(),
      description,
    };

    const team = await addTeam(teamObj);

    if (!team) {
      throw new AppError(
        "Something went wrong while creating team. Try again later!!",
        500,
      );
    }

    res.status(201).json({
      status: "success",
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAllTeams = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 403);
    }

    const { roleId, teamId } = req.userInfo;

    const role = await getRoleById(roleId.toString());

    if (!role) {
      throw new AppError("User Role not found", 403);
    }

    let teams = [];

    if (role.name === "admin") {
      teams = await getAllTeams();
    } else if (role.name === "coordinator") {
      teams = await getActiveTeams();
    } else if (role.name === "teamLeader" || role.name === "worker") {
      if (!teamId) {
        throw new AppError("You are not assigned to a team yet", 403);
      }
      const ownTeam = await getTeamById(teamId.toString());

      if (!ownTeam) {
        throw new AppError("Team not found", 404);
      }

      teams = [ownTeam];
    } else {
      throw new AppError("Role is not permitted to access teams", 403);
    }

    return res.json({
      status: "success",
      message:
        teams.length === 0
          ? "No teams available"
          : "Teams fetched successfully",
      teams,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleTeam = async (
  req: Request<{ teamId: string }, {}, {}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 401);
    }

    const user = req.userInfo;
    const { teamId } = req.params;
    const role = await getRoleById(user.roleId.toString());
    if (!role) {
      throw new AppError("User Role not found", 404);
    }

    if (role.name === "worker" || role.name === "teamLeader") {
      if (!user.teamId) {
        throw new AppError("you are not assigned to any team", 400);
      }
      if (user.teamId.toString() !== teamId) {
        throw new AppError(
          "Permission Denied!! you can only view your team",
          403,
        );
      }
    }

    // Coordinators only see active teams.
    const team =
      role.name === "coordinator"
        ? await getActiveTeamById(teamId)
        : await getTeamById(teamId);

    if (!team) {
      throw new AppError(
        role.name === "coordinator"
          ? "Team doesn't exist or not active"
          : "Team doesn't exist",
        404,
      );
    }

    const [leader, members] = await Promise.all([
      team.teamLeaderId ? getUserById(team.teamLeaderId.toString()) : null,
      getTeamMembers(teamId),
    ]);

    res.json({
      status: "success",
      message: "Requested Team found",
      team: {
        ...team.toObject(),
        teamLeader: leader ? { _id: leader._id, name: leader.name } : null,
        members: members.map((m) => ({
          _id: m._id,
          name: m.name,
          role: m.roleId?.name ?? null,
          status: m.status,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /teams/:teamId  { name?, description?, isActive?, teamLeaderId? }
// teamLeaderId: a user id, or null to remove the leader.
export const updateTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const teamId = req.params.teamId as string;
    const team = await getTeamById(teamId);
    if (!team) throw new AppError("Team doesn't exist", 404);

    const { name, description, isActive, teamLeaderId } = req.body;
    const update: TeamUpdate = {};

    if (name !== undefined) {
      const trimmed = name.trim();
      if (trimmed.toLowerCase() !== team.normalizedName) {
        const existing = await getTeamByName(trimmed);
        if (existing && existing._id.toString() !== teamId) {
          throw new AppError("A team with that name already exists", 409);
        }
      }
      update.name = trimmed;
      update.normalizedName = trimmed.toLowerCase();
    }
    if (description !== undefined) update.description = description.trim();
    if (isActive !== undefined) update.isActive = isActive;

    // Leader change. Keep both sides in sync: team.teamLeaderId (used by
    // leave review) and user.teamId (used by availability and swaps).
    const oldLeaderId = team.teamLeaderId?.toString() ?? null;
    const newLeaderId: string | null | undefined = teamLeaderId;
    const leaderChanging =
      newLeaderId !== undefined && newLeaderId !== oldLeaderId;

    if (leaderChanging && newLeaderId) {
      const newLeader = await getUserById(newLeaderId);
      if (!newLeader) throw new AppError("User not found", 404);
      if (newLeader.status !== "active") {
        throw new AppError(`${newLeader.name} is not active`, 409);
      }

      const role = await getRoleById(newLeader.roleId.toString());
      if (role?.name !== "teamLeader") {
        throw new AppError("The new leader must have the Team Leader role", 400);
      }

      const leading = await getTeamByLeaderId(newLeaderId);
      if (leading && leading._id.toString() !== teamId) {
        throw new AppError(
          `${newLeader.name} already leads ${leading.name}`,
          409,
        );
      }
      if (newLeader.teamId && newLeader.teamId.toString() !== teamId) {
        throw new AppError(
          `${newLeader.name} already belongs to another team`,
          409,
        );
      }
    }
    if (leaderChanging) update.teamLeaderId = newLeaderId;

    const updated = await updateTeamById(teamId, update);
    if (!updated) throw new AppError("Team doesn't exist", 404);

    if (leaderChanging) {
      if (oldLeaderId) await clearUserTeam(oldLeaderId);
      if (newLeaderId) await updateUserDetailById(newLeaderId, { teamId });
    }

    res.json({ status: "success", message: "Team updated", team: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /teams/:teamId/members/:userId
export const removeTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const teamId = req.params.teamId as string;
    const userId = req.params.userId as string;

    const team = await getTeamById(teamId);
    if (!team) throw new AppError("Team doesn't exist", 404);

    const user = await getUserById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (user.teamId?.toString() !== teamId) {
      throw new AppError(`${user.name} isn't in ${team.name}`, 409);
    }

    // The leader is changed in Edit team, so team.teamLeaderId and the
    // user's teamId stay in sync.
    if (team.teamLeaderId?.toString() === userId) {
      throw new AppError(
        `${user.name} leads this team. Change or remove the leader in Edit team first.`,
        409,
      );
    }

    await clearUserTeam(userId);

    res.json({
      status: "success",
      message: `${user.name} removed from ${team.name}`,
    });
  } catch (error) {
    next(error);
  }
};

export const assignTeamLeader = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { teamId, userId } = req.body;

    const team = await getTeamById(teamId);
    if (!team) {
      throw new AppError("Team not found", 404);
    }

    if (team.teamLeaderId) {
      throw new AppError("Teamleader already existed in this team", 409);
    }

    if (!team.isActive) {
      throw new AppError("Selected team is not active", 409);
    }

    const user = await getUserById(userId);
    if (!user) {
      throw new AppError("User not found!!", 404);
    }
    if (user.teamId) {
      throw new AppError("This user has team assigned already ", 409);
    }

    const role = await getRoleById(user.roleId.toString());
    if (!role) {
      throw new AppError("Role doesn't exist", 404);
    }

    if (role.name !== "teamLeader") {
      throw new AppError("User role must be Team leader", 400);
    }

    const updateTeam = await assignLeader(teamId, userId);

    if (!updateTeam) {
      throw new AppError("Something went wrong. Please try again later!!", 500);
    }

    const updateUser = await updateUserDetailById(userId, { teamId });
    if (updateUser.matchedCount === 0) {
      throw new AppError("User not found ", 404);
    }

    res.json({
      status: "success",
      message: "Team Leader assigned",
    });
  } catch (error) {
    next(error);
  }
};

export const assignWorkerTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { teamId, userId } = req.body;

    const team = await getTeamById(teamId);
    if (!team) {
      throw new AppError("Team not found", 404);
    }

    if (!team.isActive) {
      throw new AppError("Selected team is not active", 400);
    }

    const user = await getUserById(userId);
    if (!user) {
      throw new AppError("User not found!!", 404);
    }
    if (user.teamId) {
      throw new AppError("This user has team assigned already ", 409);
    }

    if (user.status !== "active") {
      throw new AppError("user must be active", 409);
    }
    const role = await getRoleById(user.roleId.toString());
    if (!role) {
      throw new AppError("ROle not found", 404);
    }
    if (role.name !== "worker") {
      throw new AppError("User Role must be worker", 400);
    }

    const updateUser = await updateUserDetailById(userId, { teamId });
    if (updateUser.matchedCount === 0) {
      throw new AppError("User not found ", 404);
    }

    res.json({
      status: "success",
      message: "User has assigned to a team",
    });
  } catch (error) {
    next(error);
  }
};
