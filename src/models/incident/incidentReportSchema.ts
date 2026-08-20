import mongoose, { Document, Schema } from "mongoose";

export type SeverityLevel =
  | "unassessed"
  | "minor"
  | "moderate"
  | "major"
  | "critical";

export type IncidentStatus = "open" | "underReview" | "resolved" | "closed";

export interface IIncidentReport extends Document {
  reportedBy: mongoose.Types.ObjectId;
  client?: mongoose.Types.ObjectId;
  shift?: mongoose.Types.ObjectId;
  incidentDate: Date;
  incidentTime: string;
  description: string;
  severity: SeverityLevel;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  resolution?: string;
  status: IncidentStatus;
}

const incidentReportSchema = new Schema(
  {
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
    },
    shift: {
      type: Schema.Types.ObjectId,
      ref: "Shift",
    },
    incidentDate: {
      type: Date,
      required: true,
    },
    incidentTime: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["unassessed", "minor", "moderate", "major", "critical"],
      required: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    resolution: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "underReview", "resolved", "closed"],
      default: "open",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IIncidentReport>(
  "IncidentReport",
  incidentReportSchema,
);
