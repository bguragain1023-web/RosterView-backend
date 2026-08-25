import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  email: string;
  roleId: string;
}

const secretKey: string | undefined = process.env.JWT_SECRET;

export const signJwt = (payLoad: JwtPayload): string => {
  if (!secretKey) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign(payLoad, secretKey, { expiresIn: "1d" });
  return token;
};

export const verifyJwt = (token: string): JwtPayload => {
  if (!secretKey) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.verify(token, secretKey) as JwtPayload;
};
