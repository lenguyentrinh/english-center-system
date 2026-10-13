import { QueryClient } from "@tanstack/react-query";

// Lives in its own module so the axios interceptor can reach it (to drop the cached session when
// a refresh fails) without importing React components.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
