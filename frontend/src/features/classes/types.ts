export type ClassStatus = "OPEN" | "ACTIVE" | "CLOSED";
export type DocType = "PDF" | "AUDIO" | "VIDEO" | "LINK";

export type ClassStudent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** Attendance % from marked sessions (null = nothing marked yet). */
  att: number | null;
  /** Flashcards mastered % (null = no data: there is no per-student progress API yet). */
  fc: number | null;
  /** Word Rush best score (null = no data yet). */
  rush: number | null;
  /** Last activity label ("—" when unknown). */
  last: string;
  /** Date (YYYY-MM-DD) the student joined the class; sessions before it do not count for attendance. */
  joined?: string;
};

export type ClassDoc = {
  id: string;
  name: string;
  type: DocType;
  size: string;
  url: string;
  by: string;
  date: string;
  note: string;
};

export type ClassSession = {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  startPeriod: number;
  periods: number;
  /** HH:MM */
  start: string;
  end: string;
  room: string;
  topic: string;
  no: number;
  docIds: string[];
  /** Zoom/online link (required when the room is online). */
  link?: string;
  /** studentId -> present. Students without an entry are "not marked yet" and do not count for attendance. */
  attendance?: Record<string, boolean>;
  /** Homework assigned after the session: flashcard decks / Word Rush sets. */
  homework?: Array<{ kind: "deck" | "set"; id: string }>;
};

export type ClassItem = {
  id: string;
  name: string;
  code: string;
  /** Auth user id of the teacher who owns the class (the signed-in user for their own classes). */
  teacherId: string;
  teacherName?: string;
  /** True for classes created in this browser only (the API only lets admins create courses). */
  local?: boolean;
  room: string;
  scheduleText: string;
  startDate: string;
  endDate: string;
  status: ClassStatus;
  /** Admin-defined category id ("" = none). */
  category: string;
  /** Max students. */
  capacity: number;
  /** Active enrolment count (from the API; students[] is only filled for the owning teacher). */
  enrolled?: number;
  students: ClassStudent[];
  docs: ClassDoc[];
  sessions: ClassSession[];
};

export type ClassDraft = {
  name: string;
  room: string;
  startDate: string;
  days: number[];
  startPeriod: number;
  periods: number;
  /** Course length in weeks, counted from `startDate`. */
  weeks: number;
  category: string;
  link: string;
};

export type SessionDraft = {
  date: string;
  startPeriod: number;
  periods: number;
  room: string;
  topic: string;
  docIds: string[];
  link: string;
};

export type DocDraft = {
  type: DocType;
  name: string;
  link: string;
  note: string;
  file: string;
  size: string;
};
