import mongoose, { Types } from "mongoose";
import shiftSchema, { IShift, ShiftStatus } from "./shiftSchema";

export interface ShiftInput {
  workerId: mongoose.Types.ObjectId | null;
  clientId: mongoose.Types.ObjectId;
  location: string;
  date: Date;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  totalHours: number;
  status: ShiftStatus;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
}
export interface updateShiftPayLoad {
  workerId: string | mongoose.Types.ObjectId | null;
  clientId: string;
  location: string;
  date: Date;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  totalHours: number;
  status: ShiftStatus;
  notes?: string;
}

export const addNewShift = (shiftObj: ShiftInput): Promise<IShift> => {
  return new shiftSchema(shiftObj).save();
};

export const getAllShifts = (): Promise<IShift[]> => {
  return shiftSchema.find();
};

export const getShiftById = (id: string): Promise<IShift | null> => {
  return shiftSchema.findById(id);
};

export const updateShiftById = async (id: string, data: updateShiftPayLoad) => {
  return shiftSchema.updateOne({ _id: id }, { $set: data });
};

export const deleteManyShifts = async (ids: string[]) => {
  return shiftSchema.deleteMany({ _id: { $in: ids } });
};

export const getTargetShifts = async (
  workerId: string,
  requestedDate: string,
  targetedDate: string,
): Promise<IShift[]> => {
  const requestedStart = new Date(`${requestedDate}T00:00:00.000Z`);
  const requestedEnd = new Date(`${requestedDate}T23:59:59.999Z`);

  const targetedStart = new Date(`${targetedDate}T00:00:00.000Z`);
  const targetedEnd = new Date(`${targetedDate}T23:59:59.999Z`);

  // Workers who already have a shift on the requested date
  const workersOnRequestedDate = await shiftSchema.distinct("workerId", {
    workerId: { $ne: null },
    date: {
      $gte: requestedStart,
      $lte: requestedEnd,
    },
  });

  // Find target-date shifts belonging to eligible workers
  return shiftSchema.find({
    workerId: {
      $nin: [...workersOnRequestedDate, new mongoose.Types.ObjectId(workerId)],
    },
    date: {
      $gte: targetedStart,
      $lte: targetedEnd,
    },
  });
};

// Active (non-cancelled) shifts for a worker with date in [from, to).
// Pass excludeShiftId to leave out the shift currently being edited.
export const getWorkerShiftsInRange = async (
  workerId: string,
  from: Date,
  to: Date,
  excludeShiftId?: string,
): Promise<IShift[]> => {
  return shiftSchema.find({
    workerId,
    status: { $ne: "cancelled" },
    date: { $gte: from, $lt: to },
    ...(excludeShiftId ? { _id: { $ne: excludeShiftId } } : {}),
  });
};

export const getWorkerShiftsForWeek = async (
  workerId: string,
  weekStart: Date,
  weekEnd: Date,
  excludeShiftId?: string,
): Promise<IShift[]> => {
  return shiftSchema.find({
    workerId,
    status: { $ne: "cancelled" },
    date: {
      $gte: weekStart,
      $lte: weekEnd,
    },
    ...(excludeShiftId ? { _id: { $ne: excludeShiftId } } : {}),
  });
};
