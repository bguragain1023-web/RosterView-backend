import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utlis/AppError";
import { getShiftById, getTargetShifts } from "../models/shift/shiftModel";
import { addSwaprequest } from "../models/shift/shiftSwapModel";

export const fetchSwapEligibleWorker = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { requestedshiftId, targetedDate } = req.body;
    if (!req.userInfo)
      throw new AppError("Not authorized to request swapShift", 404);
    const { _id } = req.userInfo;

    const requestedShift = await getShiftById(requestedshiftId);
    if (!requestedShift) throw new AppError("Shift doesn't exist", 404);

    if (
      !requestedShift.workerId ||
      requestedShift.workerId.toString() !== _id.toString()
    ) {
      throw new AppError("You can only request a swap for your own shift", 403);
    }

    const requestedDate = requestedShift.date.toISOString().split("T")[0];
    if (!requestedDate)
      throw new AppError("Shift date could not be determined", 400);

    const requestedDateObj = new Date(`${requestedDate}T00:00:00`);

    const targetedDateObj = new Date(`${targetedDate}T00:00:00`);

    const maxDate = new Date(requestedDateObj);
    maxDate.setDate(maxDate.getDate() + 15);

    if (targetedDateObj < requestedDateObj) {
      throw new AppError("Shift date cannot be in the past", 400);
    }

    if (targetedDateObj > maxDate) {
      throw new AppError(
        "Cannot swap a shift for more than 15 days difference",
        400,
      );
    }

    const result = await getTargetShifts(
      _id.toString(),
      requestedDate,
      targetedDate,
    );

    res.json({
      status: "success",
      message:
        result.length === 0
          ? "No Eligible Shifts found"
          : "Eligible Shifts fetched",
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const createSwapShift = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { requestedShiftId, targetedShiftId } = req.body;
  if (!req.userInfo) throw new AppError("Unauthorized", 401);

  const { _id } = req.userInfo;

  const requestedShift = await getShiftById(requestedShiftId);
  const targetedShift = await getShiftById(targetedShiftId);

  if (!requestedShift) throw new AppError("Shift Doesn't exist", 404);

  if (!requestedShift.workerId)
    throw new AppError("Requested shift must be assigned to a worker", 400);

  if (requestedShift.workerId.toString() !== _id.toString()) {
    throw new AppError("Requested shift must belong to you", 403);
  }

  if (!targetedShift) throw new AppError("Shift doesn't exist", 404);
  if (!targetedShift.workerId)
    throw new AppError("This shift doesn't have worker assigned", 400);

  if (targetedShift.workerId.toString() === _id.toString()) {
    throw new AppError("You cannot request a swap with your own shift", 400);
  }

  const swapRequestObj = {
    requestedShiftId,
    targetedShiftId,
    requestedBy: _id,
    requestedTo: targetedShift.workerId,
  };

  const swapRequest = await addSwaprequest(swapRequestObj);

  if (!swapRequest)
    throw new AppError(
      "something went wrong while creating a swap request, try again later",
      500,
    );

  res.json({
    status: "success",
    message: " Swap request created successfully",
    swapRequest,
  });
};
