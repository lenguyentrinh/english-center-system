import { STUDENT_CLASS_IDS } from "./mock";
import type { ScheduleEvent, ScheduleRole } from "./types";

/** Teacher/admin see one teacher's staff events; student sees own class sessions plus private self-study. */
export function visibleEvents(all: ScheduleEvent[], role: ScheduleRole, teacherId: string): ScheduleEvent[] {
  if (role === "student") {
    return all.filter((e) => e.owner === "student" || (e.owner === "staff" && e.category !== "Cá nhân" && !!e.classId && STUDENT_CLASS_IDS.includes(e.classId)));
  }
  return all.filter((e) => e.owner === "staff" && e.teacherId === teacherId);
}
