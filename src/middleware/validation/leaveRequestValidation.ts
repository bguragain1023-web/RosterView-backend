import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utlis/AppError";

export const createLeaveRequestValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { startDate, endDate, type, reason } = req.body;

    if (!startDate) {
      throw new AppError("Start date is required", 400);
    }

    const parsedStartDate = new Date(startDate);

    if (Number.isNaN(parsedStartDate.getTime())) {
      throw new AppError("Start date is not valid", 400);
    }

    if (!endDate) {
      throw new AppError("End date is required", 400);
    }

    const parsedEndDate = new Date(endDate);

    if (Number.isNaN(parsedEndDate.getTime())) {
      throw new AppError("End date is not valid", 400);
    }

    if (
      typeof type !== "string" ||
      !["annual", "personal", "sick", "unpaid", "other"].includes(type)
    ) {
      throw new AppError(
        "Type must be annual, personal, sick, unpaid or other",
        400,
      );
    }

    if (reason !== undefined && typeof reason !== "string") {
      throw new AppError("Reason must be a string", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};
