import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utlis/AppError";

export const validateCreateClient = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, phone, address } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new AppError("Please provide a valid name", 400);
  }

  if (!phone || typeof phone !== "string")
    throw new AppError("Please provide valid phone number ", 400);

  if (!/^04\d{8}$/.test(phone)) {
    throw new AppError("Please provide a valid Australian mobile number", 400);
  }

  if (!address || typeof address !== "string")
    throw new AppError("Please provide valid address", 400);

  next();
};
