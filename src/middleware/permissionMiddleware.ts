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
      console.log("permission started");
      if (!req.userInfo) throw new AppError("Unauthorized", 401);
      const userRoleId = req.userInfo.roleId;
      if (!userRoleId) {
        throw new AppError("User Role not found", 404);
      }
      console.log("userrole found ", userRoleId);
      const role = await getRoleById(userRoleId.toString());
      if (!role) {
        throw new AppError(" Role not found", 403);
      }
      if (role._id) {
        const permissionsID = role.permissions.map((p) => p.toString());
        const permissions = await getPermissionById(permissionsID);

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
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";

      return res.status(500).json({
        status: "error",
        message,
      });
    }
  };
};
