import mongoose from "mongoose";
import userSchema, { IUser } from "./userSchema";

//create
interface UpdatePayLoad {
  roleId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId | string;
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

// Team members with their role name (for the team detail page).
export const getTeamMembers = (teamId: string) => {
  return userSchema
    .find({ teamId })
    .select("name status roleId")
    .populate<{
      roleId: { _id: mongoose.Types.ObjectId; name: string } | null;
    }>("roleId", "name")
    .sort({ name: 1 })
    .lean();
};

// Take a user out of whatever team they're in.
export const clearUserTeam = (userId: string) => {
  return userSchema.updateOne({ _id: userId }, { $unset: { teamId: 1 } });
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

// { id -> name } for the given user ids. Only the name is fetched.
export const getUserNames = async (
  ids: string[],
): Promise<Map<string, string>> => {
  const users = await userSchema
    .find({ _id: { $in: ids } })
    .select("name")
    .lean();
  return new Map(users.map((u) => [u._id.toString(), u.name]));
};
