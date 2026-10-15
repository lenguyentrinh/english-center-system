import { conflictPairs, toMinEvent, type MinEvent } from "./utils";
import type { ScheduleEvent, ScheduleRole } from "./types";

/** Teacher/admin see one teacher's staff events; a student sees the sessions of their own classes (already scoped by the class list). */
export function visibleEvents(all: ScheduleEvent[], role: ScheduleRole, teacherId: string): ScheduleEvent[] {
  if (role === "student") {
    return all.filter((e) => e.owner === "student" || (e.owner === "staff" && e.kind !== "personal" && !!e.classId));
  }
  return all.filter((e) => e.owner === "staff" && e.teacherId === teacherId);
}

/** Total teacher schedule conflicts this week (drives the red badge on the admin "Lịch giáo viên" nav item). */
export function countTeacherConflicts(all: ScheduleEvent[]): number {
  const byTeacher = new Map<string, MinEvent[]>();
  all
    .filter((e) => e.owner === "staff" && e.teacherId)
    .map(toMinEvent)
    .forEach((e) => byTeacher.set(e.teacherId!, [...(byTeacher.get(e.teacherId!) ?? []), e]));
  let n = 0;
  byTeacher.forEach((list) => (n += conflictPairs(list)));
  return n;
}
