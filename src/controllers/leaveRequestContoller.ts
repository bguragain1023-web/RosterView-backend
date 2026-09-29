import type { Response, Request, NextFunction } from "express";
import { AppError } from "../utlis/AppError";
import { getRoleById } from "../models/role/roleModel";
import {
  addLeaveRequest,
  getAllLeaveRequest,
  getLeaveRequestsByWorkers,
  getOverlappingLeaveRequest,
  getSingleLeaveRequest,
  reviewLeaveRequest,
  updateLeaveRequest,
} from "../models/user/leaveRequestModel";
``;
import { LeaveStatus } from "../models/user/leaveRequestSchema";
import { getTeamByLeaderId } from "../models/team/teamModel";
import { getUserById, getUsersByTeam } from "../models/user/userModel";

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

    const existingLeaveRequest = await getOverlappingLeaveRequest(
      userId.toString(),
      startDate,
      endDate,
    );

    if (existingLeaveRequest) {
      throw new AppError(
        "You already have a leave request that overlaps these dates",
        409,
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

export const getLeaveRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 401);
    }

    const role = await getRoleById(req.userInfo.roleId.toString());

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    let leaveRequests;

    if (role.name === "admin" || role.name === "coordinator") {
      leaveRequests = await getAllLeaveRequest();
    } else if (role.name === "worker") {
      leaveRequests = await getLeaveRequestsByWorkers([
        req.userInfo._id.toString(),
      ]);
    } else if (role.name === "teamLeader") {
      const team = await getTeamByLeaderId(req.userInfo._id.toString());

      if (!team) {
        throw new AppError("Team not found", 404);
      }

      const teamUsers = await getUsersByTeam(team._id.toString());

      if (!teamUsers) {
        throw new AppError("User not found ", 404);
      }

      const workerIds = teamUsers
        .filter((user) => user._id.toString() !== req.userInfo!._id.toString())
        .map((user) => user._id.toString());

      leaveRequests = await getLeaveRequestsByWorkers(workerIds);
    } else {
      throw new AppError(
        "You don't have permission to view leave requests",
        403,
      );
    }

    res.json({
      status: "success",
      leaveRequests,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelLeaveRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 401);
    }

    const requestId = req.params.id as string;

    const leaveRequest = await getSingleLeaveRequest(requestId);

    if (!leaveRequest) {
      throw new AppError("Leave request not found", 404);
    }

    if (leaveRequest.workerId.toString() !== req.userInfo._id.toString()) {
      throw new AppError("You can only cancel your own leave request", 403);
    }

    if (leaveRequest.status !== "pending") {
      throw new AppError("Only pending leave requests can be cancelled", 400);
    }

    const cancelledRequest = await updateLeaveRequest(requestId, "cancelled");

    res.json({
      status: "success",
      message: "Leave request cancelled successfully",
      leaveRequest: cancelledRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewLeaveRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 401);
    }

    const requestId = req.params.id as string;
    const { status, reviewComment } = req.body;

    const leaveRequest = await getSingleLeaveRequest(requestId);

    if (!leaveRequest) {
      throw new AppError("Leave request not found", 404);
    }

    if (leaveRequest.status !== "pending") {
      throw new AppError("Only pending leave requests can be reviewed", 400);
    }

    const role = await getRoleById(req.userInfo.roleId.toString());

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    if (
      role.name !== "admin" &&
      role.name !== "coordinator" &&
      role.name !== "teamLeader"
    ) {
      throw new AppError(
        "You don't have permission to review leave requests",
        403,
      );
    }

    if (status !== "approved" && status !== "rejected") {
      throw new AppError("Status must be approved or rejected", 400);
    }

    if (role.name === "teamLeader") {
      const team = await getTeamByLeaderId(req.userInfo._id.toString());

      if (!team) {
        throw new AppError("Team not found", 404);
      }

      const worker = await getUserById(leaveRequest.workerId.toString());

      if (!worker) {
        throw new AppError("Worker not found", 404);
      }

      if (!worker.teamId || worker.teamId.toString() !== team._id.toString()) {
        throw new AppError(
          "You can only review leave requests from your team",
          403,
        );
      }
    }

    const reviewedRequest = await reviewLeaveRequest(requestId, {
      status,
      reviewedBy: req.userInfo._id,
      reviewedAt: new Date(),
      reviewComment,
    });

    res.json({
      status: "success",
      message: `Leave request ${status} successfully`,
      leaveRequest: reviewedRequest,
    });
  } catch (error) {
    next(error);
  }
};
