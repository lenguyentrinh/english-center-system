import { apiClient } from "@/shared/api/client.ts";
import { buildRolesQuery } from "@/shared/utils/role";
import type { ApiResponse } from "@/shared/types/api-response.type";

export type TeacherItem = { id: number; fullName?: string | null; salary?: number | null };

export const getTeachers = async (role?: string): Promise<ApiResponse<TeacherItem[]>> => {
  const url = role ? `/teachers?role=${encodeURIComponent(role)}` : "/teachers";
  const { data } = await apiClient.get<ApiResponse<any[]>>(url);
  const mapped = data.data?.map((t: any) => ({ id: t.id, fullName: t.fullName, salary: t.salary ?? null })) ?? [];
  return { ...data, data: mapped } as ApiResponse<TeacherItem[]>;
};

export const getTeacherById = async (id: number): Promise<ApiResponse<TeacherItem>> => {
  const { data } = await apiClient.get<ApiResponse<any>>(`/teachers/${id}`);
  const mapped = data.data ? { id: data.data.id, fullName: data.data.fullName, salary: data.data.salary ?? null } : null;
  return { ...data, data: mapped } as ApiResponse<TeacherItem>;
};

export const getTeacherByUserId = async (userId: number): Promise<ApiResponse<TeacherItem>> => {
  const { data } = await apiClient.get<ApiResponse<any>>(`/teachers/by-user/${userId}`);
  const mapped = data.data ? { id: data.data.id, fullName: data.data.fullName, salary: data.data.salary ?? null } : null;
  return { ...data, data: mapped } as ApiResponse<TeacherItem>;
};

export const putTeacherByUserId = async (userId: number, payload: { salary?: number | null }) => {
  const body = { salary: payload.salary ?? null };
  const { data } = await apiClient.put<ApiResponse<any>>(`/teachers/by-user/${userId}`, body);
  return data;
};

export const getCoursesByTeacherUserId = async (userId: number, roles?: string[]): Promise<ApiResponse<any[]>> => {
  const qs = buildRolesQuery(roles);
  const { data } = await apiClient.get<ApiResponse<any[]>>(`/teachers/by-user/${userId}/courses${qs}`);
  return data as ApiResponse<any[]>;
};