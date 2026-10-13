export type CourseStatus = "OPEN" | "ACTIVE" | "CLOSED";

export type Course = {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  maxStudent: number;
  status: CourseStatus;
  minimumAge?: number | null;
  requiredEntryLevel?: string | null;
  prerequisitesRequired?: boolean | null;
  teacher?: { id: string; username?: string; fullName?: string } | null;
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
  teacherId?: string | null;
  availableRoleTeacher?: string | null;
};

export type Session = {
  id: string;
  sessionNo: number;
  title: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  topic: string;
};

export type CourseSummary = {
  id: string;
  code: string;
  name: string;
  availableRoleTeacher?: string | null;
};

export type ServerCourse = {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  maxStudent: number;
  status: CourseStatus;
  teacherId?: string | null;
  teacherFullName?: string | null;
  availableRoleTeacher?: Course["availableRoleTeacher"];
  minimumAge?: number | null;
  requiredEntryLevel?: string | null;
  prerequisitesRequired?: boolean | null;
};
