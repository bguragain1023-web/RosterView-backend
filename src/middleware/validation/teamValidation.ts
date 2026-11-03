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

export const updateTeamValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const teamId = req.params.teamId;
  if (typeof teamId !== "string" || !mongoose.isValidObjectId(teamId)) {
    throw new AppError("Invalid team id", 400);
  }

  const allowedFields = ["name", "description", "isActive", "teamLeaderId"];
  const requestedFields = Object.keys(req.body ?? {});
  if (requestedFields.length === 0) {
    throw new AppError("The requesting body is empty", 400);
  }
  if (requestedFields.some((f) => !allowedFields.includes(f))) {
    throw new AppError("Unexpected field(s) requested for update", 400);
  }

  const { name, description, isActive, teamLeaderId } = req.body;

  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    throw new AppError("Name must be non-empty text", 400);
  }
  if (description !== undefined && typeof description !== "string") {
    throw new AppError("Description must be text", 400);
  }
  if (isActive !== undefined && typeof isActive !== "boolean") {
    throw new AppError("isActive must be true or false", 400);
  }
  if (
    teamLeaderId !== undefined &&
    teamLeaderId !== null &&
    (typeof teamLeaderId !== "string" || !mongoose.isValidObjectId(teamLeaderId))
  ) {
    throw new AppError("Invalid team leader id", 400);
  }

  next();
};

export const teamMemberParamsValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { teamId, userId } = req.params;
  if (typeof teamId !== "string" || !mongoose.isValidObjectId(teamId)) {
    throw new AppError("Invalid team id", 400);
  }
  if (typeof userId !== "string" || !mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user id", 400);
  }
  next();
};

export const assignTeamValidation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { teamId, userId } = req.body;

  if (typeof teamId !== "string" || !mongoose.isValidObjectId(teamId)) {
    throw new AppError("teamId is not valid", 400);
  }

  if (typeof userId !== "string" || !mongoose.isValidObjectId(userId)) {
    throw new AppError("teamId is not valid", 400);
  }


  next();
};
