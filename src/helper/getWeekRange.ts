export const getWeekRange = (date: Date) => {
  const currentDate = new Date(date);

  const day = currentDate.getDay();

  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    weekStart: monday,
    weekEnd: sunday,
  };
};
