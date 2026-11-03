import { addUtcDays, toUtcMidnight } from "./dateOnly";

// Monday 00:00 UTC to Sunday 23:59:59.999 UTC of the week containing `date`.
export const getWeekRange = (date: Date | string) => {
  const day = toUtcMidnight(date);
  const weekday = day.getUTCDay();
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday;

  const monday = addUtcDays(day, diffToMonday);
  const sunday = addUtcDays(monday, 6);
  sunday.setUTCHours(23, 59, 59, 999);

  return {
    weekStart: monday,
    weekEnd: sunday,
  };
};
