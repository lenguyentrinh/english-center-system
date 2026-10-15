import { apiClient } from "@/shared/api/client.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";
import type { CourseSummary } from "@/features/courses/types";
import type {
  BusinessRoleResponse,
  BusinessRoleUpsertPayload,
  RoleResponse,
  RoleUpsertPayload,
  UserEffectiveRolesResponse,
  UserStatus,
  UserSummaryResponse,
} from "./types.ts";

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

export const getRoleById = async (id: string): Promise<ApiResponse<RoleResponse>> => {
  const { data } = await apiClient.get<ApiResponse<RoleResponse>>(`/roles/${id}`);
  return data;
};

export const createRole = async (payload: RoleUpsertPayload): Promise<ApiResponse<RoleResponse>> => {
  const { data } = await apiClient.post<ApiResponse<RoleResponse>>("/roles", payload);
  return data;
};

export const updateRole = async (
  id: string,
  payload: RoleUpsertPayload
): Promise<ApiResponse<RoleResponse>> => {
  const { data } = await apiClient.put<ApiResponse<RoleResponse>>(`/roles/${id}`, payload);
  return data;
};

export const deleteRole = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/roles/${id}`);
  return data;
};

export const getBusinessRoles = async (): Promise<ApiResponse<BusinessRoleResponse[]>> => {
  const { data } = await apiClient.get<ApiResponse<BusinessRoleResponse[]>>("/business-roles");
  return data;
};

export const getBusinessRoleById = async (
  id: string
): Promise<ApiResponse<BusinessRoleResponse>> => {
  const { data } = await apiClient.get<ApiResponse<BusinessRoleResponse>>(`/business-roles/${id}`);
  return data;
};

export const createBusinessRole = async (
  payload: BusinessRoleUpsertPayload
): Promise<ApiResponse<BusinessRoleResponse>> => {
  const { data } = await apiClient.post<ApiResponse<BusinessRoleResponse>>("/business-roles", payload);
  return data;
};

export const updateBusinessRole = async (
  id: string,
  payload: BusinessRoleUpsertPayload
): Promise<ApiResponse<BusinessRoleResponse>> => {
  const { data } = await apiClient.put<ApiResponse<BusinessRoleResponse>>(`/business-roles/${id}`, payload);
  return data;
};

export const deleteBusinessRole = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/business-roles/${id}`);
  return data;
};

export const getUserEffectiveRoles = async (
  userId: string
): Promise<ApiResponse<UserEffectiveRolesResponse>> => {
  const { data } = await apiClient.get<ApiResponse<UserEffectiveRolesResponse>>(
    `/users/${userId}/roles`
  );
  return data;
};

export const assignRoleToUser = async (
  userId: string,
  roleId: string
): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.post<ApiResponse<null>>(`/users/${userId}/roles/${roleId}`);
  return data;
};

export const removeRoleFromUser = async (
  userId: string,
  roleId: string
): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/users/${userId}/roles/${roleId}`);
  return data;
};

export const assignBusinessRoleToUser = async (
  userId: string,
  businessRoleId: string
): Promise<ApiResponse<CourseSummary[]>> => {
  const { data } = await apiClient.post<ApiResponse<CourseSummary[]>>(
    `/users/${userId}/roles/business-roles/${businessRoleId}`
  );
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

export const removeBusinessRoleFromUser = async (
  userId: string,
  businessRoleId: string
): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(
    `/users/${userId}/roles/business-roles/${businessRoleId}`
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
