import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utlis/AppError";

export const validateCreateClient = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, phone, address, email } = req.body;

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

  if (!email) {
    throw new AppError("Email is missing", 400);
  }

  if (typeof email !== "string" || !email.includes("@")) {
    throw new AppError("Please provide a valid email", 400);
  }

  next();
};

export const ValidateUpdateClient = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (Object.keys(req.body).length === 0) {
    throw new AppError("The requesting body is empty", 400);
  }
  const allowedFields = [
    "name",
    "email",
    "phone",
    "status",
    "address",
    "notes",
  ];
  const requestedFields = Object.keys(req.body);

  const hasUnexpectedFields = requestedFields.some(
    (fields) => !allowedFields.includes(fields),
  );

  if (hasUnexpectedFields) {
    throw new AppError("Unepected field(s) are requested for update", 400);
  }

  const { name, email, phone, status, address } = req.body;
  if (name !== undefined && typeof name !== "string")
    throw new AppError("Name format didn't match ", 400);

  if (email !== undefined) {
    if (typeof email !== "string" || !email.includes("@")) {
      throw new AppError("Please provide a valid email", 400);
    }
  }

  if (status !== undefined && status !== "active" && status !== "inactive") {
    throw new AppError("Status format didn't match ", 400);
  }

  if (phone !== undefined) {
    if (typeof phone !== "string") {
      throw new AppError("Phone must be a string", 400);
    }

    if (!/^04\d{8}$/.test(phone)) {
      throw new AppError(
        "Please provide a valid Australian mobile number",
        400,
      );
    }
  }

  if (address !== undefined && typeof address !== "string") {
    throw new AppError("Please provide valid address", 400);
  }

  next();
};
