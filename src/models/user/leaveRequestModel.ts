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
}

export interface ReviewLeaveRequestInput {
  status: "approved" | "rejected";
  reviewedBy: mongoose.Types.ObjectId;
  reviewedAt: Date;
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

export const getLeaveRequestsByWorkers = (
  workerIds: string[],
): Promise<ILeaveRequest[]> => {
  return leaveRequestSchema.find({
    workerId: { $in: workerIds },
  });
};

export const reviewLeaveRequest = (
  requestId: string,
  reviewObj: ReviewLeaveRequestInput,
) => {
  return leaveRequestSchema.findByIdAndUpdate(requestId, reviewObj, {
    new: true,
  });
};

export const getOverlappingLeaveRequest = (
  workerId: string,
  startDate: Date,
  endDate: Date,
) => {
  return leaveRequestSchema.findOne({
    workerId,
    status: { $in: ["pending", "approved"] },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  });
};

export const getApprovedLeaveOnDate = (
  workerId: string,
  date: Date,
): Promise<ILeaveRequest | null> => {
  return leaveRequestSchema.findOne({
    workerId,
    status: "approved",
    startDate: { $lte: date },
    endDate: { $gte: date },
  });
};
