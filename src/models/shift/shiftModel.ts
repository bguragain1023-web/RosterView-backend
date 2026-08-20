import shiftSchema, { IShift } from "./shiftSchema";

export const addNewShift = (shiftObj: IShift): Promise<IShift> => {
  return new shiftSchema(shiftObj).save();
};
