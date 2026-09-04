import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../utlis/AppError";
import mongoose from "mongoose";

export const fetchedEligibleSwapWorkerValidation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (Object.keys(req.body).length === 0)
    throw new AppError("Requesting Boy is empty", 400);
  const { requestedShiftId, targetedDate } = req.body;
  if (!requestedShiftId || !targetedDate)
    throw new AppError("Both shift and swap date is required", 400);

  if (
    typeof requestedShiftId !== "string" ||
    !mongoose.isValidObjectId(requestedShiftId)
  )
    throw new AppError(" Invalid shift Id", 400);

  if (typeof targetedDate !== "string") {
    throw new AppError("Date must be a string", 400);
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(targetedDate)) {
    throw new AppError("Date must be in YYYY-MM-DD format", 400);
  }

  const [year, month, day] = targetedDate.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    throw new AppError("Invalid date", 400);
  }

  const dateObj = new Date(year, month - 1, day);

  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    throw new AppError("Please provide a valid date", 400);
  }

  next();
};

export const createShiftSwapValidation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (Object.keys(req.body).length === 0) {
    throw new AppError("Requesting body is empty", 400);
  }

  const { requestedShiftId, targetedShiftId } = req.body;

  if (
    typeof requestedShiftId !== "string" ||
    !mongoose.isValidObjectId(requestedShiftId)
  ) {
    throw new AppError("Invalid Requested shift Id ", 400);
  }

  if (
    typeof targetedShiftId !== "string" ||
    !mongoose.isValidObjectId(targetedShiftId)
  ) {
    throw new AppError("Invalid targeted ShiftId", 400);
  }
  next();
};
