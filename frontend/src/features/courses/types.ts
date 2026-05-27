export type CourseStatus = "OPEN" | "ACTIVE" | "CLOSED";

export type Course = {
  id: number;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  maxStudent: number;
  status: CourseStatus;
};

export type UpsertCoursePayload = {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  maxStudent: number;
  status: CourseStatus;
};