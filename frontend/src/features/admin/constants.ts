import type { BusinessRoleCode, RoleCode } from "./types.ts";

export const roleCodeOptions: { label: string; value: RoleCode }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "TEACHER", label: "Teacher" },
  { value: "STUDENT", label: "Student" },
  { value: "TEACHER_IELTS_6", label: "IELTS Teacher 6.0" },
  { value: "TEACHER_IELTS_7", label: "IELTS Teacher 7.0" },
  { value: "TEACHER_IELTS_8", label: "IELTS Teacher 8.0" },
  { value: "TEACHER_TOEIC_650", label: "TOEIC Teacher 650+" },
  { value: "TEACHER_TOEIC_750", label: "TOEIC Teacher 750+" },
  { value: "TEACHER_TOEIC_850", label: "TOEIC Teacher 850+" },
];

export const businessRoleCodeOptions: { label: string; value: BusinessRoleCode }[] = [
  { value: "TOEIC_TEACHING_INTERMEDIATE", label: "Toeic Teaching Intermediate" },
  { value: "TOEIC_TEACHING_ADVANCED", label: "Toeic Teaching Advanced" },
  { value: "IELTS_TEACHING_INTERMEDIATE", label: "Ielts Teaching Intermediate" },
  { value: "IELTS_TEACHING_ADVANCED", label: "Ielts Teaching Advanced" },
  { value: "ENGLISH_COMMUNICATION_BASIC", label: "English Communication Basic" },
  { value: "ENGLISH_COMMUNICATION_ADVANCED", label: "English Communication Advanced" },
];

export const statusBadgeClass: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  INACTIVE: "bg-amber-100 text-amber-800",
  LOCKED: "bg-rose-100 text-rose-800",
};