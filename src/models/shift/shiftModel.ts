import mongoose from "mongoose";
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
  return await shiftSchema.findById(id);
};

export const updateShiftById = async (id: string, data: ShiftInput) => {
  return shiftSchema.updateOne({ _id: id }, { $set: data });
};

export const deleteManyShifts = async (ids: string[]) => {
  return shiftSchema.deleteMany({ _id: { $in: ids } });
};
