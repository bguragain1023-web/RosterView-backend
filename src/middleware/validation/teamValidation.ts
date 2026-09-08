import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../utlis/AppError";
import mongoose from "mongoose";

export const createTeamValidation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, description } = req.body;

  const allowedFields = ["name", "description"];
  const requestedFields = Object.keys(req.body);

  const hasUnexpectedFields = requestedFields.some(
    (fields) => !allowedFields.includes(fields),
  );

  if (hasUnexpectedFields) {
    throw new AppError("Unexpected field(s) expected", 400);
  }

  if (typeof name !== "string" || !name.trim()) {
    throw new AppError("Name is required and It should be string", 400);
  }

  if (description !== undefined && typeof description !== "string") {
    throw new AppError("Description must be string", 400);
  }

  next();
};

export const assignTeamValidation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("🔥 VALIDATION HIT");
  const { teamId, userId } = req.body;
  console.log(teamId, userId);

  if (typeof teamId !== "string" || !mongoose.isValidObjectId(teamId)) {
    throw new AppError("teamId is not valid", 400);
  }

  if (typeof userId !== "string" || !mongoose.isValidObjectId(userId)) {
    throw new AppError("teamId is not valid", 400);
  }

  console.log("validation completed");

  next();
};
