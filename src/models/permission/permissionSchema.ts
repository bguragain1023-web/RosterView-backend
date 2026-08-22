import mongoose, { Document, Schema } from "mongoose";

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "approve"
  | "assign"
  | "review";

export interface IPermission extends Document {
  name: string;
  resource: string;
  action: PermissionAction;
  description?: string;
}
const permissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    resource: {
      type: String,
      required: true,
      trim: true,
    },

    action: {
      type: String,
      enum: [
        "create",
        "read",
        "update",
        "delete",
        "approve",
        "assign",
        "review",
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IPermission>("Permission", permissionSchema);
