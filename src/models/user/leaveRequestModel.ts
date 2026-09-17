import mongoose from "mongoose";
import leaveRequestSchema, {
  LeaveStatus,
  LeaveType,
} from "./leaveRequestSchema";

export interface CreateRequestInput {
  workerId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  type: LeaveType;
  reason?: string;
  status: LeaveStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewComment?: string;
}

export const addLeaveRequest = (addObj: CreateRequestInput) => {
  return new leaveRequestSchema(addObj).save();
};
