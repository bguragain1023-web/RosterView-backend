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

export const addNewShift = (shiftObj: ShiftInput): Promise<IShift> => {
  return new shiftSchema(shiftObj).save();
};

export const getAllShifts = (): Promise<IShift[]> => {
  return shiftSchema.find();
};
