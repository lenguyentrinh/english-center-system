import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { getCourseStudents, getCourses, getUserEnrollments } from "@/features/courses/courseApi";
import { scheduleText as courseScheduleText } from "@/features/courses/scheduleUi";
import type { Course, CourseStudent } from "@/features/courses/types";
import { getTeacherByUserId } from "@/features/teachers/teachersApi";
import { getStoredEvents } from "@/features/schedule/scheduleStore";
import type { ScheduleEvent } from "@/features/schedule/types";
import { nowDate } from "@/shared/utils/now";
import type { ClassDoc, ClassDraft, ClassItem, ClassSession, ClassStatus, ClassStudent, DocDraft, SessionDraft } from "./types";
import { addDays, attendanceOf, fmtDM, periodRange, periodsOf, scheduleText, toMin, weekdayIndex } from "./utils";

/*
 * Class data comes from three places:
 *  - api:     the signed-in teacher's courses / the signed-in student's enrolled courses (real backend). Their sessions are
 *             derived from the course's weekly pattern; students come from GET /courses/{id}/students (teacher only).
 *  - local:   classes the teacher created in this browser (the API only lets admins create courses). Memory only.
 *  - overlay: edits made to the sessions/documents of an API class (topic, attendance, documents, homework, extra
 *             sessions). There is no backend for these yet, so they live in memory and reset on reload.
 * Everything starts empty.
 */
type Overlay = { sessions: ClassSession[]; docs: ClassDoc[] };

let api: ClassItem[] = [];
let local: ClassItem[] = [];
let overlays: Record<string, Overlay> = {};
let snapshot: ClassItem[] = [];
let seq = 0;
const listeners = new Set<() => void>();

const nid = (p: string) => `${p}${Date.now().toString(36)}${++seq}`;

function rebuild() {
  snapshot = [...api.map((c) => (overlays[c.id] ? { ...c, sessions: overlays[c.id].sessions, docs: overlays[c.id].docs } : c)), ...local];
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Apply `fn` to a class, wherever it lives. Students always come from the API and are never edited here. */
function patch(id: string, fn: (c: ClassItem) => ClassItem) {
  const base = snapshot.find((c) => c.id === id);
  if (!base) return;
  const next = fn(base);
  if (base.local) local = local.map((c) => (c.id === id ? next : c));
  else overlays = { ...overlays, [id]: { sessions: next.sessions, docs: next.docs } };
  rebuild();
}

function setApiClasses(next: ClassItem[]) {
  if (JSON.stringify(next) === JSON.stringify(api)) return;
  api = next;
  rebuild();
}

/* ---------- API -> ClassItem ---------- */
const STATUS: Record<Course["status"], ClassStatus> = { OPEN: "OPEN", ACTIVE: "ACTIVE", CLOSE: "CLOSED" };

/** Dated sessions of a course's weekly pattern between its start and end dates (backend days: 1 = Monday). */
function deriveSessions(c: Course): ClassSession[] {
  if (!c.daysOfWeek?.length || !c.startTime || !c.endTime || !c.startDate || !c.endDate) return [];
  const p = periodsOf(c.startTime, c.endTime);
  const out: ClassSession[] = [];
  for (let d = c.startDate, no = 1; d <= c.endDate && no <= 400; d = addDays(d, 1)) {
    if (!c.daysOfWeek.includes(weekdayIndex(d) + 1)) continue;
    out.push({
      id: `${c.id}@${d}`,
      date: d,
      startPeriod: p.startPeriod,
      periods: p.periods,
      start: c.startTime,
      end: c.endTime,
      room: c.room ?? "",
      topic: `Buổi ${no}`,
      no,
      docIds: [],
    });
    no++;
  }
  return out;
}

function fromCourse(c: Course, o: { teacherId: string; students: ClassStudent[] }): ClassItem {
  return {
    id: c.id,
    name: c.name,
    code: c.code,
    teacherId: o.teacherId,
    teacherName: c.teacher?.fullName,
    room: c.room ?? "",
    scheduleText: courseScheduleText(c) || "Chưa có lịch",
    startDate: c.startDate,
    endDate: c.endDate,
    status: STATUS[c.status] ?? "OPEN",
    category: c.categoryId ?? "",
    capacity: c.maxStudent,
    enrolled: c.enrolledCount ?? o.students.length,
    students: o.students,
    docs: [],
    sessions: deriveSessions(c),
  };
}

const toStudent = (s: CourseStudent): ClassStudent => ({
  id: s.userId,
  name: s.fullName || s.username,
  email: s.email ?? "",
  phone: s.phone ?? "",
  att: null,
  fc: null,
  rush: null,
  last: "—",
  joined: s.enrollDate ?? undefined,
});

/** Fetches the signed-in user's classes and feeds the store. Safe to call from every consumer (queries are shared). */
function useApiClasses() {
  const { user, isTeacher } = useAuth();
  const isStudent = !!user && !isTeacher && user.roles.includes("STUDENT");
  const userId = user?.id ?? "";

  const teacherQ = useQuery({
    queryKey: ["classes", "teacher-profile", userId],
    queryFn: () => getTeacherByUserId(userId).then((r) => r.data),
    enabled: !!userId && isTeacher,
    retry: false,
  });
  const coursesQ = useQuery({
    queryKey: ["classes", "courses"],
    queryFn: () => getCourses().then((r) => r.data ?? []),
    enabled: !!userId && isTeacher,
  });
  const enrollQ = useQuery({
    queryKey: ["classes", "enrollments", userId],
    queryFn: () => getUserEnrollments(userId),
    enabled: !!userId && isStudent,
  });

  const mine = useMemo(() => {
    if (isTeacher) {
      const tid = teacherQ.data?.id;
      return tid ? (coursesQ.data ?? []).filter((c) => c.teacher?.id === tid) : [];
    }
    if (isStudent) return (enrollQ.data ?? []).filter((e) => e.enrollmentStatus === "ACTIVE").map((e) => e.course);
    return [];
  }, [isTeacher, isStudent, teacherQ.data, coursesQ.data, enrollQ.data]);

  const studentQs = useQueries({
    queries: mine.map((c) => ({
      queryKey: ["classes", "students", c.id],
      queryFn: () => getCourseStudents(c.id),
      enabled: isTeacher,
    })),
  });
  const studentsKey = studentQs.map((q) => q.dataUpdatedAt).join(",");

  const items = useMemo(
    () =>
      mine.map((c, i) =>
        fromCourse(c, {
          teacherId: isTeacher ? userId : (c.teacher?.id ?? ""),
          students: (studentQs[i]?.data ?? []).map(toStudent),
        }),
      ),
    // studentQs is a new array every render; studentsKey tracks real changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mine, isTeacher, isStudent, userId, studentsKey],
  );

  useEffect(() => {
    setApiClasses(items);
  }, [items]);
}

/** The signed-in user's own classes: a teacher's courses (+ classes created here) or a student's enrolled courses. */
export function useClasses(): ClassItem[] {
  useApiClasses();
  return useSyncExternalStore(subscribe, () => snapshot);
}

export function useClass(id: string | undefined): ClassItem | undefined {
  return useClasses().find((c) => c.id === id);
}

export const getClasses = () => snapshot;

/** Calendar events of every class session (kind "class"). Class sessions are the single source of the class calendar. */
export function classEvents(classes: ClassItem[]): ScheduleEvent[] {
  return classes.flatMap((c) =>
    c.sessions.map((s) => ({
      id: `ev-${s.id}`,
      date: s.date,
      start: s.start,
      end: s.end,
      title: c.name,
      category: c.category,
      kind: "class" as const,
      meta: `${s.room || "Chưa có phòng"} · Buổi ${s.no}`,
      link: s.link,
      teacherId: c.teacherId,
      classId: c.id,
      sessionId: s.id,
      owner: "staff" as const,
    })),
  );
}

/* ---------- conflicts ---------- */
export type Slot = { date: string; start: string; end: string };

/** Teacher events (class sessions + own blocks) that overlap any of the slots (titles, de-duplicated). */
export function findConflicts(teacherId: string, slots: Slot[], ignoreSessionId?: string): string[] {
  const mine = [...classEvents(snapshot), ...getStoredEvents()].filter((e) => e.owner === "staff" && e.teacherId === teacherId && e.sessionId !== ignoreSessionId);
  const out = new Set<string>();
  slots.forEach((s) => {
    mine.forEach((e) => {
      if (e.date === s.date && toMin(e.start) < toMin(s.end) && toMin(s.start) < toMin(e.end)) out.add(`${e.title} · ${fmtDM(e.date)} ${e.start}–${e.end}`);
    });
  });
  return [...out];
}

/** Dates of the sessions a new class would get: `weeks` x number of weekdays, starting at startDate. */
export function planSessionDates(startDate: string, days: number[], weeks: number): string[] {
  const total = weeks * days.length;
  const out: string[] = [];
  for (let i = 0; out.length < total && i < weeks * 7 + 7; i++) {
    const d = addDays(startDate, i);
    if (days.includes(weekdayIndex(d))) out.push(d);
  }
  return out;
}

/* ---------- classes ---------- */
const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join("")
    .slice(0, 8);

/** Short unique class code derived from the name (e.g. "IELTS 6.0 Starter" -> IELTS60S). */
export function makeClassCode(name: string): string {
  const base = slug(name) || "LOP";
  let code = base;
  for (let i = 2; snapshot.some((c) => c.code === code); i++) code = `${base}${i}`;
  return code;
}

/** Creates a class that exists only in this browser (the API lets only admins create courses). */
export function createClass(draft: ClassDraft, owner: { id: string; name: string }): string {
  const id = nid("local-");
  const r = periodRange(draft.startPeriod, draft.periods);
  const dates = planSessionDates(draft.startDate, draft.days, draft.weeks);
  const sessions: ClassSession[] = dates.map((date, i) => ({
    id: nid("ses"),
    date,
    startPeriod: draft.startPeriod,
    periods: draft.periods,
    start: r.start,
    end: r.end,
    room: draft.room,
    topic: `Buổi ${i + 1}`,
    no: i + 1,
    docIds: [],
    link: draft.link.trim() || undefined,
  }));
  const cls: ClassItem = {
    id,
    name: draft.name.trim(),
    code: makeClassCode(draft.name),
    teacherId: owner.id,
    teacherName: owner.name,
    local: true,
    room: draft.room,
    scheduleText: scheduleText(draft.days, draft.startPeriod, draft.periods),
    startDate: draft.startDate,
    endDate: dates[dates.length - 1] ?? draft.startDate,
    status: "OPEN",
    category: draft.category,
    capacity: 15,
    enrolled: 0,
    students: [],
    docs: [],
    sessions,
  };
  local = [...local, cls];
  rebuild();
  return id;
}

/* ---------- sessions ---------- */
export function addSession(classId: string, draft: SessionDraft) {
  const c = snapshot.find((x) => x.id === classId);
  if (!c) return;
  const r = periodRange(draft.startPeriod, draft.periods);
  const no = Math.max(0, ...c.sessions.map((x) => x.no)) + 1;
  const s: ClassSession = {
    id: nid("ses"),
    date: draft.date,
    startPeriod: draft.startPeriod,
    periods: draft.periods,
    start: r.start,
    end: r.end,
    room: draft.room,
    topic: draft.topic.trim() || `Buổi ${no}`,
    no,
    docIds: draft.docIds,
    link: draft.link.trim() || undefined,
  };
  patch(classId, (x) => ({ ...x, sessions: [...x.sessions, s] }));
}

/** Copy one session of a class onto another date (used by "Sao chép từ tuần trước"). */
export function copySession(classId: string, sessionId: string, date: string): boolean {
  const c = snapshot.find((x) => x.id === classId);
  const src = c?.sessions.find((s) => s.id === sessionId);
  if (!c || !src) return false;
  const no = Math.max(0, ...c.sessions.map((x) => x.no)) + 1;
  const s: ClassSession = { ...src, id: nid("ses"), date, no, topic: `Buổi ${no}`, attendance: undefined, homework: undefined };
  patch(classId, (x) => ({ ...x, sessions: [...x.sessions, s] }));
  return true;
}

export function removeSession(classId: string, sessionId: string) {
  patch(classId, (c) => ({ ...c, sessions: c.sessions.filter((s) => s.id !== sessionId) }));
}

export function updateSessionTopic(classId: string, sessionId: string, topic: string) {
  patch(classId, (c) => ({ ...c, sessions: c.sessions.map((s) => (s.id === sessionId ? { ...s, topic } : s)) }));
}

export function setAttendance(classId: string, sessionId: string, studentId: string, present: boolean) {
  patch(classId, (c) => ({
    ...c,
    sessions: c.sessions.map((s) => (s.id === sessionId ? { ...s, attendance: { ...(s.attendance ?? {}), [studentId]: present } } : s)),
  }));
}

export function addHomework(classId: string, sessionId: string, hw: { kind: "deck" | "set"; id: string }) {
  patch(classId, (c) => ({
    ...c,
    sessions: c.sessions.map((s) =>
      s.id === sessionId && !(s.homework ?? []).some((h) => h.kind === hw.kind && h.id === hw.id) ? { ...s, homework: [...(s.homework ?? []), hw] } : s,
    ),
  }));
}

export function removeHomework(classId: string, sessionId: string, hw: { kind: "deck" | "set"; id: string }) {
  patch(classId, (c) => ({
    ...c,
    sessions: c.sessions.map((s) => (s.id === sessionId ? { ...s, homework: (s.homework ?? []).filter((h) => !(h.kind === hw.kind && h.id === hw.id)) } : s)),
  }));
}

/* ---------- documents ---------- */
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

export function addDoc(classId: string, draft: DocDraft, author: string) {
  const doc: ClassDoc = {
    id: nid("d"),
    name: draft.name.trim(),
    type: draft.type,
    size: draft.type === "LINK" ? "—" : draft.size,
    url: draft.type === "LINK" ? draft.link.trim() : "",
    by: author,
    date: fmtDM(nowDate()),
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

/* ---------- derived numbers ---------- */
/** Class attendance computed from the rolls the teacher marked; null when nothing was marked yet. */
export function classAttendance(c: ClassItem): number | null {
  const pcts = c.students.map((s) => attendanceOf(c, s).pct).filter((p): p is number => p !== null);
  if (!pcts.length) return null;
  return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
}
