import {
  getWorkerShiftsForWeek,
  getWorkerShiftsInRange,
} from "../models/shift/shiftModel";
import { addUtcDays, toUtcMidnight } from "./dateOnly";
import { getWeekRange } from "./getWeekRange";

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

const toMinutes = (time: string): number => {
  const [hour = 0, min = 0] = time.split(":").map(Number);
  return hour * 60 + min;
};

export const calculateTotalHours = (
  startTime: string,
  endTime: string,
  breakMinutes: number = 0,
): number => {
  const startInMinutes = toMinutes(startTime);
  let endInMinutes = toMinutes(endTime);

  if (endInMinutes < startInMinutes) {
    endInMinutes += 24 * 60;
  }
  const totalWorkedMinutes = endInMinutes - startInMinutes - breakMinutes;

  if (totalWorkedMinutes < 0) return 0;

  return Number((totalWorkedMinutes / 60).toFixed(2));
};

// Absolute start/end of a shift in ms. An end time earlier than the start
// time means the shift runs past midnight into the next day.
const getShiftInterval = (
  date: Date | string,
  startTime: string,
  endTime: string,
) => {
  const dayStart = toUtcMidnight(date).getTime();
  const start = dayStart + toMinutes(startTime) * MINUTE_MS;
  let end = dayStart + toMinutes(endTime) * MINUTE_MS;
  if (end < start) end += DAY_MS;
  return { start, end };
};

// Checks the day before and after as well, so overnight shifts that spill
// across midnight are caught in both directions.
export const hasShiftConflict = async (
  workerId: string,
  date: Date | string,
  startTime: string,
  endTime: string,
  excludeShiftId?: string,
): Promise<boolean> => {
  const day = toUtcMidnight(date);
  const nearbyShifts = await getWorkerShiftsInRange(
    workerId,
    addUtcDays(day, -1),
    addUtcDays(day, 2),
    excludeShiftId,
  );

  const newShift = getShiftInterval(day, startTime, endTime);

  return nearbyShifts.some((shift) => {
    const existing = getShiftInterval(
      shift.date,
      shift.startTime,
      shift.endTime,
    );
    return newShift.start < existing.end && newShift.end > existing.start;
  });
};

export const calculateWeeklyHours = async (
  workerId: string,
  date: Date | string,
  excludeShiftId?: string,
) => {
  const { weekStart, weekEnd } = getWeekRange(date);

  const shifts = await getWorkerShiftsForWeek(
    workerId,
    weekStart,
    weekEnd,
    excludeShiftId,
  );

  return shifts.reduce((total, shift) => total + shift.totalHours, 0);
};
