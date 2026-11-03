import type { NextFunction, Request, Response } from "express";
import { getAllPermissions } from "../models/permission/permissionModel";

export const fetchAllPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const permissions = await getAllPermissions();
    res.json({
      status: "success",
      message: "Permissions fetched",
      permissions,
    });
  } catch (error) {
    next(error);
  }
};
