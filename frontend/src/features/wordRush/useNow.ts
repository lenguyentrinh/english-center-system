import { useEffect, useState } from "react";

/** Re-renders every `ms` and returns Date.now() (used for countdowns). */
export function useNow(ms = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(t);
  }, [ms]);
  return now;
}
