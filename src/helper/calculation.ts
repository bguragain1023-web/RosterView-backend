export const calculateTotalHours = (
  startTime: string,
  endTime: string,
  breakMinutes: number = 0,
): number => {
  const [startHour = 0, startMin = 0] = startTime.split(":").map(Number);
  const [endHour = 0, endMins = 0] = endTime.split(":").map(Number);

  let startInMinutes = startHour * 60 + startMin;
  let endInMinutes = endHour * 60 + endMins;

  if (endInMinutes < startInMinutes) {
    endInMinutes += 24 * 60;
  }
  const totalWorkedMinutes = endInMinutes - startInMinutes - breakMinutes;

  if (totalWorkedMinutes < 0) return 0;

  return Number((totalWorkedMinutes / 60).toFixed(2));
};
