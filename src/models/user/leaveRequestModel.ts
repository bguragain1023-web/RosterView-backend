import mongoose from "mongoose";
import leaveRequestSchema, {
  ILeaveRequest,
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

export const addLeaveRequest = (
  addObj: CreateRequestInput,
): Promise<ILeaveRequest> => {
  return new leaveRequestSchema(addObj).save();
};

export const getAllLeaveRequest = (): Promise<ILeaveRequest[]> => {
  return leaveRequestSchema.find();
};

export const getSingleLeaveRequest = (
  requestId: string,
): Promise<ILeaveRequest | null> => {
  return leaveRequestSchema.findById(requestId);
};

export const updateLeaveRequest = (requestId: string, status: LeaveStatus) => {
  return leaveRequestSchema.findByIdAndUpdate(
    requestId,
    { status },
    { new: true },
  );
};
