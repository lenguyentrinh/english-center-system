export type CourseStatus = "OPEN" | "ACTIVE" | "CLOSED";

export type Course = {
  id: number;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  maxStudent: number;
  status: CourseStatus;
  minimumAge?: number | null;
  requiredEntryLevel?: string | null;
  prerequisitesRequired?: boolean | null;
  teacher?: { id: number; username?: string; fullName?: string } | null;
  availableRoleTeacher?:
    | "TEACHER"
    | "TEACHER_IELTS_6"
    | "TEACHER_IELTS_7"
    | "TEACHER_IELTS_8"
    | "TEACHER_TOEIC_650"
    | "TEACHER_TOEIC_750"
    | "TEACHER_TOEIC_850"
    | null;
};

export type UpsertCoursePayload = {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  maxStudent: number;
  status: CourseStatus;
  teacherId?: number | null;
  availableRoleTeacher?: string | null;
};