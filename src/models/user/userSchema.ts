import mongoose, { Document, Schema } from "mongoose";

export type UserStatus = "active" | "inactive";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  roleId: mongoose.Types.ObjectId;
  status: UserStatus;
  teamId?: mongoose.Types.ObjectId;
  mustChangePassword: boolean;
  passwordChangedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      required: true,
      default: "active",
    },

    teamId: {
      type: mongoose.Types.ObjectId,
      ref: "Team",
    },
    mustChangePassword: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
    },
  },

  { timestamps: true },
);

export default mongoose.model<IUser>("User", userSchema);
