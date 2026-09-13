import {
  getAvailabilityByDate,
  getAvailabilityByDay,
} from "../models/user/availabilityModel";

export const checkWorkerAvailability = async (
  workerId: string,
  date: Date,
): Promise<boolean> => {
  const availabilityDate = new Date(date);
  availabilityDate.setHours(0, 0, 0, 0);
  console.log("workerId:", workerId);
  console.log("availabilityDate:", availabilityDate);

  const specificAvailability = await getAvailabilityByDate(
    workerId,
    availabilityDate,
  );
  console.log("specific:", specificAvailability);

  if (specificAvailability) {
    return specificAvailability.status === "available";
  }

  const dayOfWeek = availabilityDate.getDay();
  console.log("dayOfWeek:", dayOfWeek);

  const recurringAvailability = await getAvailabilityByDay(workerId, dayOfWeek);
  console.log("recurring:", recurringAvailability);
  if (recurringAvailability) {
    return recurringAvailability.status === "available";
  }

  return true;
};
