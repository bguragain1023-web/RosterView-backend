import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utlis/AppError";
import {
  AddAvailabilityPayload,
  addAvailabilty,
} from "../models/user/availabilityModel";

export const createAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("unauthorized", 401);
    }
    const workerId = req.userInfo._id;
    const { type, dayOfWeek, date, status } = req.body;
    let availabilityObj: AddAvailabilityPayload;
    if (type === "recurring") {
      if (dayOfWeek === undefined) {
        throw new AppError(
          "Day of the week is required for recurring availabilty",
          400,
        );
      }
      availabilityObj = {
        workerId,
        dayOfWeek,
        status,
        type,
      };
    } else if (type === "specific") {
      if (!date) {
        throw new AppError(
          "Date is required for specific date availability",
          400,
        );
      }

      availabilityObj = {
        workerId,
        date,
        status,
        type,
      };
    } else {
      throw new AppError("Invalid availability type", 400);
    }
    const result = await addAvailabilty(availabilityObj);
    if (!result) {
      throw new AppError(
        "Something went wrong while saving the availability",
        500,
      );
    }
    res.json({
      status: "success",
      message: "Availability added",
    });
  } catch (error) {
    next(error);
  }
};
