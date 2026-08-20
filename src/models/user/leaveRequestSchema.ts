import mongoose, { Schema } from "mongoose";
import { Document } from "mongoose";

export type LeaveType = "annual" | "personal" | "sick" | "unpaid" | "other";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface ILeaveRequest extends Document {
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

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: ["annual", "personal", "sick", "unpaid", "other"],
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },

    reviewComment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model<ILeaveRequest>(
  "LeaveRequest",
  leaveRequestSchema,
);
