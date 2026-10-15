export type CourseStatus = "OPEN" | "ACTIVE" | "CLOSE";

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
  categoryId?: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  room?: string | null;
  /** 1 = Monday .. 7 = Sunday */
  daysOfWeek?: number[] | null;
  /** "HH:mm" */
  startTime?: string | null;
  endTime?: string | null;
  enrolledCount?: number | null;
  /** Legacy, no longer used to qualify teachers. */
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
  categoryId?: string | null;
  room?: string | null;
  daysOfWeek?: number[] | null;
  startTime?: string | null;
  endTime?: string | null;
  /** Save even when the teacher has a schedule conflict (admin confirmed). */
  force?: boolean;
  minimumAge?: number | null;
  requiredEntryLevel?: string | null;
  prerequisitesRequired?: boolean | null;
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
  categoryId?: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  room?: string | null;
  daysOfWeek?: number[] | null;
  startTime?: string | null;
  endTime?: string | null;
  enrolledCount?: number | null;
  minimumAge?: number | null;
  requiredEntryLevel?: string | null;
  prerequisitesRequired?: boolean | null;
};

export type CourseStudent = {
  enrollmentId: string;
  userId: string;
  fullName: string | null;
  username: string;
  email: string | null;
  phone: string | null;
  userStatus: string | null;
  enrollDate: string | null;
  enrollmentStatus: string;
};

export type StudentEnrollment = {
  enrollmentId: string;
  enrollDate: string | null;
  enrollmentStatus: string;
  course: ServerCourse;
};

export type ScheduleOccurrence = {
  date: string;
  startTime: string;
  endTime: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  room: string | null;
  categoryId: string | null;
  conflict: boolean;
};

export type TeacherSchedule = {
  teacherId: string;
  userId: string;
  teacherFullName: string | null;
  roles: string[];
  categoryIds: string[];
  courseCodes: string[];
  conflictCount: number;
  occurrences: ScheduleOccurrence[];
};
