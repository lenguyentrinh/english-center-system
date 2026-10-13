import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import { AUTH_QUERY_KEY } from "@/features/auth/authKeys.ts";
import { queryClient } from "./queryClient.ts";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Separate instance so the refresh call itself never goes through the interceptor below.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// A 401 from these means "wrong credentials / bad code", not "session expired": show the error, don't refresh.
const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/verify-otp",
  "/auth/reset-password",
];

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// One shared refresh: any number of requests hitting 401 together cause a single /auth/refresh call.
let refreshPromise: Promise<void> | null = null;

const refreshSession = (): Promise<void> => {
  refreshPromise ??= refreshClient
    .post("/auth/refresh")
    .then(() => undefined)
    // Failure is not final here: another tab may have just rotated the cookie (the server answers 401 to
    // the race loser). Callers replay their request once; if that 401s too the session is really gone.
    .catch(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

const handleSessionExpired = (url: string) => {
  // Not logged in is a normal state for /auth/me (guest), so it is never an "expiry".
  if (url.includes("/auth/me")) return;
  if (queryClient.getQueryData(AUTH_QUERY_KEY)) {
    toast.info("Your session has expired. Please log in again.");
  }
  // Soft logout: guards see no user and navigate to /auth/login without a page reload, so unsaved form
  // state elsewhere on the page is not thrown away by a hard redirect.
  queryClient.setQueryData(AUTH_QUERY_KEY, null);
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const url = config?.url ?? "";

    if (!config || error.response?.status !== 401 || NO_REFRESH_PATHS.some((p) => url.includes(p))) {
      return Promise.reject(error);
    }

    if (config._retry) {
      handleSessionExpired(url);
      return Promise.reject(error);
    }

    config._retry = true;
    await refreshSession();
    return apiClient(config);
  }
);
