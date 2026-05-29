import { apiClient } from "@/shared/api/client.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";
import type {
  BusinessRoleResponse,
  BusinessRoleUpsertPayload,
  RoleResponse,
  RoleUpsertPayload,
  UserEffectiveRolesResponse,
  UserSummaryResponse,
} from "./types.ts";

export const getUsers = async (): Promise<ApiResponse<UserSummaryResponse[]>> => {
  const { data } = await apiClient.get<ApiResponse<UserSummaryResponse[]>>("/users");
  return data;
};

export const getUserById = async (id: number): Promise<ApiResponse<UserSummaryResponse>> => {
  const { data } = await apiClient.get<ApiResponse<UserSummaryResponse>>(`/users/${id}`);
  return data;
};

export const getRoles = async (): Promise<ApiResponse<RoleResponse[]>> => {
  const { data } = await apiClient.get<ApiResponse<RoleResponse[]>>("/roles");
  return data;
};

export const getRoleById = async (id: number): Promise<ApiResponse<RoleResponse>> => {
  const { data } = await apiClient.get<ApiResponse<RoleResponse>>(`/roles/${id}`);
  return data;
};

export const createRole = async (payload: RoleUpsertPayload): Promise<ApiResponse<RoleResponse>> => {
  const { data } = await apiClient.post<ApiResponse<RoleResponse>>("/roles", payload);
  return data;
};

export const updateRole = async (
  id: number,
  payload: RoleUpsertPayload
): Promise<ApiResponse<RoleResponse>> => {
  const { data } = await apiClient.put<ApiResponse<RoleResponse>>(`/roles/${id}`, payload);
  return data;
};

export const deleteRole = async (id: number): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/roles/${id}`);
  return data;
};

export const getBusinessRoles = async (): Promise<ApiResponse<BusinessRoleResponse[]>> => {
  const { data } = await apiClient.get<ApiResponse<BusinessRoleResponse[]>>("/business-roles");
  return data;
};

export const getBusinessRoleById = async (
  id: number
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
  id: number,
  payload: BusinessRoleUpsertPayload
): Promise<ApiResponse<BusinessRoleResponse>> => {
  const { data } = await apiClient.put<ApiResponse<BusinessRoleResponse>>(`/business-roles/${id}`, payload);
  return data;
};

export const deleteBusinessRole = async (id: number): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/business-roles/${id}`);
  return data;
};

export const getUserEffectiveRoles = async (
  userId: number
): Promise<ApiResponse<UserEffectiveRolesResponse>> => {
  const { data } = await apiClient.get<ApiResponse<UserEffectiveRolesResponse>>(
    `/users/${userId}/roles`
  );
  return data;
};

export const assignRoleToUser = async (
  userId: number,
  roleId: number
): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.post<ApiResponse<null>>(`/users/${userId}/roles/${roleId}`);
  return data;
};

export const removeRoleFromUser = async (
  userId: number,
  roleId: number
): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/users/${userId}/roles/${roleId}`);
  return data;
};

export const assignBusinessRoleToUser = async (
  userId: number,
  businessRoleId: number
): Promise<ApiResponse<any[]>> => {
  const { data } = await apiClient.post<ApiResponse<any[]>>(
    `/users/${userId}/roles/business-roles/${businessRoleId}`
  );
  return data;
};

export const assignTeacherToCourse = async (
  courseId: number,
  teacherId: number
): Promise<ApiResponse<any>> => {
  const { data } = await apiClient.post<ApiResponse<any>>(`/courses/${courseId}/assign-teacher/${teacherId}`);
  return data;
};

export const removeBusinessRoleFromUser = async (
  userId: number,
  businessRoleId: number
): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(
    `/users/${userId}/roles/business-roles/${businessRoleId}`
  );
  return data;
};