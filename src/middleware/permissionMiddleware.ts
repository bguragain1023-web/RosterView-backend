import { NextFunction, Request, Response } from "express";
import { PermissionAction } from "../models/permission/permissionSchema";
import { getRoleById } from "../models/role/roleModel";
import { getPermissionById } from "../models/permission/permissionModel";
import { AppError } from "../utlis/AppError";

export const requirePermission = (
  resource: string,
  action: PermissionAction,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userInfo) throw new AppError("Unauthorized", 401);

      const { roleId, additionalPermissions = [] } = req.userInfo;
      if (!roleId) {
        throw new AppError("User role not found", 403);
      }

      const role = await getRoleById(roleId.toString());
      if (!role) {
        throw new AppError("Role not found", 403);
      }

      // A user has their role's permissions plus any extra permissions
      // granted directly to them.
      const permissionIds = [...role.permissions, ...additionalPermissions].map(
        (p) => p.toString(),
      );
      const permissions = await getPermissionById(permissionIds);

      const hasPermission = permissions.some(
        (item) => item.resource === resource && item.action === action,
      );
      if (!hasPermission) {
        throw new AppError(
          "You do not have permission to perform this action",
          403,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
