import type { NextFunction, Request, Response } from "express";
import {
  addTeam,
  getActiveTeams,
  getAllTeams,
  getTeamById,
  getTeamByName,
} from "../models/team/teamModel";
import { AppError } from "../utlis/AppError";
import { normalize } from "node:path";
import { getRoleById } from "../models/role/roleModel";

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
