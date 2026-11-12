import { apiClient } from "@/shared/api/client.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";
import type { RoleCode, RoleResponse, UserStatus, UserSummaryResponse } from "./types.ts";

export const getUsers = async (): Promise<ApiResponse<UserSummaryResponse[]>> => {
  const { data } = await apiClient.get<ApiResponse<UserSummaryResponse[]>>("/users");
  return data;
};

export const getUserById = async (id: string): Promise<ApiResponse<UserSummaryResponse>> => {
  const { data } = await apiClient.get<ApiResponse<UserSummaryResponse>>(`/users/${id}`);
  return data;
};

export const getRoles = async (): Promise<ApiResponse<RoleResponse[]>> => {
  const { data } = await apiClient.get<ApiResponse<RoleResponse[]>>("/roles");
  return data;
};

/** Gives the user exactly one role, replacing the previous one. */
export const changeUserRole = async (userId: string, role: RoleCode): Promise<ApiResponse<UserSummaryResponse>> => {
  const { data } = await apiClient.put<ApiResponse<UserSummaryResponse>>(`/users/${userId}/role`, { role });
  return data;
};

export const assignTeacherToCourse = async (
  courseId: string,
  teacherId: string,
  force = false
): Promise<ApiResponse<unknown>> => {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    `/courses/${courseId}/assign-teacher/${teacherId}`,
    null,
    force ? { params: { force: true } } : undefined
  );
  return data;
};

export type UserCreatePayload = {
  username: string;
  password: string;
  email: string;
  fullName?: string;
  phone?: string;
  status: UserStatus;
  role: RoleCode;
};

export type UserUpdatePayload = {
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  status?: UserStatus;
};

export const createUser = async (payload: UserCreatePayload): Promise<ApiResponse<UserSummaryResponse>> => {
  const { data } = await apiClient.post<ApiResponse<UserSummaryResponse>>("/users", payload);
  return data;
};

export const updateUser = async (
  id: string,
  payload: UserUpdatePayload
): Promise<ApiResponse<UserSummaryResponse>> => {
  const { data } = await apiClient.put<ApiResponse<UserSummaryResponse>>(`/users/${id}`, payload);
  return data;
};
