import axios from "axios";
import { apiClient } from "@/shared/api/client.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";
import type {
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
  VerifyOtpPayload,
} from "./types.ts";

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

/** Returns null for a guest (401 after the interceptor already tried a refresh); other errors propagate. */
export const fetchMe = async (): Promise<AuthUser | null> => {
  try {
    const { data } = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) return null;
    throw error;
  }
};

export const verifyEmail = async (payload: VerifyOtpPayload): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.post<ApiResponse<null>>("/auth/verify-email", payload);
  return data;
};

export const resendVerification = async (email: string): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.post<ApiResponse<null>>("/auth/resend-verification", { email });
  return data;
};

export const changePassword = async (payload: ChangePasswordPayload): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.post<ApiResponse<null>>("/auth/change-password", payload);
  return data;
};

export const forgotPassword = async (email: string): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.post<ApiResponse<null>>("/auth/forgot-password", { email });
  return data;
};

export const verifyOtp = async (payload: VerifyOtpPayload): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.post<ApiResponse<null>>("/auth/verify-otp", payload);
  return data;
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.post<ApiResponse<null>>("/auth/reset-password", payload);
  return data;
};
