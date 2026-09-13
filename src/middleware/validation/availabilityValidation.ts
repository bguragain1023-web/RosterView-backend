import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utlis/AppError";
import mongoose from "mongoose";

export const createAvailabilityValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { type, dayOfWeek, date, status } = req.body;

  // Validate type
  if (
    typeof type !== "string" ||
    (type !== "recurring" && type !== "specific")
  ) {
    throw new AppError("Type must be recurring or specific", 400);
  }

  // Validate status
  if (
    typeof status !== "string" ||
    (status !== "available" && status !== "unavailable")
  ) {
    throw new AppError("Status must be available or unavailable", 400);
  }

  // Recurring availability
  if (type === "recurring") {
    if (dayOfWeek === undefined) {
      throw new AppError(
        "Day of the week is required for recurring availability",
        400,
      );
    }

    if (
      typeof dayOfWeek !== "number" ||
      !Number.isInteger(dayOfWeek) ||
      dayOfWeek < 0 ||
      dayOfWeek > 6
    ) {
      throw new AppError(
        "Day of the week must be an integer between 0 and 6",
        400,
      );
    }

    if (date !== undefined) {
      throw new AppError(
        "Date should not be provided for recurring availability",
        400,
      );
    }
  }

  // Specific availability
  if (type === "specific") {
    if (date === undefined) {
      throw new AppError("Date is required for specific availability", 400);
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new AppError("Date is not valid", 400);
    }

    if (dayOfWeek !== undefined) {
      throw new AppError(
        "Day of the week should not be provided for specific availability",
        400,
      );
    }
  }

  next();
};

export const updateAvailabilityValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { availabilityId } = req.params;
    const { status } = req.body;

    if (!availabilityId || Array.isArray(availabilityId)) {
      throw new AppError("Availability ID is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(availabilityId)) {
      throw new AppError("Invalid availability ID", 400);
    }

    if (
      typeof status !== "string" ||
      (status !== "available" && status !== "unavailable")
    ) {
      throw new AppError("Status must be available or unavailable", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};
