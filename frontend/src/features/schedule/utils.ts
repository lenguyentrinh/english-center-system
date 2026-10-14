import { MOCK_NOW } from "@/features/mock/common";
import type { ScheduleEvent } from "./types";

export function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export const H0 = 420;
export const H1 = 1320;
export const PXM = 56 / 60;
export const NOW_MIN = toMin(MOCK_NOW.time);
export const NOW_DAY = 1;

export const WEEK_DAYS = [
  { k: "T2", date: "2026-10-12", label: "Thứ Hai" },
  { k: "T3", date: "2026-10-13", label: "Thứ Ba" },
  { k: "T4", date: "2026-10-14", label: "Thứ Tư" },
  { k: "T5", date: "2026-10-15", label: "Thứ Năm" },
  { k: "T6", date: "2026-10-16", label: "Thứ Sáu" },
  { k: "T7", date: "2026-10-17", label: "Thứ Bảy" },
  { k: "CN", date: "2026-10-18", label: "Chủ Nhật" },
] as const;

export const TIMES = Array.from({ length: (H1 - H0) / 15 + 1 }, (_, i) => H0 + i * 15);

export const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const dur = (m: number) => {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? `${h}h${r ? String(r).padStart(2, "0") : ""}` : `${r} phút`;
};
export const dayIndex = (date: string) => WEEK_DAYS.findIndex((d) => d.date === date);
export const dayLabel = (d: number) => `${WEEK_DAYS[d].label}, ${WEEK_DAYS[d].date.slice(8)}/10`;

export type MinEvent = ScheduleEvent & { d: number; s: number; e: number };
export const toMinEvent = (ev: ScheduleEvent): MinEvent => ({ ...ev, d: dayIndex(ev.date), s: toMin(ev.start), e: toMin(ev.end) });

export function layoutDay(evs: MinEvent[]) {
  const out: Record<string, { lane: number; n: number }> = {};
  const sorted = [...evs].sort((a, b) => a.s - b.s || b.e - a.e);
  let cluster: MinEvent[] = [];
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
export function freeWindows(evs: MinEvent[], d: number): [number, number][] {
  if (d < NOW_DAY) return [];
  const start = d === NOW_DAY ? Math.ceil(NOW_MIN / 15) * 15 : H0;
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

export function conflictMap(evs: MinEvent[]) {
  const map: Record<string, string[]> = {};
  evs.forEach((a) =>
    evs.forEach((b) => {
      if (a.id !== b.id && a.d === b.d && a.s < b.e && b.s < a.e) (map[a.id] ||= []).push(b.title);
    }),
  );
  return map;
}
