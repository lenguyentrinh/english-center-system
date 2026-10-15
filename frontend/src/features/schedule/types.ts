export type ScheduleEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string;
  title: string;
  /** Admin-defined category id ("" = none). Personal events (meetings, self-study) carry no category. */
  category: string;
  /** class = teaching/learning slot of a class; personal = private block (meeting, self-study...). */
  kind: "class" | "personal";
  /** Zoom/online link for online slots. */
  link?: string;
  meta?: string;
  teacherId?: string;
  classId?: string;
  sessionId?: string;
  owner: "staff" | "student";
  custom?: boolean;
};

export type ScheduleRole = "teacher" | "student" | "admin";
