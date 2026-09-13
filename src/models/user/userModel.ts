import mongoose from "mongoose";
import userSchema, { IUser } from "./userSchema";

//create
interface UpdatePayLoad {
  roleId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  email?: string;
  phone?: string;
  status?: string;
}

export const addUser = async (userObj: IUser): Promise<IUser> => {
  try {
    const user = await new userSchema(userObj).save();

    return user;
  } catch (error) {
    console.log("ADD USER ERROR:", error);
    throw error;
  }
};

export const getUserById = (id: string): Promise<IUser | null> => {
  return userSchema.findById(id);
};

export const getUserbyEmail = (email: string): Promise<IUser | null> => {
  return userSchema.findOne({ email });
};

export const getAllUsers = (): Promise<IUser[]> => {
  return userSchema.find().select("-password");
};

export const getUsersByTeam = (teamId: string): Promise<IUser[] | null> => {
  return userSchema.find({
    teamId,
  });
};

export const updateUserDetailById = (id: string, data: UpdatePayLoad) => {
  try {
    const updatedUser = userSchema.updateOne(
      {
        _id: id,
      },
      {
        $set: data,
      },
    );
    return updatedUser;
  } catch (error) {
    console.log("Update user error:", error);
    throw error;
  }
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
