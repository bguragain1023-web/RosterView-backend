import type { NextFunction, Request, Response } from "express";
import { addTeam, getAllTeams, getTeamByName } from "../models/team/teamModel";
import { AppError } from "../utlis/AppError";
import { normalize } from "node:path";

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
