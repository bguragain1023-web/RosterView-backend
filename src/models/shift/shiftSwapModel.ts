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
