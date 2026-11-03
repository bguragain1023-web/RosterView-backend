import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
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
  // A malformed id (e.g. /shifts/abc) is bad input, not a server error.
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      status: "error",
      message: `Invalid ${error.path}`,
    });
  }
  console.error("Unhandled error:", error);
  return res
    .status(500)
    .json({ status: "error", message: "Internal Server Error" });
};
