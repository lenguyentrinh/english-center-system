import { useEffect, useState } from "react";
import { nowMinutes } from "@/shared/utils/now";

/** Minutes since midnight, refreshed every 30 s so "now" lines and "đang diễn ra" badges stay current. */
export function useNowMinutes(): number {
  const [m, setM] = useState(nowMinutes);
  useEffect(() => {
    const t = window.setInterval(() => setM(nowMinutes()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  return m;
}
