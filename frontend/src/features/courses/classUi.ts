import type { Course, CourseStatus, UpsertCoursePayload } from "./types.ts";

export const STATUS_TAG: Record<CourseStatus, { label: string; bg: string; fg: string }> = {
  OPEN: { label: "Đang tuyển sinh", bg: "#d1fae5", fg: "#065f46" },
  ACTIVE: { label: "Đang học", bg: "#dbeafe", fg: "#1e40af" },
  CLOSE: { label: "Đã đóng", bg: "#f1f5f9", fg: "#475569" },
};

export const fmtDate = (iso?: string | null) => (iso ? iso.split("-").reverse().join("/") : "—");

/** Full upsert payload from an existing course, with optional overrides (status toggle, teacher change). */
export function toPayload(c: Course, patch: Partial<UpsertCoursePayload> = {}): UpsertCoursePayload {
  return {
    code: c.code,
    name: c.name,
    startDate: c.startDate,
    endDate: c.endDate,
    maxStudent: c.maxStudent,
    status: c.status,
    teacherId: c.teacher?.id ?? null,
    categoryId: c.categoryId ?? null,
    room: c.room ?? null,
    daysOfWeek: c.daysOfWeek ?? null,
    startTime: c.startTime ?? null,
    endTime: c.endTime ?? null,
    minimumAge: c.minimumAge ?? 0,
    requiredEntryLevel: c.requiredEntryLevel ?? "A1",
    prerequisitesRequired: c.prerequisitesRequired ?? false,
    ...patch,
  };
}
