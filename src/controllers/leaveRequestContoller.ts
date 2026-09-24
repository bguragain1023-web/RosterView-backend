import type { Response, Request, NextFunction } from "express";
import { AppError } from "../utlis/AppError";
import { getRoleById } from "../models/role/roleModel";
import { addLeaveRequest } from "../models/user/leaveRequestModel";
import { LeaveStatus } from "../models/user/leaveRequestSchema";

export const createLeaveRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 401);
    }
    const { type, reason } = req.body;
    const userId = req.userInfo._id;

    const startDate = new Date(req.body.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(req.body.endDate);
    endDate.setHours(0, 0, 0, 0);
    if (startDate > endDate) {
      throw new AppError(
        "Please make sure start date is before end date ",
        400,
      );
    }
    const role = await getRoleById(req.userInfo.roleId.toString());

    if (!role) {
      throw new AppError("role not found", 404);
    }
    if (role.name !== "worker") {
      throw new AppError(
        "Only worker can apply for leaveRequest for now ",
        403,
      );
    }
    const status: LeaveStatus = "pending";

    const leaveReqObj = {
      workerId: userId,
      startDate,
      endDate,
      type,
      reason,
      status,
    };

    const leaveRequest = await addLeaveRequest(leaveReqObj);

    if (!leaveRequest) {
      throw new AppError("Couldn't create your leave request", 500);
    }
    res.json({
      status: "success",
      message: "Leave request created successfully",
    });
  } catch (error) {
    next(error);
  }
};
