import { useMemo } from "react";
import { classEvents, useClasses } from "@/features/classes/store";
import { useStoredEvents } from "./scheduleStore";
import type { ScheduleEvent } from "./types";

/** Every calendar event of the signed-in user: sessions of their classes + events they added by hand. */
export function useScheduleEvents(): ScheduleEvent[] {
  const classes = useClasses();
  const stored = useStoredEvents();
  return useMemo(() => [...classEvents(classes), ...stored], [classes, stored]);
}
