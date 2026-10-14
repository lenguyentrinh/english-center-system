import { useState } from "react";

/** Client-side paging (10 rows/page). `resetKey` changes (filters/search) send the table back to page 1. */
export function usePaged<T>(items: T[], resetKey: unknown = "", pageSize = 10) {
  const [state, setState] = useState({ page: 1, key: resetKey });
  // Reset during render (not in an effect) when the filter key changes.
  const page = Object.is(state.key, resetKey) ? state.page : 1;
  if (!Object.is(state.key, resetKey)) setState({ page: 1, key: resetKey });

  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pages);
  return {
    page: current,
    setPage: (p: number) => setState({ page: p, key: resetKey }),
    pageSize,
    total: items.length,
    rows: items.slice((current - 1) * pageSize, current * pageSize),
  };
}
