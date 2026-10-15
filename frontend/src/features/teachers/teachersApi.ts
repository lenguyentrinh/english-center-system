import { apiClient } from "@/shared/api/client.ts";
import { buildRolesQuery } from "@/shared/utils/role";
import type { ApiResponse } from "@/shared/types/api-response.type";
import type { CourseSummary } from "@/features/courses/types";

export type TeacherItem = {
  id: string;
  userId?: string | null;
  fullName?: string | null;
  salary?: number | null;
  roles: string[];
  /** Specialties (admin-managed categories) the teacher may teach. */
  categoryIds: string[];
};

type ServerTeacher = { id: string; userId?: string | null; fullName?: string | null; salary?: number | null; roles?: string[]; categoryIds?: string[] };

const mapTeacher = (t: ServerTeacher): TeacherItem => ({
  id: t.id,
  userId: t.userId ?? null,
  fullName: t.fullName,
  salary: t.salary ?? null,
  roles: t.roles ?? [],
  categoryIds: t.categoryIds ?? [],
});

export const getTeachers = async (role?: string): Promise<ApiResponse<TeacherItem[]>> => {
  const url = role ? `/teachers?role=${encodeURIComponent(role)}` : "/teachers";
  const { data } = await apiClient.get<ApiResponse<ServerTeacher[]>>(url);
  const mapped = data.data?.map(mapTeacher) ?? [];
  return { ...data, data: mapped } as ApiResponse<TeacherItem[]>;
};

export const getTeacherById = async (id: string): Promise<ApiResponse<TeacherItem>> => {
  const { data } = await apiClient.get<ApiResponse<ServerTeacher>>(`/teachers/${id}`);
  const mapped = data.data ? mapTeacher(data.data) : null;
  return { ...data, data: mapped } as ApiResponse<TeacherItem>;
};

export const getTeacherByUserId = async (userId: string): Promise<ApiResponse<TeacherItem>> => {
  const { data } = await apiClient.get<ApiResponse<ServerTeacher>>(`/teachers/by-user/${userId}`);
  const mapped = data.data ? mapTeacher(data.data) : null;
  return { ...data, data: mapped } as ApiResponse<TeacherItem>;
};

export const putTeacherByUserId = async (userId: string, payload: { salary?: number | null }) => {
  const body = { salary: payload.salary ?? null };
  const { data } = await apiClient.put<ApiResponse<ServerTeacher>>(`/teachers/by-user/${userId}`, body);
  return data;
};

export const getCoursesByTeacherUserId = async (userId: string, roles?: string[]): Promise<ApiResponse<CourseSummary[]>> => {
  const qs = buildRolesQuery(roles);
  const { data } = await apiClient.get<ApiResponse<CourseSummary[]>>(`/teachers/by-user/${userId}/courses${qs}`);
  return data;
};

export const setTeacherCategories = async (teacherId: string, categoryIds: string[]): Promise<TeacherItem> => {
  const { data } = await apiClient.put<ApiResponse<ServerTeacher>>(`/teachers/${teacherId}/categories`, { categoryIds });
  return mapTeacher(data.data);
};
