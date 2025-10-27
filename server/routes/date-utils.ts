/**
 * Formats a date with ordinal suffix (e.g., "Oct 29th", "Nov 1st", "Dec 23rd")
 */
export function formatDateWithOrdinal(date: Date): string {
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  return `${month} ${day}${suffix}`;
}

/**
 * Returns the ordinal suffix for a day (st, nd, rd, th)
 */
function getOrdinalSuffix(day: number): string {
  if (day === 1 || day === 21 || day === 31) return 'st';
  if (day === 2 || day === 22) return 'nd';
  if (day === 3 || day === 23) return 'rd';
  return 'th';
}

/**
 * Returns tomorrow's date
 */
export function getTomorrow(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}
