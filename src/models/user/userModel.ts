import mongoose from "mongoose";
import userSchema, { IUser } from "./userSchema";

//create
interface UpdatePayLoad {
  roleId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  email?: string;
  phone?: string;
  status?: string;
  password?: string;
  mustChangePassword?: boolean;
  passwordChangedAt?: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  roleId: mongoose.Types.ObjectId;
  mustChangePassword: boolean;
  additionalPermissions: mongoose.Types.ObjectId[];
}

export const addUser = (userObj: CreateUserInput): Promise<IUser> => {
  return new userSchema(userObj).save();
};

export const getUserById = (id: string): Promise<IUser | null> => {
  return userSchema.findById(id);
};

export const getUserbyEmail = (email: string): Promise<IUser | null> => {
  return userSchema.findOne({ email });
};

export const getAllUsers = () => {
  return userSchema
    .find()
    .select("-password")
    .populate<{
      roleId: { _id: mongoose.Types.ObjectId; name: string } | null;
    }>("roleId", "name")
    .lean();
};

export const getUsersByTeam = (teamId: string): Promise<IUser[] | null> => {
  return userSchema.find({
    teamId,
  });
};

export const updateUserDetailById = (id: string, data: UpdatePayLoad) => {
  return userSchema.updateOne({ _id: id }, { $set: data });
};

export const updateAdditionalPermission = (
  userId: string,
  permissionIDs: mongoose.Types.ObjectId[],
) => {
  return userSchema.findByIdAndUpdate(
    userId,
    { additionalPermissions: permissionIDs },
    { new: true },
  );
};
