import type { Course } from "./types.ts";

/** Weekday index 1..7 = Monday..Sunday (backend `daysOfWeek`). */
export const DAY_SHORT = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] as const;
export const DAY_LONG = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"] as const;

export const DAY_START = 7 * 60;
export const DAY_END = 22 * 60;

/** "18:30" -> 1110 */
export const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** 1110 -> "18:30" */
export const fmtMin = (m: number): string => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export const durText = (m: number): string => {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? `${h}h${r ? String(r).padStart(2, "0") : ""}` : `${r} phút`;
};

/** Start-time options 07:00..21:45 and end options after `start` up to 22:00, in 15-minute steps. */
export const startOptions = Array.from({ length: (DAY_END - DAY_START) / 15 }, (_, i) => DAY_START + i * 15);
export const endOptionsAfter = (start: number): number[] => {
  const out: number[] = [];
  for (let m = start + 15; m <= DAY_END; m += 15) out.push(m);
  return out;
};

export const daysText = (days?: number[] | null): string => (days && days.length ? [...days].sort().map((d) => DAY_SHORT[d - 1]).join(" · ") : "");

/** "T2 · T4 · 18:30–20:30" or "" when the course has no weekly pattern. */
export function scheduleText(c: Pick<Course, "daysOfWeek" | "startTime" | "endTime">): string {
  if (!c.daysOfWeek?.length || !c.startTime || !c.endTime) return "";
  return `${daysText(c.daysOfWeek)} · ${c.startTime}–${c.endTime}`;
}

/** Monday of the week containing `d`, at 00:00 local time. */
export function mondayOf(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

export const addDays = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

/** Local date as YYYY-MM-DD (not UTC, so Vietnam mornings do not slip to the previous day). */
export const isoDate = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const dmy = (d: Date): string => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

/** ISO week number (1..53) of the date. */
export function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - y0.getTime()) / 864e5 + 1) / 7);
}
