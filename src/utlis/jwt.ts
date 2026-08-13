import jwt from "jsonwebtoken"
import { StringSchemaDefinition } from "mongoose";

interface JwtPayload {
  id: string;
  email: string;
  role: "coordinator" | "worker"
}

const secretKey : string | undefined = process.env.JWT_SECRET;
console.log(secretKey)



export const signJwt = (payLoad: JwtPayload) : string =>{
  if (!secretKey) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
console.log(secretKey)
    const token = jwt.sign(payLoad, secretKey, {expiresIn: "1d"});
    console.log(token)
    return token
} 