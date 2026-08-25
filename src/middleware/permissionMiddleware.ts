import { NextFunction, Request, Response } from "express";
import { PermissionAction } from "../models/permission/permissionSchema";
import { getRoleById } from "../models/role/roleModel";
import { getPermissionById } from "../models/permission/permissionModel";

export const requirePermission = (
  resource: string,
  action: PermissionAction,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoleId = req.userInfo?.roleId;
      if (!userRoleId) {
        return res.status(403).json({
          status: "error",
          message: "User Role not found",
        });
      }

      const role = await getRoleById(userRoleId.toString());
      if (!role) {
        return res.status(403).json({
          status: "error",
          message: "Role not found",
        });
      }
      if (role._id) {
        const permissionsID = role.permissions.map((p) => p.toString());
        const permissions = await getPermissionById(permissionsID);

        const hasPermission = permissions.some(
          (item) => item.resource === resource && item.action === action,
        );
        if (!hasPermission) {
          return res.status(403).json({
            status: "error",
            message: "You do not have permission to perform this action",
          });
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
