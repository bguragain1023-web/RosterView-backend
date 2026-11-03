import type { Request, Response, NextFunction } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { verifyJwt } from "../utlis/jwt";
import { getUserById } from "../models/user/userModel";
import { AppError } from "../utlis/AppError";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : undefined;

    if (!token) {
      throw new AppError("Unauthorized", 401);
    }

    let payload;
    try {
      payload = verifyJwt(token);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AppError("Session expired, please log in again", 401);
      }
      if (error instanceof JsonWebTokenError) {
        throw new AppError("Invalid token", 401);
      }
      throw error; // e.g. JWT_SECRET missing: a server problem, not the client's
    }

    const user = payload?.id ? await getUserById(payload.id) : null;
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    if (user.status !== "active") {
      throw new AppError("Your account is inactive", 403);
    }

    const { password, ...rest } = user.toObject();
    req.userInfo = rest;
    next();
  } catch (error) {
    next(error);
  }
};
