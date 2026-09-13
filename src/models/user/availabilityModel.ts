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

export const fetchAllAvailability = (): Promise<IAvailability[] | null> => {
  return availabilitySchema.find();
};

export const fetchAllAvailabilityByteam = (
  workerIds: string[],
): Promise<IAvailability[] | null> => {
  return availabilitySchema.find({
    workerId: { $in: workerIds },
  });
};

export const fetchAvailabilityByUserId = (
  workerId: string,
): Promise<IAvailability[] | null> => {
  return availabilitySchema.find({
    workerId,
  });
};

export const getAvailabilityByDay = (workerId: string, dayOfWeek: number) => {
  return availabilitySchema.findOne({
    workerId,
    dayOfWeek,
    type: "recurring",
  });
};

export const getAvailabilityByDate = (workerId: string, date: Date) => {
  return availabilitySchema.findOne({
    workerId,
    type: "specific",
    date,
  });
};

export const getAvailabilityById = (id: string) => {
  return availabilitySchema.findById(id);
};

export const updateAvailabilityById = (
  id: string,
  status: AvailabilityStatus,
) => {
  return availabilitySchema.findByIdAndUpdate(id, { status }, { new: true });
};

export const deleteAvailabilityById = (id: string) => {
  return availabilitySchema.findByIdAndDelete(id);
};
