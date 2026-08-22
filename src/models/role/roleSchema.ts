import mongoose, { Document, Schema } from "mongoose";

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: mongoose.Types.ObjectId[];
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    permissions: {
      type: [Schema.Types.ObjectId],
      ref: "Permission",
      default: [],
    },
  },
  { timestamps: true },
);
export default mongoose.model<IRole>("Role", roleSchema);
