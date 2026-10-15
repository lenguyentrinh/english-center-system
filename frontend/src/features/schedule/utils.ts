import { isoWeekNo, nowMinutes, weekStartIso, weekdayIndex as todayIndex } from "@/shared/utils/now";
import type { ScheduleEvent } from "./types";

export function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export const H0 = 420;
export const H1 = 1320;
export const PXM = 56 / 60;
/** Weekday index (0 = Monday) of today / minutes since midnight now. Read at call time so they never go stale. */
export const nowDay = (): number => todayIndex();
export const nowMin = (): number => nowMinutes();

export const WEEK_DAYS = [
  { k: "T2", label: "Thứ Hai" },
  { k: "T3", label: "Thứ Ba" },
  { k: "T4", label: "Thứ Tư" },
  { k: "T5", label: "Thứ Năm" },
  { k: "T6", label: "Thứ Sáu" },
  { k: "T7", label: "Thứ Bảy" },
  { k: "CN", label: "Chủ Nhật" },
] as const;

export const TIMES = Array.from({ length: (H1 - H0) / 15 + 1 }, (_, i) => H0 + i * 15);

export const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const dur = (m: number) => {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? `${h}h${r ? String(r).padStart(2, "0") : ""}` : `${r} phút`;
};
/** Weekday index of a date inside the current real week, or -1 for any other week. */
export const dayIndex = (date: string) => (weekOf(date) === 0 ? dowOf(date) : -1);
export const dayLabel = (d: number) => `${WEEK_DAYS[d].label}, ${addIsoDays(weekStartIso(0), d).slice(8)}/${addIsoDays(weekStartIso(0), d).slice(5, 7)}`;

/** `d` is the weekday index inside the current week, or -1 for events of any other week. */
export type MinEvent = ScheduleEvent & { d: number; s: number; e: number };
export const toMinEvent = (ev: ScheduleEvent): MinEvent => ({ ...ev, d: dayIndex(ev.date), s: toMin(ev.start), e: toMin(ev.end) });

/* ---------- multi-week helpers (week 0 = the current week, negative = past) ---------- */
const DAY_MS = 864e5;
export const addIsoDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
/** Week offset of a date relative to the current week. */
export const weekOf = (iso: string) => Math.floor((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${weekStartIso(0)}T00:00:00Z`)) / (7 * DAY_MS));
/** 0 = Monday. */
export const dowOf = (iso: string) => (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7;
export const weekStartOf = (w: number) => addIsoDays(weekStartIso(0), w * 7);
export const weekDaysOf = (w: number) => WEEK_DAYS.map((d, i) => ({ k: d.k, label: d.label, date: addIsoDays(weekStartOf(w), i) }));
/** ISO week number of the displayed week (week 0 = the current real week). */
export const weekNoOf = (w: number) => isoWeekNo(weekStartOf(w));
const dm = (iso: string) => `${iso.slice(8)}/${iso.slice(5, 7)}`;
export const weekRangeOf = (w: number) => `${dm(weekStartOf(w))} – ${dm(addIsoDays(weekStartOf(w), 6))}`;
/** First weekday index that is not in the past for week `w` (7 = whole week is past, -1... 0 = nothing past). */
export const firstOpenDay = (w: number) => (w < 0 ? 7 : w > 0 ? 0 : nowDay());

/** Event placed in a specific week: `w` week offset, `d` weekday index. */
export type WeekEvent = ScheduleEvent & { w: number; d: number; s: number; e: number };
export const toWeekEvent = (ev: ScheduleEvent): WeekEvent => ({ ...ev, w: weekOf(ev.date), d: dowOf(ev.date), s: toMin(ev.start), e: toMin(ev.end) });

export function layoutDay(evs: Array<{ id: string; s: number; e: number }>) {
  const out: Record<string, { lane: number; n: number }> = {};
  const sorted = [...evs].sort((a, b) => a.s - b.s || b.e - a.e);
  let cluster: Array<{ id: string; s: number; e: number }> = [];
  let end = -1;
  const flush = () => {
    const lanes: number[] = [];
    const lane: Record<string, number> = {};
    cluster.forEach((ev) => {
      let i = lanes.findIndex((x) => x <= ev.s);
      if (i < 0) {
        i = lanes.length;
        lanes.push(ev.e);
      } else lanes[i] = ev.e;
      lane[ev.id] = i;
    });
    cluster.forEach((ev) => (out[ev.id] = { lane: lane[ev.id], n: lanes.length }));
    cluster = [];
  };
  sorted.forEach((ev) => {
    if (cluster.length && ev.s >= end) {
      flush();
      end = -1;
    }
    cluster.push(ev);
    end = Math.max(end, ev.e);
  });
  flush();
  return out;
}

/** Free [start,end) windows on day d, from now to the end of the day (07:00-22:00). */
export function freeWindows(evs: Array<{ d: number; s: number; e: number }>, d: number, today = nowDay()): [number, number][] {
  if (d < today) return [];
  const start = d === today ? Math.max(H0, Math.ceil(nowMin() / 15) * 15) : H0;
  const iv = evs
    .filter((e) => e.d === d)
    .map((e) => [e.s, e.e] as [number, number])
    .sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  let cur = start;
  iv.forEach(([s, e]) => {
    if (s > cur) out.push([cur, s]);
    cur = Math.max(cur, e);
  });
  if (H1 > cur) out.push([cur, H1]);
  return out;
}

export function conflictMap(evs: Array<{ id: string; title: string; d: number; s: number; e: number }>) {
  const map: Record<string, string[]> = {};
  evs.forEach((a) =>
    evs.forEach((b) => {
      if (a.id !== b.id && a.d === b.d && a.s < b.e && b.s < a.e) (map[a.id] ||= []).push(b.title);
    }),
  );
  return map;
}

/** Number of overlapping event pairs (one pair = one conflict). */
export function conflictPairs(evs: MinEvent[]): number {
  let n = 0;
  evs.forEach((a, i) =>
    evs.slice(i + 1).forEach((b) => {
      if (a.d >= 0 && a.d === b.d && a.s < b.e && b.s < a.e) n++;
    }),
  );
  return n;
}
