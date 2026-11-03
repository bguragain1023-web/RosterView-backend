import mongoose, { Types } from "mongoose";
import shiftSchema, { IShift, ShiftStatus } from "./shiftSchema";
import { addUtcDays } from "../../helper/dateOnly";

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

// Optional date range; both ends inclusive. Sorted by date, then start time.
export const getAllShifts = ({
  from,
  to,
}: { from?: Date; to?: Date } = {}): Promise<IShift[]> => {
  const date: Record<string, Date> = {};
  if (from) date.$gte = from;
  if (to) date.$lt = addUtcDays(to, 1);

  return shiftSchema
    .find(Object.keys(date).length ? { date } : {})
    .sort({ date: 1, startTime: 1 });
};

export const getShiftById = (id: string): Promise<IShift | null> => {
  return shiftSchema.findById(id);
};

export const updateShiftById = async (id: string, data: updateShiftPayLoad) => {
  return shiftSchema.updateOne({ _id: id }, { $set: data });
};

// Only cancels if the shift is still active, so two clicks can't race.
export const cancelShiftById = (
  id: string,
  cancelledBy: mongoose.Types.ObjectId,
  reason: string,
) => {
  return shiftSchema.findOneAndUpdate(
    { _id: id, status: { $in: ["assigned", "unassigned"] } },
    {
      $set: {
        status: "cancelled",
        cancelledAt: new Date(),
        cancelledBy,
        cancelReason: reason,
      },
    },
    { new: true },
  );
};

// Only reinstates a shift that is still cancelled.
export const reinstateShiftById = (
  id: string,
  update: { status: ShiftStatus; workerId: mongoose.Types.ObjectId | null },
) => {
  return shiftSchema.findOneAndUpdate(
    { _id: id, status: "cancelled" },
    {
      $set: update,
      $unset: { cancelledAt: 1, cancelledBy: 1, cancelReason: 1 },
    },
    { new: true },
  );
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
  // (cancelled shifts don't count: that worker is free)
  const workersOnRequestedDate = await shiftSchema.distinct("workerId", {
    workerId: { $ne: null },
    status: { $ne: "cancelled" },
    date: {
      $gte: requestedStart,
      $lte: requestedEnd,
    },
  });

  // Find target-date shifts belonging to eligible workers. Only active,
  // assigned shifts can be swapped.
  return shiftSchema.find({
    workerId: {
      $nin: [...workersOnRequestedDate, new mongoose.Types.ObjectId(workerId)],
    },
    status: "assigned",
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
