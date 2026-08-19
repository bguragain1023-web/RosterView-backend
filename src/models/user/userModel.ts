import userSchema, { IUser } from "./userSchema";

//create

export const addUser = (userObj: IUser): Promise<IUser> => {
  return new userSchema(userObj).save();
};

export const getUserbyEmail = (email: string): Promise<IUser | null> => {
  return userSchema.findOne({ email });
};

export const getAllUsers = (): Promise<IUser[]> => {
  return userSchema.find().select("-password");
};
