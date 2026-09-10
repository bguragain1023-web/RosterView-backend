import mongoose, { Document, Schema } from "mongoose";

export type AvailabilityType = "recurring" | "specific";
export type AvailabilityStatus = "available" | "unavailable";

export interface IAvailability extends Document {
  workerId: mongoose.Types.ObjectId;
  type: AvailabilityType;
  dayOfWeek?: number;
  date?: Date;
  status: AvailabilityStatus;
}

const availabilitySchema = new Schema<IAvailability>(
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

    status: {
      type: String,
      enum: ["available", "unavailable"],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IAvailability>(
  "Availability",
  availabilitySchema,
);
