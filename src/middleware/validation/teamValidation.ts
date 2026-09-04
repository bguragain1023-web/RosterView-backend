import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../utlis/AppError";

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
