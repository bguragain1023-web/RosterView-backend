import type { Request, Response, NextFunction } from "express";
import { getUserbyEmail } from "../models/user/userModel";
import { verifyJwt } from "../utlis/jwt";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(403).json({ error: "unauthorized" });
    }
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(403).json({ error: "unauthorized" });
    }
    const result = verifyJwt(token);
    if (result?.email) {
      const user = await getUserbyEmail(result.email);
      if (user?._id) {
        const { password, ...rest } = user.toObject();
        req.userInfo = rest;
        return next();
      }
    }

    res.status(403).json({
      error: "unauthorized",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    res.status(500).json({ error: message });
  }
};
