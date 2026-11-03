// Date-only values (shift date, leave start/end, specific availability date)
// are all stored as UTC midnight. That's what Mongoose already does with a
// "YYYY-MM-DD" string, so everything that compares these dates must use UTC
// too, otherwise the server's timezone shifts the day.

export const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const toUtcMidnight = (value: Date | string): Date => {
  if (typeof value === "string" && DATE_ONLY_REGEX.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

export const addUtcDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};
