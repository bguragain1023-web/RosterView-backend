import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utlis/AppError";
import { calculateTotalHours } from "../helper/calculation";
import {
  addNewShift,
  getAllShifts,
  getShiftById,
  updateShiftById,
} from "../models/shift/shiftModel";
import { ShiftStatus } from "../models/shift/shiftSchema";
import { getUserById } from "../models/user/userModel";
import { getClientById } from "../models/client/clientModel";
import { getRoleById } from "../models/role/roleModel";

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

export const updateShift = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) throw new AppError("Unauthorized", 401);
    const id = req.params.id as string;
    const shiftToUpdate = await getShiftById(id);
    if (!shiftToUpdate) throw new AppError("shift doesn't exist", 404);

    const {
      workerId,
      clientId,
      location,
      startTime,
      endTime,
      date,
      breakMinutes,
      notes,
    } = req.body;
    if (workerId !== undefined) {
      const existWorker = await getUserById(workerId);
      if (!existWorker) throw new AppError("worker doesn't exist", 400);
      if (existWorker.status !== "active")
        throw new AppError("This worker is not active right now", 400);
      const workerRole = await getRoleById(existWorker.roleId.toString());
      if (!workerRole) throw new AppError("worker role not found", 404);
      if (workerRole.name !== "worker")
        throw new AppError("Only worker should be assigned to a shift", 400);
    }

    if (clientId !== undefined) {
      const existClient = await getClientById(clientId);
      if (!existClient) throw new AppError("Client doesn't exist", 400);
      if (!existClient.isActive)
        throw new AppError("Client is not avtive anymore", 400);
    }

    const totalHours = calculateTotalHours(
      startTime === undefined ? shiftToUpdate.startTime : startTime,
      endTime === undefined ? shiftToUpdate.endTime : endTime,
      breakMinutes === undefined ? shiftToUpdate.breakMinutes : breakMinutes,
    );
    const finalWorker =
      workerId === undefined ? shiftToUpdate.workerId : workerId;
    const status: ShiftStatus = finalWorker ? "assigned" : "unassigned";

    const createObj = {
      workerId: finalWorker,
      clientId: clientId === undefined ? shiftToUpdate.clientId : clientId,
      location: location === undefined ? shiftToUpdate.location : location,
      startTime: startTime === undefined ? shiftToUpdate.startTime : startTime,
      endTime: endTime === undefined ? shiftToUpdate.endTime : endTime,
      date: date === undefined ? shiftToUpdate.date : date,
      breakMinutes:
        breakMinutes === undefined ? shiftToUpdate.breakMinutes : breakMinutes,
      notes: notes === undefined ? shiftToUpdate.notes : notes,
      status,
      totalHours,
      createdBy: req.userInfo._id,
    };

    const result = await updateShiftById(id, createObj);
    if (result.matchedCount === 0) throw new AppError("Shift not found", 404);

    res.json({
      status: "success",
      message: "shift has been modified",
    });
  } catch (error) {
    next(error);
  }
};
