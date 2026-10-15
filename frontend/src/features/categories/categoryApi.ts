import { apiClient } from "@/shared/api/client.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";

/** Admin-managed tag/category (program, subject...). Nothing about categories is hardcoded in the app. */
export type Category = { id: string; name: string; color: string; active?: boolean };
export type CategoryPayload = { name: string; color: string };

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await apiClient.get<ApiResponse<Category[]>>("/categories");
  return data.data ?? [];
};

export const createCategory = async (payload: CategoryPayload): Promise<Category> => {
  const { data } = await apiClient.post<ApiResponse<Category>>("/categories", payload);
  return data.data;
};

export const updateCategory = async (id: string, payload: CategoryPayload): Promise<Category> => {
  const { data } = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, payload);
  return data.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
};
