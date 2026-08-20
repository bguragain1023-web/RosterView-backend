import jwt from "jsonwebtoken";
import { UserRole } from "../models/user/userSchema";

interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

const secretKey: string | undefined = process.env.JWT_SECRET;
console.log(secretKey);

export const signJwt = (payLoad: JwtPayload): string => {
  if (!secretKey) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  console.log(secretKey);
  const token = jwt.sign(payLoad, secretKey, { expiresIn: "1d" });
  console.log(token);
  return token;
};

export const verifyJwt = (token: string): JwtPayload => {
  if (!secretKey) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.verify(token, secretKey) as JwtPayload;
};
