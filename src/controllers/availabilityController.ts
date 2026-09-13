import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utlis/AppError";
import {
  AddAvailabilityPayload,
  addAvailabilty,
  deleteAvailabilityById,
  fetchAllAvailability,
  fetchAllAvailabilityByteam,
  fetchAvailabilityByUserId,
  getAvailabilityByDate,
  getAvailabilityByDay,
  getAvailabilityById,
  updateAvailabilityById,
} from "../models/user/availabilityModel";
import { getRoleById } from "../models/role/roleModel";
import { getUsersByTeam } from "../models/user/userModel";

export const createAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("unauthorized", 401);
    }
    const workerId = req.userInfo._id;
    const { type, dayOfWeek, date, status } = req.body;
    let availabilityObj: AddAvailabilityPayload;
    if (type === "recurring") {
      if (dayOfWeek === undefined) {
        throw new AppError(
          "Day of the week is required for recurring availabilty",
          400,
        );
      }
      const existAvailability = await getAvailabilityByDay(
        workerId.toString(),
        dayOfWeek,
      );
      if (existAvailability) {
        throw new AppError("Availability already exists for this day ", 409);
      }

      availabilityObj = {
        workerId,
        dayOfWeek,
        status,
        type,
      };
    } else if (type === "specific") {
      if (!date) {
        throw new AppError(
          "Date is required for specific date availability",
          400,
        );
      }
      const availabilityDate = new Date(date);
      availabilityDate.setHours(0, 0, 0, 0);

      const existAvailability = await getAvailabilityByDate(
        workerId.toString(),
        availabilityDate,
      );

      if (existAvailability) {
        throw new AppError("Availability already exist for this day ", 409);
      }

      availabilityObj = {
        workerId,
        date: availabilityDate,
        status,
        type,
      };
    } else {
      throw new AppError("Invalid availability type", 400);
    }

    const result = await addAvailabilty(availabilityObj);
    if (!result) {
      throw new AppError(
        "Something went wrong while saving the availability",
        500,
      );
    }
    res.json({
      status: "success",
      message: "Availability added",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 401);
    }

    const user = req.userInfo;
    const role = await getRoleById(user.roleId.toString());
    if (!role) {
      throw new AppError("Role not found ", 404);
    }
    if (role.name === "teamLeader") {
      if (!user.teamId) {
        throw new AppError("Team not found", 404);
      }

      const workers = await getUsersByTeam(user.teamId.toString());
      if (!workers) {
        throw new AppError("workers nor found", 404);
      }

      const workerIds = workers.map((worker) => worker._id.toString());
      const availability = await fetchAllAvailabilityByteam(workerIds);
      if (!availability) {
        throw new AppError("Availability not found", 404);
      }
      return res.json({
        status: "success",
        message: "Fetched your team's availability",
        availability,
      });
    }

    if (role.name === "worker") {
      const availability = await fetchAvailabilityByUserId(user._id.toString());

      if (!availability) {
        throw new AppError("Availability not found", 404);
      }
      return res.json({
        status: "success",
        message: "fetched your availability",
        availability,
      });
    }

    const availability = await fetchAllAvailability();
    if (!availability) {
      throw new AppError("Availability not found", 404);
    }
    return res.json({
      status: "success",
      message: "Here are all the availability",
      availability,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 401);
    }

    const workerId = req.userInfo._id;
    const { availabilityId } = req.params;
    const { status } = req.body;
    if (!availabilityId || Array.isArray(availabilityId)) {
      throw new AppError("Availability ID is required", 400);
    }

    const availability = await getAvailabilityById(availabilityId);

    if (!availability) {
      throw new AppError("Availability not found", 404);
    }

    if (availability.workerId.toString() !== workerId.toString()) {
      throw new AppError(
        "You are not allowed to update this availability",
        403,
      );
    }

    const result = await updateAvailabilityById(availabilityId, status);

    if (!result) {
      throw new AppError(
        "Something went wrong while updating availability",
        500,
      );
    }

    res.json({
      status: "success",
      message: "Availability updated",
    });
  } catch (error) {
    next(error);
  }
};

//delete availability

export const deleteAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 401);
    }

    const workerId = req.userInfo._id;
    const { availabilityId } = req.params;
    if (!availabilityId) {
      throw new AppError("Availability ID is missing", 400);
    }

    const availability = await getAvailabilityById(availabilityId.toString());

    if (!availability) {
      throw new AppError("Availability not found", 404);
    }

    if (availability.workerId.toString() !== workerId.toString()) {
      throw new AppError(
        "You are not allowed to delete this availability",
        403,
      );
    }

    const result = await deleteAvailabilityById(availabilityId?.toString());

    if (!result) {
      throw new AppError(
        "Something went wrong while deleting availability",
        500,
      );
    }

    res.json({
      status: "success",
      message: "Availability deleted",
    });
  } catch (error) {
    next(error);
  }
};
