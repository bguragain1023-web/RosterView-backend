import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utlis/AppError";

interface UpdatePermissionsBody {
  permissionNames: string[];
}

export const validatePermissions = (
  req: Request<{}, {}, UpdatePermissionsBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Whether each name actually exists is checked against the database in
    // the controller, so there's no hard-coded list to keep in sync here.
    const { permissionNames } = req.body;

    if (!Array.isArray(permissionNames)) {
      throw new AppError("permissionNames must be an array", 400);
    }

    if (
      !permissionNames.every((permission) => typeof permission === "string")
    ) {
      throw new AppError("Every permission must be a string", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};
