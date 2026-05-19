import { apiClient } from "@/shared/api/client.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";
import type { LoginPayload, SignupPayload } from "./types.ts";

export const signup = async (payload: SignupPayload): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.post<ApiResponse<null>>("/auth/signup", payload);
  return data;
};

export const login = async (payload: LoginPayload): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.post<ApiResponse<null>>("/auth/login", payload);
  return data;
};

export const logout = async (): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.post<ApiResponse<null>>("/auth/logout");
  return data;
};
