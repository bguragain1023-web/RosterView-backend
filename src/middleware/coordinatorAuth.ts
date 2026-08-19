import type { Request, Response, NextFunction } from "express";

export const requireCoordinate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.userInfo?.role !== "coordinator") {
    res.status(403).json({
      status: "error",
      message: "Access Denied: coordinator Only",
    });
  }
  next();
};
