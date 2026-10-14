import type { Category } from "@/features/mock/common";

export type ClassStatus = "OPEN" | "ACTIVE" | "CLOSED";
export type DocType = "PDF" | "AUDIO" | "VIDEO" | "LINK";

export type ClassStudent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** attendance % */
  att: number;
  /** flashcards mastered % */
  fc: number;
  /** Word Rush best score */
  rush: number;
  last: string;
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
};

export type ClassItem = {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  room: string;
  scheduleText: string;
  startDate: string;
  endDate: string;
  status: ClassStatus;
  category: Category;
  students: ClassStudent[];
  docs: ClassDoc[];
  sessions: ClassSession[];
};

export type ClassDraft = {
  name: string;
  code: string;
  room: string;
  startDate: string;
  endDate: string;
  days: number[];
  startPeriod: number;
  periods: number;
};

export type SessionDraft = {
  date: string;
  startPeriod: number;
  periods: number;
  room: string;
  topic: string;
  docIds: string[];
};

export type DocDraft = {
  type: DocType;
  name: string;
  link: string;
  note: string;
  file: string;
  size: string;
};
