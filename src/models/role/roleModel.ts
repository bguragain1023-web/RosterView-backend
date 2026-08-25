import mongoose from "mongoose";
import roleSchema, { IRole } from "./roleSchema";

export interface RoleInput {
  name: string;
  description?: string;
  permissions: mongoose.Types.ObjectId[];
}

export const addRoles = async (roleObj: RoleInput): Promise<IRole | null> => {
  return roleSchema.findOneAndUpdate({ name: roleObj.name }, roleObj, {
    upsert: true,
    returnDocument: "after",
  });
};

export const getRoleById = (id: string): Promise<IRole | null> => {
  return roleSchema.findById(id);
};
