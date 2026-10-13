import { useEffect } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/shared/api/error.ts";

/** Converts a query error into a message and shows it as a toast when it changes. */
export function useQueryErrorMessage(error: unknown, fallback: string): string | null {
  const message = error ? getApiErrorMessage(error, fallback) : null;

  useEffect(() => {
    if (message) toast.error(message);
  }, [message]);

  return message;
}
