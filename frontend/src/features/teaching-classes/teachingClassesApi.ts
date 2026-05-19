import { apiClient } from "@/shared/api/client.ts";
import type { TeachingClass, UpsertTeachingClassPayload } from "./types.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";

/* GET ALL */
export const getTeachingClasses = async (): Promise<ApiResponse<TeachingClass[]>> => {
  const { data } = await apiClient.get<ApiResponse<TeachingClass[]>>(
    "/teaching-classes"
  );
  return data;
};

/* GET BY ID */
export const getTeachingClassById = async (
  id: number
): Promise<ApiResponse<TeachingClass>> => {
  const { data } = await apiClient.get<ApiResponse<TeachingClass>>(
    `/teaching-classes/${id}`
  );
  return data;
};

/* CREATE */
export const createTeachingClass = async (
  payload: UpsertTeachingClassPayload
): Promise<ApiResponse<TeachingClass>> => {
  const { data } = await apiClient.post<ApiResponse<TeachingClass>>(
    "/teaching-classes",
    payload
  );
  return data;
};

/* UPDATE */
export const updateTeachingClass = async (
  id: number,
  payload: UpsertTeachingClassPayload
): Promise<ApiResponse<TeachingClass>> => {
  const { data } = await apiClient.put<ApiResponse<TeachingClass>>(
    `/teaching-classes/${id}`,
    payload
  );
  return data;
};

/* DELETE */
export const deleteTeachingClass = async (
  id: number
): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(
    `/teaching-classes/${id}`
  );
  return data;
};