import mongoose, { Document, Schema } from "mongoose";

export interface IShift extends Document {
  workerId: mongoose.Types.ObjectId | null;
  date: Date;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  totalHour: number;
  status: "unassigned" | "assigned" | "completed" | "cancelled";
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
    totalHour: {
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

export default mongoose.model<IShift>("User", shiftSchema);
