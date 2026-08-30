import mongoose, { Document, Schema } from "mongoose";

export interface IClient extends Document {
  name: string;
  phone: string;
  address: string;
  notes?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const clientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IClient>("Client", clientSchema);
