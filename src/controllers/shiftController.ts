import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utlis/AppError";
import {
  calculateTotalHours,
  calculateWeeklyHours,
  hasShiftConflict,
} from "../helper/calculation";
import {
  addNewShift,
  cancelShiftById,
  deleteManyShifts,
  getAllShifts,
  getShiftById,
  reinstateShiftById,
  updateShiftById,
} from "../models/shift/shiftModel";
import { ShiftStatus } from "../models/shift/shiftSchema";
import { getUserById } from "../models/user/userModel";
import { getClientById } from "../models/client/clientModel";
import { getRoleById } from "../models/role/roleModel";
import { checkWorkerAvailability } from "../helper/checkAvailibility";
import { getApprovedLeaveOnDate } from "../models/user/leaveRequestModel";
import { DATE_ONLY_REGEX, toUtcMidnight } from "../helper/dateOnly";

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

    let weeklyHoursAfter = 0;
    let overtimeHours = 0;
    let normalHours = 0;

    if (workerId) {
      const isAvailable = await checkWorkerAvailability(workerId, date);
      if (!isAvailable) {
        throw new AppError("The worker is not available on this day", 400);
      }

      const approvedLeave = await getApprovedLeaveOnDate(
        workerId,
        toUtcMidnight(date),
      );

      if (approvedLeave) {
        throw new AppError("The worker is on approved leave on this day", 400);
      }

      const hasConflict = await hasShiftConflict(
        workerId,
        date,
        startTime,
        endTime,
      );

      if (hasConflict) {
        throw new AppError(
          "The worker already has a shift during this time",
          409,
        );
      }

      const weeklyHoursBefore = await calculateWeeklyHours(workerId, date);

      weeklyHoursAfter = weeklyHoursBefore + totalHours;

      overtimeHours = Math.max(0, weeklyHoursAfter - 38);

      normalHours = Math.min(weeklyHoursAfter, 38);
    }
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
      weeklyHours: weeklyHoursAfter,
      normalHours,
      overtimeHours,
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
    // Optional ?from=YYYY-MM-DD&to=YYYY-MM-DD (both inclusive)
    const parseDate = (value: unknown, name: string) => {
      if (value === undefined) return undefined;
      if (typeof value !== "string" || !DATE_ONLY_REGEX.test(value)) {
        throw new AppError(`${name} must be YYYY-MM-DD`, 400);
      }
      return toUtcMidnight(value);
    };
    const from = parseDate(req.query.from, "from");
    const to = parseDate(req.query.to, "to");

    const allShifts = await getAllShifts({
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    });
    res.json({
      status: "success",
      message: "All shifts fetched successfully",
      allShifts,
    });
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
      throw new AppError("Shift doesn't exist", 404);
    }

    res.json({
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

    // Editing would otherwise reset the status below and bring these back.
    if (shiftToUpdate.status === "cancelled") {
      throw new AppError(
        "Cancelled shifts can't be edited. Reinstate it first.",
        409,
      );
    }
    if (shiftToUpdate.status === "completed") {
      throw new AppError("Completed shifts can't be edited", 409);
    }

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
    // workerId: null means "unassign this shift"
    if (workerId !== undefined && workerId !== null) {
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

    const finalDate = date === undefined ? shiftToUpdate.date : date;

    if (finalWorker && (workerId !== undefined || date !== undefined)) {
      const approvedLeave = await getApprovedLeaveOnDate(
        finalWorker.toString(),
        toUtcMidnight(finalDate),
      );

      if (approvedLeave) {
        throw new AppError("The worker is on approved leave on this day", 400);
      }
    }

    if (finalWorker && (workerId !== undefined || date !== undefined)) {
      const isAvailable = await checkWorkerAvailability(
        finalWorker.toString(),
        finalDate,
      );

      if (!isAvailable) {
        throw new AppError("Worker is not available on this day", 400);
      }
    }

    let weeklyHoursAfter = 0;
    let overtimeHours = 0;
    let normalHours = 0;

    if (finalWorker) {
      const finalStartTime =
        startTime === undefined ? shiftToUpdate.startTime : startTime;

      const finalEndTime =
        endTime === undefined ? shiftToUpdate.endTime : endTime;

      const hasConflict = await hasShiftConflict(
        finalWorker.toString(),
        finalDate,
        finalStartTime,
        finalEndTime,
        id,
      );

      if (hasConflict) {
        throw new AppError(
          "The worker already has a shift during this time",
          409,
        );
      }

      // Exclude this shift by id, so its old hours are only removed when it
      // was actually counted in this worker's week.
      const weeklyHoursWithoutCurrentShift = await calculateWeeklyHours(
        finalWorker.toString(),
        finalDate,
        id,
      );

      weeklyHoursAfter = weeklyHoursWithoutCurrentShift + totalHours;

      overtimeHours = Math.max(0, weeklyHoursAfter - 38);

      normalHours = Math.min(weeklyHoursAfter, 38);
    }

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
    };

    const result = await updateShiftById(id, createObj);
    if (result.matchedCount === 0) throw new AppError("Shift not found", 404);

    res.json({
      status: "success",
      message: "shift has been modified",
      weeklyHours: weeklyHoursAfter,
      normalHours,
      overtimeHours,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelShift = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) throw new AppError("Unauthorized", 401);
    const id = req.params.id as string;

    const { reason } = req.body ?? {};
    if (reason !== undefined && typeof reason !== "string") {
      throw new AppError("Reason must be text", 400);
    }
    if (typeof reason === "string" && reason.length > 500) {
      throw new AppError("Reason must be 500 characters or fewer", 400);
    }

    const shift = await getShiftById(id);
    if (!shift) throw new AppError("Shift doesn't exist", 404);
    if (shift.status !== "assigned" && shift.status !== "unassigned") {
      throw new AppError(
        `Only active shifts can be cancelled (this one is ${shift.status})`,
        409,
      );
    }

    const cancelled = await cancelShiftById(
      id,
      req.userInfo._id,
      (reason ?? "").trim(),
    );
    if (!cancelled) {
      throw new AppError("Shift changed meanwhile, please try again", 409);
    }

    res.json({ status: "success", message: "Shift cancelled", shift: cancelled });
  } catch (error) {
    next(error);
  }
};

// Body: { unassign?: boolean } - reinstate without the worker, e.g. when
// they're no longer free at that time.
export const reinstateShift = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const unassign = req.body?.unassign === true;

    const shift = await getShiftById(id);
    if (!shift) throw new AppError("Shift doesn't exist", 404);
    if (shift.status !== "cancelled") {
      throw new AppError("Only cancelled shifts can be reinstated", 409);
    }

    const workerId = unassign ? null : shift.workerId;
    const tryUnassigned = " Tick 'Reinstate without a worker' to reinstate it unassigned.";

    // The worker's week may have changed while the shift was cancelled.
    if (workerId) {
      const worker = await getUserById(workerId.toString());
      if (!worker || worker.status !== "active") {
        throw new AppError(
          "The worker on this shift is no longer active." + tryUnassigned,
          409,
        );
      }

      const onLeave = await getApprovedLeaveOnDate(
        workerId.toString(),
        toUtcMidnight(shift.date),
      );
      if (onLeave) {
        throw new AppError(
          `${worker.name} is on approved leave that day.` + tryUnassigned,
          409,
        );
      }

      const isAvailable = await checkWorkerAvailability(
        workerId.toString(),
        shift.date,
      );
      if (!isAvailable) {
        throw new AppError(
          `${worker.name} is not available that day.` + tryUnassigned,
          409,
        );
      }

      const hasConflict = await hasShiftConflict(
        workerId.toString(),
        shift.date,
        shift.startTime,
        shift.endTime,
        id,
      );
      if (hasConflict) {
        throw new AppError(
          `${worker.name} now has another shift at that time.` + tryUnassigned,
          409,
        );
      }
    }

    const reinstated = await reinstateShiftById(id, {
      status: workerId ? "assigned" : "unassigned",
      workerId,
    });
    if (!reinstated) {
      throw new AppError("Shift changed meanwhile, please try again", 409);
    }

    res.json({
      status: "success",
      message: "Shift reinstated",
      shift: reinstated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteShift = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shiftIds } = req.body;
    const result = await deleteManyShifts(shiftIds);
    if (result.deletedCount !== shiftIds.length) {
      throw new AppError("One or more shifts don't exist", 404);
    }

    res.json({
      status: "success",
      message: `${result.deletedCount} item deleted`,
    });
  } catch (error) {
    next(error);
  }
};
