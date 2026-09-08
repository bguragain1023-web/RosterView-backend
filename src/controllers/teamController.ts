import type { NextFunction, Request, Response } from "express";
import {
  addTeam,
  assignLeader,
  getActiveTeamById,
  getActiveTeams,
  getAllTeams,
  getTeamById,
  getTeamByName,
} from "../models/team/teamModel";
import { AppError } from "../utlis/AppError";
import { getRoleById } from "../models/role/roleModel";
import { getUserById, updateUserDetailById } from "../models/user/userModel";

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

    if (role.name === "admin") {
      const allTeams = await getAllTeams();
      return res.json({
        status: "success",
        message:
          allTeams.length === 0
            ? "No teams available now "
            : " Team fetched successfully",
        allTeams,
      });
    }

    if (role.name === "coordinator") {
      const activeTeams = await getActiveTeams();
      return res.json({
        status: "success",
        message:
          activeTeams.length === 0
            ? "No teams available now "
            : " Team fetched successfully",
        activeTeams,
      });
    }

    if (role.name === "teamLeader" || role.name === "worker") {
      if (!teamId) {
        throw new AppError("you are not assigned to team yet", 401);
      }
      const ownTeam = await getTeamById(teamId.toString());
      if (!ownTeam) {
        throw new AppError("You are not assigned to any Team yet", 401);
      }
      return res.json({
        status: "success",
        message: "Team fetched ",
        ownTeam,
      });
    }
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

    if (role.name === "coordinator") {
      const activeTeam = await getActiveTeamById(teamId);
      if (!activeTeam) {
        throw new AppError(" Team doesn't exist or not active", 404);
      }

      return res.json({
        status: "success",
        message: "Requested Team found",
        activeTeam,
      });
    }
    const team = await getTeamById(teamId);

    if (!team) {
      throw new AppError("Team doesn't exist", 400);
    }

    res.status(200).json({
      status: "success",
      message: "Requested Team found",
      team,
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
