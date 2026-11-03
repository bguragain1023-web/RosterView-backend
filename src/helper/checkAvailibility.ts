import {
  getAvailabilityByDate,
  getAvailabilityByDay,
} from "../models/user/availabilityModel";
import { toUtcMidnight } from "./dateOnly";

export const checkWorkerAvailability = async (
  workerId: string,
  date: Date | string,
): Promise<boolean> => {
  const availabilityDate = toUtcMidnight(date);

  const specificAvailability = await getAvailabilityByDate(
    workerId,
    availabilityDate,
  );

  if (specificAvailability) {
    return specificAvailability.status === "available";
  }

  const dayOfWeek = availabilityDate.getUTCDay();

  const recurringAvailability = await getAvailabilityByDay(workerId, dayOfWeek);
  if (recurringAvailability) {
    return recurringAvailability.status === "available";
  }

  return true;
};
