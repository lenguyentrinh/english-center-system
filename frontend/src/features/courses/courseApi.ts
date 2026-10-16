import { apiClient } from "@/shared/api/client.ts";
import { translateApiMessage } from "@/shared/api/error.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";
import type { Course, CourseStudent, ServerCourse, Session, StudentEnrollment, TeacherSchedule, UpsertCoursePayload } from "./types.ts";

export function mapServerCourseToClient(server: ServerCourse): Course {
  return {
    id: server.id,
    code: server.code,
    name: server.name,
    startDate: server.startDate,
    endDate: server.endDate,
    maxStudent: server.maxStudent,
    status: server.status,
    teacher: server.teacherId ? { id: server.teacherId, fullName: server.teacherFullName ?? undefined } : null,
    availableRoleTeacher: server.availableRoleTeacher ?? null,
    minimumAge: server.minimumAge ?? null,
    requiredEntryLevel: server.requiredEntryLevel ?? null,
    prerequisitesRequired: server.prerequisitesRequired ?? null,
    categoryId: server.categoryId ?? null,
    categoryName: server.categoryName ?? null,
    categoryColor: server.categoryColor ?? null,
    room: server.room ?? null,
    daysOfWeek: server.daysOfWeek ?? null,
    startTime: server.startTime ? server.startTime.slice(0, 5) : null,
    endTime: server.endTime ? server.endTime.slice(0, 5) : null,
    enrolledCount: server.enrolledCount ?? null,
  };
}

export const getCourses = async (): Promise<ApiResponse<Course[]>> => {
  const { data } = await apiClient.get<ApiResponse<ServerCourse[]>>("/courses");
  // map data.data elements
  const mapped = data.data?.map(mapServerCourseToClient) ?? [];
  return { ...data, data: mapped } as ApiResponse<Course[]>;
};

export const getCourseById = async (id: string): Promise<ApiResponse<Course>> => {
  const { data } = await apiClient.get<ApiResponse<ServerCourse>>(`/courses/${id}`);
  const mapped = data.data ? mapServerCourseToClient(data.data) : null;
  return { ...data, data: mapped } as ApiResponse<Course>;
};

export const createCourse = async (
  payload: UpsertCoursePayload
): Promise<ApiResponse<Course>> => {
  const { data } = await apiClient.post<ApiResponse<ServerCourse>>("/courses", payload);
  const mapped = data.data ? mapServerCourseToClient(data.data) : null;
  return { ...data, data: mapped } as ApiResponse<Course>;
};

export const updateCourse = async (
  id: string,
  payload: UpsertCoursePayload
): Promise<ApiResponse<Course>> => {
  const { data } = await apiClient.put<ApiResponse<ServerCourse>>(`/courses/${id}`, payload);
  const mapped = data.data ? mapServerCourseToClient(data.data) : null;
  return { ...data, data: mapped } as ApiResponse<Course>;
};

export const deleteCourse = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/courses/${id}`);
  return data;
};

export const getSessionsByCourseId = async (courseId: string): Promise<ApiResponse<Session[]>> => {
  const { data } = await apiClient.get<ApiResponse<Session[]>>(`/courses/${courseId}/sessions`);
  return data;
};

export const getCourseStudents = async (courseId: string, status: "ACTIVE" | "CANCELLED" | "ALL" = "ACTIVE"): Promise<CourseStudent[]> => {
  const { data } = await apiClient.get<ApiResponse<CourseStudent[]>>(`/courses/${courseId}/students`, { params: { status } });
  return data.data ?? [];
};

export const enrollStudent = async (courseId: string, userId: string, force = false): Promise<CourseStudent> => {
  const { data } = await apiClient.post<ApiResponse<CourseStudent>>(`/courses/${courseId}/students`, { userId, force });
  return data.data;
};

export const cancelEnrollment = async (courseId: string, userId: string): Promise<void> => {
  await apiClient.delete(`/courses/${courseId}/students/${userId}`);
};

export const getUserEnrollments = async (userId: string): Promise<Array<Omit<StudentEnrollment, "course"> & { course: Course }>> => {
  const { data } = await apiClient.get<ApiResponse<StudentEnrollment[]>>(`/users/${userId}/enrollments`);
  return (data.data ?? []).map((e) => ({ ...e, course: mapServerCourseToClient(e.course) }));
};

/** Weekly sessions per teacher. from/to are YYYY-MM-DD; omit teacherId for every teacher (admin). */
export const getCourseSchedule = async (params: { from: string; to: string; teacherId?: string }): Promise<TeacherSchedule[]> => {
  const { data } = await apiClient.get<ApiResponse<TeacherSchedule[]>>("/courses/schedule", { params });
  return data.data ?? [];
};

/** The 409 "schedule conflict" message when a save clashes with the teacher's other classes, else null. */
export function conflictMessage(err: unknown): string | null {
  const e = err as { response?: { status?: number; data?: { message?: string } } };
  const msg = e?.response?.data?.message;
  return e?.response?.status === 409 && msg && /conflict/i.test(msg) ? translateApiMessage(msg) ?? msg : null;
}
