import { apiClient } from "@/shared/api/client.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";

export type TeacherItem = { id: number; fullName?: string | null };

export const getTeachers = async (): Promise<ApiResponse<TeacherItem[]>> => {
  const { data } = await apiClient.get<ApiResponse<any[]>>("/teachers");
  const mapped = data.data?.map((t: any) => ({ id: t.id, fullName: t.fullName })) ?? [];
  return { ...data, data: mapped } as ApiResponse<TeacherItem[]>;
};

export const getTeacherById = async (id: number): Promise<ApiResponse<TeacherItem>> => {
  const { data } = await apiClient.get<ApiResponse<any>>(`/teachers/${id}`);
  const mapped = data.data ? { id: data.data.id, fullName: data.data.fullName } : null;
  return { ...data, data: mapped } as ApiResponse<TeacherItem>;
};