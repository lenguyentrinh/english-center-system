import { MOCK_NOW } from "@/features/mock/common";
import type { ClassSession, DocType } from "./types";

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

export const ROOMS = ["P.102", "P.105", "P.201", "P.203", "Hội trường", "Online · Zoom"];
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

export const TEACHER_NAMES: Record<string, string> = { t1: "Cô Lan Anh", t2: "Lê Trinh" };

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

export function weekDates(): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(MOCK_NOW.weekStart, i));
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
  const now = `${MOCK_NOW.date} ${MOCK_NOW.time}`;
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
