/** Real-clock helpers (local time). Week 0 is the current real week, weeks start on Monday. */

const pad = (n: number) => String(n).padStart(2, "0");

export const toIso = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Parses YYYY-MM-DD as a local date (no timezone shift). */
export const fromIso = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addIsoDays = (iso: string, n: number): string => {
  const d = fromIso(iso);
  d.setDate(d.getDate() + n);
  return toIso(d);
};

/** Today as YYYY-MM-DD. */
export const nowDate = (): string => toIso(new Date());

/** Current local time as HH:MM. */
export const nowTime = (): string => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Now as "YYYY-MM-DD HH:MM" (sortable, same shape as `${date} ${time}`). */
export const nowIso = (): string => `${nowDate()} ${nowTime()}`;

/** Minutes since local midnight. */
export const nowMinutes = (): number => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

/** Monday (YYYY-MM-DD) of the week `weeksOffset` weeks from the current real week. */
export const weekStartIso = (weeksOffset = 0): string => {
  const d = new Date();
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - dow + weeksOffset * 7);
  return toIso(d);
};

/** Index 0..6 (Mon..Sun) of an ISO date, or the weekday of today. */
export const weekdayIndex = (iso: string = nowDate()): number => (fromIso(iso).getDay() + 6) % 7;

/** ISO-8601 week number of the week that starts on the given Monday (default: current week). */
export const isoWeekNo = (weekStart: string = weekStartIso(0)): number => {
  const d = fromIso(weekStart);
  // Thursday of this week decides the ISO year.
  d.setDate(d.getDate() + 3);
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const firstDow = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDow + 3);
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 864e5));
};

/** "12/10" style day-month label. */
export const dmLabel = (iso: string): string => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** "12/10 – 18/10" label of the week starting on the given Monday. */
export const weekRangeLabel = (weekStart: string): string => `${dmLabel(weekStart)} – ${dmLabel(addIsoDays(weekStart, 6))}`;
