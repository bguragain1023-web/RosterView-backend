import userSchema, { IUser } from "./userSchema";

//create

export const addUser = async (userObj: IUser): Promise<IUser> => {
  console.log("sent obhj is :", userObj);
  try {
    const user = await new userSchema(userObj).save();
    console.log("User Saved", user);
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
