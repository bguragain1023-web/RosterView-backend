import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utlis/AppError";
import { calculateTotalHours } from "../helper/calculation";
import {
  addNewShift,
  getAllShifts,
  getShiftById,
} from "../models/shift/shiftModel";
import { ShiftStatus } from "../models/shift/shiftSchema";

export const createShift = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      workerId,
      clientId,
      location,
      date,
      startTime,
      endTime,
      breakMinutes,
      notes,
    } = req.body;
    if (!req.userInfo) throw new AppError("Unauthorized", 401);
    const createdBy = req.userInfo._id;
    const totalHours = calculateTotalHours(startTime, endTime, breakMinutes);
    const status: ShiftStatus = workerId ? "assigned" : "unassigned";

    const shiftObj = {
      workerId,
      clientId,
      location,
      date,
      startTime,
      endTime,
      breakMinutes,
      totalHours,
      status,
      notes,
      createdBy,
    };

    const shift = await addNewShift(shiftObj);
    res.json({
      status: "success",
      message: "New shift created successfully",
      shift,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAllShifts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const allShifts = await getAllShifts();
    if (allShifts) {
      res.json({
        status: "successs",
        message: " All shift fetched successfully",
        allShifts,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getSingleShift = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const shift = await getShiftById(id);

    if (!shift) {
      throw new AppError("Shift doesn't exist", 400);
    }

    res.status(201).json({
      status: "success",
      message: "Shift detail fetched successfully",
      shift,
    });
  } catch (error) {
    next(error);
  }
};
