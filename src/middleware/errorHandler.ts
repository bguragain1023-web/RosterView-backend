import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utlis/AppError";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
  }
  return res
    .status(500)
    .json({ status: "error", message: "Internal Server Error" });
};
