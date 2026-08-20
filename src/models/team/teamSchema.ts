import mongoose, { Document, Schema } from "mongoose";

export interface ITeam extends Document {
  name: string;
  description: string;
  teamLeaderId: mongoose.Types.ObjectId;
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

    description: {
      type: String,
      trim: true,
      default: "",
    },

    teamLeaderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<ITeam>("Team", teamSchema);
