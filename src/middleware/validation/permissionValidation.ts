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
    const permissionsAvailable: string[] = [
      "user:create",
      "user:read",
      "user:update",
      "roster:read",
      "roster:create",
      "roster:update",
      "roster:assign",
      "availability:read",
      "availability:update",
      "leave:create",
      "leave:read",
      "leave:approve",
      "swap:create",
      "swap:read",
      "swap:approve",
      "incident:create",
      "incident:read",
      "incident:review",
    ];
    const { permissionNames } = req.body;

    if (!Array.isArray(permissionNames)) {
      throw new AppError("permissionNames must be an array", 400);
    }

    if (
      !permissionNames.every((permission) => typeof permission === "string")
    ) {
      throw new AppError("Every permission must be a string", 400);
    }

    const hasPermission = permissionNames.every((p) =>
      permissionsAvailable.includes(p),
    );

    if (!hasPermission) {
      throw new AppError("Invalid permission found", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};
