export type TeachingClassStatus = "OPEN" | "ACTIVE" | "CLOSED";

export type TeachingClass = {
  id: number;
  code: string;
  name: string;
  courseId: number;
  startDate: string;
  endDate: string;
  maxStudent: number;
  status: TeachingClassStatus;
};

export type UpsertTeachingClassPayload = {
  code: string;
  name: string;
  courseId: number;
  startDate: string;
  endDate: string;
  maxStudent: number;
  status: TeachingClassStatus;
};