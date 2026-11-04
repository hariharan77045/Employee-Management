/** Formats a date as yyyy-MM-dd in local time. toISOString() would use UTC and can shift the day. */
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function daysFromToday(days: number): string {
  const today = new Date();
  return toDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + days));
}
