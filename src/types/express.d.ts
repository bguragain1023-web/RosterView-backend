import type { IUser } from "../models/user/userSchema";

declare global {
  namespace Express {
    interface Request {
      userInfo?: IUser;
    }
  }
}
export {};
