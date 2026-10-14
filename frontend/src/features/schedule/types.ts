export type ScheduleEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string;
  title: string;
  category: "IELTS" | "TOEIC" | "Giao tiếp" | "Cá nhân";
  meta?: string;
  teacherId?: string;
  classId?: string;
  sessionId?: string;
  owner: "staff" | "student";
  custom?: boolean;
};

export type ScheduleRole = "teacher" | "student" | "admin";

export type MockTeacher = { id: string; name: string; roleCode: string };
