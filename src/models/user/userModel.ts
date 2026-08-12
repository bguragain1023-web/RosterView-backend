import userSchema, {IUser} from "./userSchema";

//create

export const addUser = (userObj: IUser ): Promise<IUser> =>{
    return new userSchema(userObj).save();
}