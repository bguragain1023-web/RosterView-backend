import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utlis/AppError";
import { getClientById } from "../../models/client/clientModel";
import { getUserById } from "../../models/user/userModel";
import { getRoleById } from "../../models/role/roleModel";
import mongoose from "mongoose";
import { getShiftById } from "../../models/shift/shiftModel";

export const createShiftValidation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

  if (!clientId) throw new AppError("Please provide client detail", 400);
  if (typeof clientId !== "string")
    throw new AppError(" client Id must be string", 400);

  if (!mongoose.isValidObjectId(clientId)) {
    throw new AppError("Invalid client ID", 400);
  }

  const hasClient = await getClientById(clientId);
  if (!hasClient) throw new AppError("Client doesn't exist ", 404);
  if (hasClient.isActive === false)
    throw new AppError("The client is not active for our services", 400);

  if (
    workerId !== null &&
    workerId !== undefined &&
    typeof workerId !== "string"
  )
    throw new AppError("WorkerId format is not accepted", 400);

  if (workerId) {
    if (!mongoose.isValidObjectId(workerId)) {
      throw new AppError("Invalid worker ID", 400);
    }
    const hasWorker = await getUserById(workerId);
    if (!hasWorker) throw new AppError("worker not found!", 404);

    if (hasWorker.status === "inactive")
      throw new AppError("please Assign shift to an active worker", 400);

    const role = await getRoleById(hasWorker.roleId.toString());
    if (!role)
      throw new AppError(
        "User role is missing , cannot assign to this worker",
        404,
      );
    if (role.name !== "worker")
      throw new AppError("selected user is not a worker", 400);
  }

  if (!location) throw new AppError("please provide location", 400);
  if (typeof location !== "string")
    throw new AppError("Please provide valid location", 400);

  if (notes) {
    if (typeof notes !== "string") {
      throw new AppError("please provide notes in string format ", 400);
    }
  }

  if (!date) throw new AppError("please provide shift date", 400);

  if (typeof date !== "string") {
    throw new AppError("Date must be a string", 400);
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(date)) {
    throw new AppError("Date must be in YYYY-MM-DD format", 400);
  }

  const [year, month, day] = date.split("-").map(Number);
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 60);

  if (dateObj < today) {
    throw new AppError("Shift date cannot be in the past", 400);
  }

  if (dateObj > maxDate) {
    throw new AppError("Cannot create a shift 2 month ahead", 400);
  }

  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (!startTime) {
    throw new AppError("Please provide start time", 400);
  }

  if (typeof startTime !== "string" || !timeRegex.test(startTime)) {
    throw new AppError("Start time must be in HH:mm format", 400);
  }

  if (!endTime) {
    throw new AppError("Please provide end time", 400);
  }

  if (typeof endTime !== "string" || !timeRegex.test(endTime)) {
    throw new AppError("End time must be in HH:mm format", 400);
  }

  if (breakMinutes !== undefined) {
    if (
      typeof breakMinutes !== "number" ||
      !Number.isInteger(breakMinutes) ||
      breakMinutes < 0
    ) {
      throw new AppError(
        "Break time must be a positive whole number of minutes",
        400,
      );
    }
  }

  next();
};

export const updateShiftValidation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (Object.keys(req.body).length === 0)
    throw new AppError("The requesting body is empty", 400);

  const allowedFields = [
    "workerId",
    "clientId",
    "location",
    "startTime",
    "endTime",
    "date",
    "breakMinutes",
    "notes",
  ];

  const requestedFields = Object.keys(req.body);

  const hasUnexpectedFields = requestedFields.some(
    (fields) => !allowedFields.includes(fields),
  );
  if (hasUnexpectedFields)
    throw new AppError("unexpected field(s) are requested for update ", 400);

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

  console.log("workerid validation start");
  if (workerId !== undefined) {
    if (typeof workerId !== "string" || !mongoose.isValidObjectId(workerId)) {
      throw new AppError("Invalid worker ID", 400);
    }
  }

  console.log("workerid validation passed");

  if (clientId !== undefined) {
    if (typeof clientId !== "string" || !mongoose.isValidObjectId(clientId)) {
      throw new AppError("Invalid client ID", 400);
    }
  }

  if (location !== undefined && typeof location !== "string")
    throw new AppError("location format didn't match ", 400);

  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (
    startTime !== undefined &&
    (typeof startTime !== "string" || !timeRegex.test(startTime))
  ) {
    throw new AppError("startTime format didn't match ", 400);
  }

  if (
    endTime !== undefined &&
    (typeof endTime !== "string" || !timeRegex.test(endTime))
  ) {
    throw new AppError("End time format didn't match ", 400);
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (date !== undefined) {
    if (typeof date !== "string" || !dateRegex.test(date)) {
      throw new AppError("Date must be in YYYY-MM-DD format", 400);
    }

    const [year, month, day] = date.split("-").map(Number);

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 60);

    if (dateObj < today) {
      throw new AppError("Shift date cannot be in the past", 400);
    }

    if (dateObj > maxDate) {
      throw new AppError("Cannot update a shift more than 60 days ahead", 400);
    }
  }

  if (breakMinutes !== undefined) {
    if (
      typeof breakMinutes !== "number" ||
      !Number.isInteger(breakMinutes) ||
      breakMinutes < 0
    ) {
      throw new AppError("Break time must not be less than 0 minutes", 400);
    }
  }

  if (notes !== undefined && typeof notes !== "string")
    throw new AppError("notes format didn't match ", 400);

  next();
};

export const deleteShiftValidation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (Object.keys(req.body).length === 0)
    throw new AppError("The requesting body is empty", 400);
  const { shiftIds } = req.body;

  if (!shiftIds) throw new AppError("requesting body is empty ", 400);

  if (!Array.isArray(shiftIds))
    throw new AppError("Shifts must be an array", 400);

  for (const id of shiftIds) {
    if (typeof id !== "string" || !mongoose.isValidObjectId(id))
      throw new AppError("Shift Id is not valid", 400);
    const isExist = await getShiftById(id);
    if (!isExist) {
      throw new AppError("One of more shifts doesn't exist ", 404);
    }
  }
  console.log("Delete validation passsed");
  next();
};
