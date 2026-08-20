import mongoose, { Document, Schema } from "mongoose";

export type ShiftStatus = "unassigned" | "assigned" | "completed" | "cancelled";

export interface IShift extends Document {
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

const shiftSchema = new Schema<IShift>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      dafault: null,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    breakMinutes: {
      type: Number,
      default: 0,
    },
    totalHours: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["unassigned", "assigned", "completed", "cancelled"],
      default: "unassigned",
    },

    notes: {
      type: String,
      default: "",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IShift>("Shift", shiftSchema);
