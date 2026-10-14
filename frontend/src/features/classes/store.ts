import { useSyncExternalStore } from "react";
import { INITIAL_CLASSES } from "./mock";
import type { ClassDoc, ClassDraft, ClassItem, ClassSession, ClassStudent, DocDraft, SessionDraft } from "./types";
import { MOCK_NOW, MOCK_TEACHER } from "@/features/mock/common";
import { fmtDM, periodRange, scheduleText, weekDates, weekdayIndex, TEACHER_NAMES } from "./utils";
import { addEvents, removeEventsBySession } from "@/features/schedule/scheduleStore";
import type { ScheduleEvent } from "@/features/schedule/scheduleStore";

let state: ClassItem[] = INITIAL_CLASSES;
let seq = 100;
const listeners = new Set<() => void>();

function set(next: ClassItem[]) {
  state = next;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
function patch(id: string, fn: (c: ClassItem) => ClassItem) {
  set(state.map((c) => (c.id === id ? fn(c) : c)));
}
const nid = (p: string) => `${p}${++seq}`;

export function useClasses(): ClassItem[] {
  return useSyncExternalStore(subscribe, () => state);
}

export function useClass(id: string | undefined): ClassItem | undefined {
  return useClasses().find((c) => c.id === id);
}

function sessionEvent(c: ClassItem, s: ClassSession): ScheduleEvent {
  return {
    id: `ev-${s.id}`,
    date: s.date,
    start: s.start,
    end: s.end,
    title: c.name,
    category: c.category,
    meta: `${s.room} · Buổi ${s.no}`,
    teacherId: c.teacherId,
    classId: c.id,
    sessionId: s.id,
    owner: "staff",
  };
}

function categoryOf(name: string): ClassItem["category"] {
  if (/ielts/i.test(name)) return "IELTS";
  if (/toeic/i.test(name)) return "TOEIC";
  return "Giao tiếp";
}

export function createClass(draft: ClassDraft): string {
  const id = nid("c");
  const r = periodRange(draft.startPeriod, draft.periods);
  let no = 1;
  const sessions: ClassSession[] = weekDates()
    .filter((d) => draft.days.includes(weekdayIndex(d)) && (!draft.startDate || d >= draft.startDate) && (!draft.endDate || d <= draft.endDate))
    .map((date) => ({
      id: nid("ses"),
      date,
      startPeriod: draft.startPeriod,
      periods: draft.periods,
      start: r.start,
      end: r.end,
      room: draft.room,
      topic: "",
      no: no++,
      docIds: [],
    }));
  const cls: ClassItem = {
    id,
    name: draft.name.trim(),
    code: draft.code.trim() || id.toUpperCase(),
    teacherId: MOCK_TEACHER.id,
    room: draft.room,
    scheduleText: scheduleText(draft.days, draft.startPeriod, draft.periods),
    startDate: draft.startDate,
    endDate: draft.endDate,
    status: "OPEN",
    category: categoryOf(draft.name),
    students: [],
    docs: [],
    sessions,
  };
  set([...state, cls]);
  if (sessions.length) addEvents(sessions.map((s) => sessionEvent(cls, s)));
  return id;
}

export function addSession(classId: string, draft: SessionDraft) {
  const c = state.find((x) => x.id === classId);
  if (!c) return;
  const r = periodRange(draft.startPeriod, draft.periods);
  const s: ClassSession = {
    id: nid("ses"),
    date: draft.date,
    startPeriod: draft.startPeriod,
    periods: draft.periods,
    start: r.start,
    end: r.end,
    room: draft.room,
    topic: draft.topic.trim(),
    no: Math.max(0, ...c.sessions.map((x) => x.no)) + 1,
    docIds: draft.docIds,
  };
  patch(classId, (x) => ({ ...x, sessions: [...x.sessions, s] }));
  addEvents([sessionEvent(c, s)]);
}

export function removeSession(classId: string, sessionId: string) {
  patch(classId, (c) => ({ ...c, sessions: c.sessions.filter((s) => s.id !== sessionId) }));
  removeEventsBySession(sessionId);
}

export function attachDoc(classId: string, sessionId: string, docId: string) {
  patch(classId, (c) => ({
    ...c,
    sessions: c.sessions.map((s) => (s.id === sessionId && !s.docIds.includes(docId) ? { ...s, docIds: [...s.docIds, docId] } : s)),
  }));
}

export function detachDoc(classId: string, sessionId: string, docId: string) {
  patch(classId, (c) => ({
    ...c,
    sessions: c.sessions.map((s) => (s.id === sessionId ? { ...s, docIds: s.docIds.filter((d) => d !== docId) } : s)),
  }));
}

export function addDoc(classId: string, draft: DocDraft) {
  const doc: ClassDoc = {
    id: nid("d"),
    name: draft.name.trim(),
    type: draft.type,
    size: draft.type === "LINK" ? "—" : draft.size,
    url: draft.type === "LINK" ? draft.link.trim() : "",
    by: TEACHER_NAMES[MOCK_TEACHER.id] ?? MOCK_TEACHER.name,
    date: fmtDM(MOCK_NOW.date),
    note: draft.note.trim(),
  };
  patch(classId, (c) => ({ ...c, docs: [doc, ...c.docs] }));
}

export function removeDoc(classId: string, docId: string) {
  patch(classId, (c) => ({
    ...c,
    docs: c.docs.filter((d) => d.id !== docId),
    sessions: c.sessions.map((s) => ({ ...s, docIds: s.docIds.filter((x) => x !== docId) })),
  }));
}

export function avgAttendance(students: ClassStudent[]): number | null {
  if (!students.length) return null;
  return Math.round((students.reduce((a, s) => a + s.att, 0) / students.length) * 10) / 10;
}
