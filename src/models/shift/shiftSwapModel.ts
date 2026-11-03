import mongoose from "mongoose";
import shiftSwapSchema, {
  IShiftSwap,
  ShiftSwapStatus,
} from "./shiftSwapSchema";
import { AppError } from "../../utlis/AppError";
import shiftSchema from "./shiftSchema";

interface SwapCreate {
  requestedShiftId: mongoose.Types.ObjectId;
  targetedShiftId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  requestedTo: mongoose.Types.ObjectId;
}

export const addSwaprequest = (
  swapRequestObj: SwapCreate,
): Promise<IShiftSwap> => {
  return new shiftSwapSchema(swapRequestObj).save();
};

export const findPendingSwap = async (
  requestedShiftId: string,
  targetedShiftId: string,
): Promise<IShiftSwap | null> => {
  return await shiftSwapSchema.findOne({
    requestedShiftId,
    targetedShiftId,
    status: "pending",
  });
};

export const getSwapShiftById = async (
  id: string,
): Promise<IShiftSwap | null> => {
  return shiftSwapSchema.findById(id);
};

export const updateSwapShift = async (
  shiftSwapId: string,
  status: ShiftSwapStatus,
) => {
  return shiftSwapSchema.findByIdAndUpdate(
    shiftSwapId,
    { status },
    { new: true },
  );
};

export const reviewSwapShift = async (
  shiftSwapId: string,
  status: ShiftSwapStatus,
  reviewedBy: mongoose.Types.ObjectId,
  reviewComment?: string,
) => {
  return shiftSwapSchema.findByIdAndUpdate(
    shiftSwapId,
    {
      status,
      reviewedBy,
      reviewedAt: new Date(),
      reviewComment,
    },
    { new: true },
  );
};

// Transactions only work on a replica set or mongos, not a standalone mongod.
// Check once and cache the result.
let transactionsSupported: boolean | undefined;

const supportsTransactions = async (): Promise<boolean> => {
  if (transactionsSupported !== undefined) return transactionsSupported;
  const db = mongoose.connection.db;
  if (!db) return false;
  const hello = await db.admin().command({ hello: 1 });
  transactionsSupported = Boolean(hello.setName) || hello.msg === "isdbgrid";
  return transactionsSupported;
};

// Fallback for standalone MongoDB: each update only applies if the shift
// still has the worker we read, so a concurrent change can't be overwritten.
const swapWorkersWithoutTransaction = async (
  requestedShiftId: string,
  targetedShiftId: string,
) => {
  const requestedShift = await shiftSchema.findById(requestedShiftId);
  const targetedShift = await shiftSchema.findById(targetedShiftId);
  if (!requestedShift || !targetedShift) {
    throw new AppError("One or both shifts no longer exist", 404);
  }
  const requestedWorkerId = requestedShift.workerId;
  const targetedWorkerId = targetedShift.workerId;

  const first = await shiftSchema.updateOne(
    { _id: requestedShiftId, workerId: requestedWorkerId },
    { $set: { workerId: targetedWorkerId } },
  );
  if (first.modifiedCount !== 1) {
    throw new AppError("Shift changed while swapping, please try again", 409);
  }

  const second = await shiftSchema.updateOne(
    { _id: targetedShiftId, workerId: targetedWorkerId },
    { $set: { workerId: requestedWorkerId } },
  );
  if (second.modifiedCount !== 1) {
    // Roll back the first update.
    await shiftSchema.updateOne(
      { _id: requestedShiftId, workerId: targetedWorkerId },
      { $set: { workerId: requestedWorkerId } },
    );
    throw new AppError("Shift changed while swapping, please try again", 409);
  }

  requestedShift.workerId = targetedWorkerId;
  targetedShift.workerId = requestedWorkerId;
  return { requestedShift, targetedShift };
};

export const swapWorkersBetweenShifts = async (
  requestedShiftId: string,
  targetedShiftId: string,
) => {
  if (!(await supportsTransactions())) {
    return swapWorkersWithoutTransaction(requestedShiftId, targetedShiftId);
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const requestedShift = await shiftSchema
      .findById(requestedShiftId)
      .session(session);
    const targetedShift = await shiftSchema
      .findById(targetedShiftId)
      .session(session);
    if (!requestedShift || !targetedShift) {
      throw new AppError("One or both shifts no longer exist", 404);
    }
    const requestedWorkerId = requestedShift.workerId;
    const targetedWorkerId = targetedShift.workerId;
    requestedShift.workerId = targetedWorkerId;
    targetedShift.workerId = requestedWorkerId;
    await requestedShift.save({ session });
    await targetedShift.save({ session });
    await session.commitTransaction();
    return { requestedShift, targetedShift };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
