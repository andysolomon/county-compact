// Deterministic calendar. Day 0 = 1 January 1942. Real calendar months.

export interface CalendarDate {
  readonly year: number;
  readonly month: number; // 1–12
  readonly day: number; // 1–31
}

const EPOCH_UTC = Date.UTC(1942, 0, 1);
const MS_PER_DAY = 86_400_000;

export function dayOf(year: number, month: number, day: number): number {
  return Math.round((Date.UTC(year, month - 1, day) - EPOCH_UTC) / MS_PER_DAY);
}

export function dateOf(dayIndex: number): CalendarDate {
  const d = new Date(EPOCH_UTC + dayIndex * MS_PER_DAY);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

export function isMonthEnd(dayIndex: number): boolean {
  return dateOf(dayIndex).month !== dateOf(dayIndex + 1).month;
}

export function isQuarterEnd(dayIndex: number): boolean {
  const d = dateOf(dayIndex);
  return isMonthEnd(dayIndex) && d.month % 3 === 0;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export function formatDate(dayIndex: number, style: "short" | "long" = "short"): string {
  const d = dateOf(dayIndex);
  const m = style === "long" ? MONTHS_LONG[d.month - 1] : MONTHS[d.month - 1];
  return `${d.day} ${m} ${d.year}`;
}

export function formatMonth(dayIndex: number): string {
  const d = dateOf(dayIndex);
  return `${MONTHS_LONG[d.month - 1]} ${d.year}`;
}

export const CAMPAIGN_START_DAY = dayOf(1942, 2, 1);
export const CAMPAIGN_END_DAY = dayOf(1948, 12, 31);
