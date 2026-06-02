import { apiClient } from "@/shared/api/client.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";
import type { Course, UpsertCoursePayload } from "./types.ts";

function mapServerCourseToClient(server: any): Course {
  return {
    id: server.id,
    code: server.code,
    name: server.name,
    startDate: server.startDate,
    endDate: server.endDate,
    maxStudent: server.maxStudent,
    status: server.status,
    teacher: server.teacherId ? { id: server.teacherId, fullName: server.teacherFullName } : null,
    availableRoleTeacher: server.availableRoleTeacher ?? null,
    minimumAge: server.minimumAge ?? null,
    requiredEntryLevel: server.requiredEntryLevel ?? null,
    prerequisitesRequired: server.prerequisitesRequired ?? null,
  };
}

export const getCourses = async (): Promise<ApiResponse<Course[]>> => {
  const { data } = await apiClient.get<ApiResponse<any[]>>("/courses");
  // map data.data elements
  const mapped = data.data?.map(mapServerCourseToClient) ?? [];
  return { ...data, data: mapped } as ApiResponse<Course[]>;
};

export const getCourseById = async (id: number): Promise<ApiResponse<Course>> => {
  const { data } = await apiClient.get<ApiResponse<any>>(`/courses/${id}`);
  const mapped = data.data ? mapServerCourseToClient(data.data) : null;
  return { ...data, data: mapped } as ApiResponse<Course>;
};

export const createCourse = async (
  payload: UpsertCoursePayload
): Promise<ApiResponse<Course>> => {
  const { data } = await apiClient.post<ApiResponse<any>>("/courses", payload);
  const mapped = data.data ? mapServerCourseToClient(data.data) : null;
  return { ...data, data: mapped } as ApiResponse<Course>;
};

export const updateCourse = async (
  id: number,
  payload: UpsertCoursePayload
): Promise<ApiResponse<Course>> => {
  const { data } = await apiClient.put<ApiResponse<any>>(`/courses/${id}`, payload);
  const mapped = data.data ? mapServerCourseToClient(data.data) : null;
  return { ...data, data: mapped } as ApiResponse<Course>;
};

export const deleteCourse = async (id: number): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/courses/${id}`);
  return data;
};