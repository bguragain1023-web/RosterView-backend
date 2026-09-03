import mongoose, { Document, Schema } from "mongoose";

export type ShiftSwapStatus =
  | "pending"
  | "workerAccepted"
  | "accepted"
  | "rejected"
  | "cancelled";

export interface IShiftSwap extends Document {
  requestedShiftId: mongoose.Types.ObjectId;
  targetedShiftId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  requestedTo: mongoose.Types.ObjectId;
  status: ShiftSwapStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewComment?: string;
}

const shiftSwapSchema = new Schema(
  {
    requestedShiftId: {
      type: Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },
    targetedShiftId: {
      type: Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "workerAccepted", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewedAt: {
      type: Date,
      required: true,
    },
    reviewComment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IShiftSwap>("ShiftSwap", shiftSwapSchema);
