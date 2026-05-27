import { apiClient } from "@/shared/api/client.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";
import type { Course, UpsertCoursePayload } from "./types.ts";

export const getCourses = async (): Promise<ApiResponse<Course[]>> => {
  const { data } = await apiClient.get<ApiResponse<Course[]>>("/courses");
  return data;
};

export const getCourseById = async (id: number): Promise<ApiResponse<Course>> => {
  const { data } = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
  return data;
};

export const createCourse = async (
  payload: UpsertCoursePayload
): Promise<ApiResponse<Course>> => {
  const { data } = await apiClient.post<ApiResponse<Course>>("/courses", payload);
  return data;
};

export const updateCourse = async (
  id: number,
  payload: UpsertCoursePayload
): Promise<ApiResponse<Course>> => {
  const { data } = await apiClient.put<ApiResponse<Course>>(`/courses/${id}`, payload);
  return data;
};

export const deleteCourse = async (id: number): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/courses/${id}`);
  return data;
};