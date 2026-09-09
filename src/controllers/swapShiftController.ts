import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utlis/AppError";
import { getShiftById, getTargetShifts } from "../models/shift/shiftModel";
import {
  addSwaprequest,
  findPendingSwap,
  getSwapShiftById,
  reviewSwapShift,
  swapWorkersBetweenShifts,
  updateSwapShift,
} from "../models/shift/shiftSwapModel";
import { getUserById } from "../models/user/userModel";
import { getRoleById } from "../models/role/roleModel";

export const fetchSwapEligibleWorker = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { requestedShiftId, targetedDate } = req.body;
    if (!req.userInfo)
      throw new AppError("Not authorized to request swapShift", 404);
    const { _id } = req.userInfo;
    console.log(requestedShiftId);

    const requestedShift = await getShiftById(requestedShiftId);
    console.log(requestedShift);
    if (!requestedShift) throw new AppError("Shift doesn't exist", 404);

    if (
      !requestedShift.workerId ||
      requestedShift.workerId.toString() !== _id.toString()
    ) {
      throw new AppError("You can only request a swap for your own shift", 403);
    }

    const requestedDate = requestedShift.date.toISOString().split("T")[0];
    if (!requestedDate)
      throw new AppError("Shift date could not be determined", 400);

    const requestedDateObj = new Date(`${requestedDate}T00:00:00`);

    const targetedDateObj = new Date(`${targetedDate}T00:00:00`);

    const maxDate = new Date(requestedDateObj);
    maxDate.setDate(maxDate.getDate() + 15);

    if (targetedDateObj < requestedDateObj) {
      throw new AppError("Shift date cannot be in the past", 400);
    }

    if (targetedDateObj > maxDate) {
      throw new AppError(
        "Cannot swap a shift for more than 15 days difference",
        400,
      );
    }

    const result = await getTargetShifts(
      _id.toString(),
      requestedDate,
      targetedDate,
    );

    res.json({
      status: "success",
      message:
        result.length === 0
          ? "No Eligible Shifts found"
          : "Eligible Shifts fetched",
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const createSwapShift = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { requestedShiftId, targetedShiftId } = req.body;
    if (!req.userInfo) throw new AppError("Unauthorized", 401);

    const { _id } = req.userInfo;

    const requestedShift = await getShiftById(requestedShiftId);
    const targetedShift = await getShiftById(targetedShiftId);
    console.log("requestedShift", requestedShift);
    console.log("targetedShift", targetedShift);

    if (!requestedShift) throw new AppError("Shift Doesn't exist", 404);

    if (!requestedShift.workerId)
      throw new AppError("Requested shift must be assigned to a worker", 400);

    if (requestedShift.workerId.toString() !== _id.toString()) {
      throw new AppError("Requested shift must belong to you", 403);
    }

    if (!targetedShift) throw new AppError("Shift doesn't exist", 404);
    if (!targetedShift.workerId)
      throw new AppError("This shift doesn't have worker assigned", 400);

    if (targetedShift.workerId.toString() === _id.toString()) {
      throw new AppError("You cannot request a swap with your own shift", 400);
    }

    const requestedWorker = await getUserById(
      requestedShift.workerId.toString(),
    );

    const targetedWorker = await getUserById(targetedShift.workerId.toString());

    if (!requestedWorker || !targetedWorker) {
      throw new AppError("Worker not found", 404);
    }

    if (!requestedWorker.teamId || !targetedWorker.teamId) {
      throw new AppError("Both workers must be assigned to a team", 409);
    }

    if (
      requestedWorker.teamId.toString() !== targetedWorker.teamId.toString()
    ) {
      throw new AppError(
        "You can only request a swap with a worker from your team",
        403,
      );
    }

    const hasExistingSwap = await findPendingSwap(
      requestedShiftId,
      targetedShiftId,
    );

    if (hasExistingSwap) {
      throw new AppError(
        "A swap Requesting for this App is already Pending",
        409,
      );
    }

    const swapRequestObj = {
      requestedShiftId,
      targetedShiftId,
      requestedBy: _id,
      requestedTo: targetedShift.workerId,
    };

    const swapRequest = await addSwaprequest(swapRequestObj);

    if (!swapRequest)
      throw new AppError(
        "something went wrong while creating a swap request, try again later",
        500,
      );

    res.json({
      status: "success",
      message: " Swap request created successfully",
      swapRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const swapShiftActionByWorker = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 401);
    }

    const { _id, teamId } = req.userInfo;
    const swapShiftId = req.params.swapShiftId as string;
    const { action } = req.body;
    if (!swapShiftId) {
      throw new AppError("Please provide the shift Swap Id", 404);
    }

    const swapShift = await getSwapShiftById(swapShiftId.toString());

    if (!swapShift) {
      throw new AppError("Shift request not found", 404);
    }
    if (swapShift.status !== "pending") {
      throw new AppError("This swap request is no longer pending", 409);
    }

    if (_id.toString() !== swapShift.requestedTo.toString()) {
      throw new AppError("The shift is not requested to logged-in user", 403);
    }

    const requestedShift = await getShiftById(
      swapShift.requestedShiftId.toString(),
    );
    const targetedShift = await getShiftById(
      swapShift.targetedShiftId.toString(),
    );

    if (!requestedShift || !targetedShift) {
      throw new AppError("One or both shifts no longer exist", 404);
    }

    if (
      targetedShift.workerId?.toString() !== swapShift.requestedTo.toString()
    ) {
      throw new AppError(
        "The targeted shift is no longer assigned to you",
        409,
      );
    }

    if (
      requestedShift.workerId?.toString() !== swapShift.requestedBy.toString()
    ) {
      throw new AppError(
        "The requested shift is no longer assigned to the requester",
        409,
      );
    }

    const requestedWorker = await getUserById(swapShift.requestedBy.toString());
    if (!requestedWorker) {
      throw new AppError("this user doesn't exist anymore", 404);
    }

    if (
      !teamId ||
      !requestedWorker.teamId ||
      teamId.toString() !== requestedWorker.teamId.toString()
    ) {
      throw new AppError(
        "Both worker must be in a same team to complete this request",
        409,
      );
    }

    const status = action === "accept" ? "workerAccepted" : "rejected";
    const result = await updateSwapShift(swapShiftId, status);

    if (!result) {
      throw new AppError(
        "Somethning went wrong, please try again later!!",
        500,
      );
    }

    res.json({
      status: "success",
      message:
        action === "accept"
          ? "Swap request accepted! waiting from managers approval"
          : "swap request reejected",
    });
  } catch (error) {
    next(error);
  }
};

export const shiftReviewByManagers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  //swapShiftId
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 401);
    }
    const user = req.userInfo;
    const userRole = await getRoleById(user.roleId.toString());

    if (!userRole) {
      throw new AppError("User doesn;t have a role", 409);
    }

    if (userRole.name === "worker") {
      throw new AppError(
        "Permission Denied! User must be TeamLeader, Coordinator or Admin",
        403,
      );
    }

    const { action } = req.body;
    const swapShiftId = req.params.swapShiftId as string;
    const swapShift = await getSwapShiftById(swapShiftId);
    if (!swapShift) {
      throw new AppError("Shift Not found", 404);
    }
    const requestingUser = await getUserById(swapShift.requestedBy.toString());
    const requestedUser = await getUserById(swapShift.requestedTo.toString());
    if (!requestingUser || !requestedUser) {
      throw new AppError(
        "One or more worker in swapshift doesn't exist anymore",
        404,
      );
    }
    if (
      requestedUser.status !== "active" ||
      requestingUser.status !== "active"
    ) {
      throw new AppError(
        "One or more staff in swapShift is not active anymore",
        409,
      );
    }

    if (userRole.name === "teamLeader") {
      if (
        requestingUser.teamId?.toString() !== user.teamId?.toString() ||
        requestedUser.teamId?.toString() !== user.teamId?.toString()
      ) {
        throw new AppError("Both worker must be in your team", 409);
      }
    }

    if (swapShift.status !== "workerAccepted") {
      throw new AppError("Shift must be approved by both worker first", 409);
    }
    if (action === "reject") {
      const result = await reviewSwapShift(swapShiftId, "rejected", user._id);

      if (!result) {
        throw new AppError(
          "someThing went wrong while rejecting the swap",
          500,
        );
      }
      res.json({
        status: "success",
        message: "swap request rejected",
      });
    }

    if (action === "accept") {
      const swapResult = await swapWorkersBetweenShifts(
        swapShift.requestedShiftId.toString(),
        swapShift.targetedShiftId.toString(),
      );

      if (!swapResult) {
        throw new AppError(
          "something went wrong while accepting the swap request",
          500,
        );
      }
      const result = await reviewSwapShift(swapShiftId, "accepted", user._id);
      if (!result) {
        throw new AppError(
          "shift were swapped but the request couldn't be updated",
          500,
        );
      }
      res.json({
        status: "success",
        message: "Swap request approved and shift swapped successfully ",
      });
    }

    const status = action === "accept" ? "accepted" : "rejected";

    const result = await reviewSwapShift(swapShiftId, status, user._id);
    if (!result) {
      throw new AppError("Something went while performing the action", 500);
    }
    res.json({
      status: "success",
      message: "shift updated",
    });
  } catch (error) {
    next(error);
  }
};
