import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utlis/AppError";

export const validateCreateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, password, email, phone } = req.body;

  if (!name) throw new AppError("Name is missing", 400);
  if (typeof name !== "string")
    throw new AppError("Name format didn't match ", 400);

  if (!phone) throw new AppError("phone not Provided", 400);

  if (!email) throw new AppError("email not Provided", 400);

  if (!email.includes("@"))
    throw new AppError("Please provide valid email", 400);

  next();
};
