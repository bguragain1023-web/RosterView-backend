import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utlis/AppError";

export const validateCreateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, email, phone, role } = req.body;

  if (!name) throw new AppError("Name is missing", 400);
  if (typeof name !== "string")
    throw new AppError("Name format didn't match ", 400);

  if (!phone) throw new AppError("phone not Provided", 400);

  if (typeof role !== "string")
    throw new AppError("Role format didn't match ", 400);

  if (!email) throw new AppError("email not Provided", 400);

  if (!email.includes("@"))
    throw new AppError("Please provide valid email", 400);

  next();
};

export const validateUpdateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (Object.keys(req.body).length === 0) {
    throw new AppError("The requesting body is empty", 400);
  }
  const allowedFields = ["name", "email", "phone", "role", "status", "team"];
  const requestedFields = Object.keys(req.body);

  const hasUnexpectedFields = requestedFields.some(
    (fields) => !allowedFields.includes(fields),
  );

  if (hasUnexpectedFields) {
    throw new AppError("Unepected field(s) are requested for update", 400);
  }
  const { name, email, role, phone, team, status } = req.body;
  if (name !== undefined && typeof name !== "string")
    throw new AppError("Name format didn't match ", 400);

  if (email !== undefined) {
    if (typeof email !== "string" || !email.includes("@")) {
      throw new AppError("Please provide a valid email", 400);
    }
  }

  const allowedRoles = ["admin", "coordinator", "teamLeader", "worker"];

  if (
    role !== undefined &&
    (typeof role !== "string" || !allowedRoles.includes(role))
  )
    throw new AppError("Invalid role", 400);

  if (status !== undefined && status !== "active" && status !== "inactive") {
    throw new AppError("Status format didn't match ", 400);
  }

  if (team !== undefined && typeof team !== "string") {
    throw new AppError("Invalid team", 400);
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
  next();
};
