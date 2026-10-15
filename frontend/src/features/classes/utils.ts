import { nowDate, nowTime, weekStartIso } from "@/shared/utils/now";
import type { ClassItem, ClassSession, ClassStudent, DocType } from "./types";

export const PERIODS: ReadonlyArray<readonly [number, string, string]> = [
  [1, "07:00", "07:45"],
  [2, "07:50", "08:35"],
  [3, "08:45", "09:30"],
  [4, "09:35", "10:20"],
  [5, "10:25", "11:10"],
  [6, "13:00", "13:45"],
  [7, "13:50", "14:35"],
  [8, "14:45", "15:30"],
  [9, "15:35", "16:20"],
  [10, "17:45", "18:30"],
  [11, "18:30", "19:15"],
  [12, "19:15", "20:00"],
  [13, "20:00", "20:45"],
];

/** The one room name that means "online": a Zoom link is required for it. Other rooms are free text. */
export const ONLINE_ROOM = "Online · Zoom";
export const isOnlineRoom = (room: string) => /online|zoom/i.test(room);

/** Room suggestions come from the classes that already exist, plus the online room. */
export function roomSuggestions(classes: Array<Pick<ClassItem, "room">>): string[] {
  return [...new Set([...classes.map((c) => c.room.trim()).filter(Boolean), ONLINE_ROOM])];
}

export const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export const DOC_STYLE: Record<DocType, { bg: string; text: string; action: string }> = {
  PDF: { bg: "#fee2e2", text: "#b91c1c", action: "Tải xuống" },
  AUDIO: { bg: "#ecfeff", text: "#155e75", action: "Nghe" },
  VIDEO: { bg: "#fef3c7", text: "#92400e", action: "Xem" },
  LINK: { bg: "#dbeafe", text: "#1e40af", action: "Mở link" },
};

export const STATUS_STYLE = {
  OPEN: { bg: "#d1fae5", text: "#065f46" },
  ACTIVE: { bg: "#dbeafe", text: "#1e40af" },
  CLOSED: { bg: "#e2e8f0", text: "#334155" },
} as const;

export function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fmtDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} phút`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

/** Slot of a session = start of first period -> end of last period. */
export function periodRange(startPeriod: number, count: number) {
  const first = PERIODS.find((p) => p[0] === startPeriod) ?? PERIODS[0];
  const lastNo = Math.min(13, startPeriod + count - 1);
  const last = PERIODS.find((p) => p[0] === lastNo) ?? PERIODS[PERIODS.length - 1];
  return { start: first[1], end: last[2], lastPeriod: lastNo, minutes: toMin(last[2]) - toMin(first[1]) };
}

export function maxPeriods(startPeriod: number) {
  return Math.max(1, Math.min(4, 14 - startPeriod));
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** The 7 dates (Mon..Sun) of the current real week. */
export function weekDates(): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStartIso(0), i));
}

/** 0 = Monday */
export function weekdayIndex(iso: string): number {
  return (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7;
}

export function fmtDM(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function fmtDMY(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function dayLabel(iso: string): string {
  const i = weekdayIndex(iso);
  return `${i === 6 ? "CN" : `T${i + 2}`} ${fmtDM(iso)}`;
}

export type SessionState = "done" | "live" | "upcoming";

export function sessionState(s: Pick<ClassSession, "date" | "start" | "end">): SessionState {
  const now = `${nowDate()} ${nowTime()}`;
  if (`${s.date} ${s.end}` <= now) return "done";
  if (`${s.date} ${s.start}` <= now) return "live";
  return "upcoming";
}

export const SESSION_STATE_LABEL: Record<SessionState, { label: string; bg: string; text: string }> = {
  done: { label: "Đã học", bg: "#e2e8f0", text: "#334155" },
  live: { label: "Đang học", bg: "#d1fae5", text: "#065f46" },
  upcoming: { label: "Sắp tới", bg: "#dbeafe", text: "#1e40af" },
};

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[parts.length - 1]?.[0] ?? "?").toUpperCase();
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function scheduleText(days: number[], startPeriod: number, periods: number): string {
  const r = periodRange(startPeriod, periods);
  const d = [...days].sort((a, b) => a - b).map((i) => WEEKDAY_LABELS[i]).join(" · ");
  return `${d} · Tiết ${startPeriod}–${r.lastPeriod} · ${r.start}–${r.end}`;
}

/** First period number and count whose slots fall inside [start, end]; 0/0 when the time does not line up. */
export function periodsOf(start: string, end: string): { startPeriod: number; periods: number } {
  const s = toMin(start);
  const e = toMin(end);
  const ps = PERIODS.filter(([, a, b]) => toMin(a) >= s - 5 && toMin(b) <= e + 15).map((p) => p[0]);
  return ps.length ? { startPeriod: ps[0], periods: ps.length } : { startPeriod: 0, periods: 0 };
}

/* ---------- attendance (derived from the marks the teacher took, never invented) ---------- */

/** Marked roll only: true/false when the teacher took attendance, undefined when not marked yet. */
export function markOf(session: ClassSession, student: ClassStudent): boolean | undefined {
  return session.attendance?.[student.id];
}

/** Present = marked present. Unmarked students count as absent in the roll view, but not in the percentage. */
export function wasPresent(session: ClassSession, student: ClassStudent): boolean {
  return markOf(session, student) === true;
}

export type Dot = "present" | "absent" | "later";

/** Sessions that already started, count for this student (on/after the day they joined) and have a mark. */
function countedSessions(cls: ClassItem, student: ClassStudent): ClassSession[] {
  return cls.sessions
    .filter((s) => sessionState(s) !== "upcoming" && (!student.joined || s.date >= student.joined) && markOf(s, student) !== undefined)
    .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
}

export function attendanceOf(cls: ClassItem, student: ClassStudent) {
  const done = countedSessions(cls, student);
  const present = done.filter((s) => wasPresent(s, student)).length;
  const pct = done.length ? Math.round((present / done.length) * 100) : null;
  const next = cls.sessions.filter((s) => sessionState(s) === "upcoming").sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`))[0];
  const dots: Dot[] = [...done.slice(-5).map((s): Dot => (wasPresent(s, student) ? "present" : "absent")), ...(next ? (["later"] as Dot[]) : [])];
  return { pct, present, total: done.length, dots };
}

/** Student needs attention: low attendance or has not been reviewing the vocabulary (unknown values never flag). */
export function studentFlag(pct: number | null, fc: number | null): "low-att" | "low-fc" | null {
  if (pct !== null && pct < 85) return "low-att";
  if (fc !== null && fc < 55) return "low-fc";
  return null;
}

/** "Tiết 11–13" for a slot, or "—" if it does not line up with the period table. */
export function periodLabel(start: string, end: string): string {
  const s = toMin(start);
  const e = toMin(end);
  const ps = PERIODS.filter(([, a, b]) => toMin(a) >= s - 5 && toMin(b) <= e + 15).map((p) => p[0]);
  if (!ps.length) return "—";
  return ps.length > 1 ? `Tiết ${ps[0]}–${ps[ps.length - 1]}` : `Tiết ${ps[0]}`;
}
