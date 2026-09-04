import mongoose from "mongoose";
import shiftSwapSchema, { IShiftSwap } from "./shiftSwapSchema";

interface SwapCreate {
  requestedShiftId: mongoose.Types.ObjectId;
  targetedShiftId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  requestedTo: mongoose.Types.ObjectId;
}

export const addSwaprequest = async (
  swapRequestObj: SwapCreate,
): Promise<IShiftSwap> => {
  return new shiftSwapSchema(swapRequestObj).save();
};
