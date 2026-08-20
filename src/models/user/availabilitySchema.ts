import mongoose, { Document, Schema } from "mongoose";

export type AvaiabilityType = "recurring" | "specific";
export type AvaiabilityStatus = "available" | "unavailable";

export interface IAvaiability extends Document {
  workerId: mongoose.Types.ObjectId;
  type: AvaiabilityType;
  dayOfWeek?: number;
  date?: Date;
  startTime?: string;
  endTime?: string;
  status: AvaiabilityStatus;
}

const availabilitySchema = new Schema<IAvaiability>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    type: {
      type: String,
      enum: ["recurring", "specific"],
      required: true,
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
    },
    date: {
      type: Date,
    },
    startTime: {
      type: String,
    },

    endTime: {
      type: String,
    },

    status: {
      type: String,
      enum: ["available", "unavailable"],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IAvaiability>("Availability", availabilitySchema);
