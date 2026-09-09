import mongoose from "mongoose";
import shiftSwapSchema, {
  IShiftSwap,
  ShiftSwapStatus,
} from "./shiftSwapSchema";

interface SwapCreate {
  requestedShiftId: mongoose.Types.ObjectId;
  targetedShiftId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  requestedTo: mongoose.Types.ObjectId;
}

export const addSwaprequest = async (
  swapRequestObj: SwapCreate,
): Promise<IShiftSwap> => {
  try {
    return new shiftSwapSchema(swapRequestObj).save();
  } catch (error) {
    console.error("SWAP SAVE ERROR:", error);
    throw error;
  }
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

export const swapWorkersBetweenShifts = async (
  requestedShiftId: string,
  targetedShiftId: string,
) => {
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
