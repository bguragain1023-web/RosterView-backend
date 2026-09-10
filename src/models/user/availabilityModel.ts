import mongoose from "mongoose";
import availabilitySchema, {
  AvailabilityStatus,
  AvailabilityType,
  IAvailability,
} from "./availabilitySchema";

export interface AddAvailabilityPayload {
  workerId: mongoose.Types.ObjectId;
  type: AvailabilityType;
  dayOfWeek?: number;
  date?: Date;
  status: AvailabilityStatus;
}

export const addAvailabilty = (
  availabilityObj: AddAvailabilityPayload,
): Promise<IAvailability> => {
  return new availabilitySchema(availabilityObj).save();
};

export const getAvailabilityByDay = (workerId: string, dayOfWeek: number) => {
  return availabilitySchema.findOne({
    workerId,
    dayOfWeek,
    type: "recurring",
  });
};
