export function getCurrentMonthDetails(): {
  currentMonth: number;
  totalDaysInMonth: number;
  firstDayOfMonthTimestamp: number;
  lastDayOfMonthTimestamp: number;
} {
  // Get current date
  const currentDate: Date = new Date();

  // Get current month (0-indexed, so January is 0)
  const currentMonth: number = currentDate.getMonth() + 1; // Adding 1 to make it 1-indexed

  // Get total days in current month
  const totalDaysInMonth: number = new Date(
    currentDate.getFullYear(),
    currentMonth,
    0,
  ).getDate();

  // Get timestamp of the first day of the month
  const firstDayOfMonthTimestamp: number = new Date(
    currentDate.getFullYear(),
    currentMonth - 1,
    1,
  ).getTime();

  // Get timestamp of the last day of the month
  const lastDayOfMonthTimestamp: number = new Date(
    currentDate.getFullYear(),
    currentMonth - 1,
    totalDaysInMonth,
  ).getTime();

  return {
    currentMonth,
    totalDaysInMonth,
    firstDayOfMonthTimestamp,
    lastDayOfMonthTimestamp,
  };
}

export function getTimestampOfFirstDayOfYear(year: number): number {
  // January is month 0
  return new Date(year, 0, 1).getTime();
}

export function getTimestampOfLastDayOfYear(year: number): number {
  // December is month 11
  return new Date(year, 11, 31).getTime();
}
