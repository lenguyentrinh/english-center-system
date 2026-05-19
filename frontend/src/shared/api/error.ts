import axios from "axios";

type ApiErrorPayload = {
  message?: string;
  origin?: string;
  status?: string | number;
  errors?: Record<string, string>;
};

const formatValidationErrors = (
  errors: Record<string, string> | undefined
): string | null => {
  if (!errors || !Object.keys(errors).length) return null;
  return Object.entries(errors)
    .map(([field, msg]) => `${field}: ${msg}`)
    .join("; ");
};

export const getApiErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const data = error.response?.data;
    const fromFields = formatValidationErrors(data?.errors);
    if (fromFields) return fromFields;

    if (data?.message) {
      return data.origin ? `${data.message} (origin: ${data.origin})` : data.message;
    }

    const status = error.response?.status;
    if (status === 403) return "Permission denied: you are not allowed to do this action";
    if (status === 401) return "Authentication required: please login again";

    return fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
};
