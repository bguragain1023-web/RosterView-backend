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
  workerId: string;
  clientId: string;
  location: string;
  date: Date;
  startTime: string;
  endTime: string;
  breakTime: number;
  totalHours: number;
  status: ShiftStatus;
  notes?: string;
  createdBy: string;
}

export const addNewShift = (shiftObj: ShiftInput): Promise<IShift> => {
  return new shiftSchema(shiftObj).save();
};

export const getAllShifts = (): Promise<IShift[]> => {
  return shiftSchema.find();
};

export const getShiftById = async (id: string): Promise<IShift | null> => {
  console.log("ID received by getShiftById:", id);
  console.log("Database:", mongoose.connection.name);
  console.log("Collection:", shiftSchema.collection.name);
  const shift = await shiftSchema.findById(id);
  console.log("Result:", shift);
  return shift;
};

export const updateShiftById = async (id: string, data: ShiftInput) => {
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
