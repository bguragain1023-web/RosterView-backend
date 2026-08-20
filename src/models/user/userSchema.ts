import mongoose, { Document } from "mongoose";

export type UserRole = "admin" | "coordinator" | "teamLeader" | "worker";

export type UserStatus = "active" | "inactive";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  teamId?: mongoose.Types.ObjectId;
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
    role: {
      type: String,
      enum: ["admin", "coordinator", "teamLeader", "worker"],
      required: true,
      default: "worker",
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
  },

  { timestamps: true },
);

export default mongoose.model<IUser>("User", userSchema);
