import mongoose, { Document, Schema } from "mongoose";

export interface ITeam extends Document {
  name: string;
  normalizedName: string;
  description: string;
  teamLeaderId: mongoose.Types.ObjectId | null;
  isActive: boolean;
}

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    teamLeaderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<ITeam>("Team", teamSchema);
