import { useSyncExternalStore } from "react";
import type { ScheduleEvent } from "./types";

export type { ScheduleEvent } from "./types";

/**
 * Events the user adds by hand on the calendar (make-up lessons, 1-1 tutoring, meetings, private time).
 * Class sessions are NOT stored here: they are derived from the classes (see `useScheduleEvents` in ./events).
 * Starts empty; memory only (there is no backend for personal events yet).
 */
let events: ScheduleEvent[] = [];
const listeners = new Set<() => void>();

function set(next: ScheduleEvent[]) {
  events = next;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const getStoredEvents = (): ScheduleEvent[] => events;

export const useStoredEvents = (): ScheduleEvent[] => useSyncExternalStore(subscribe, () => events);

export function addEvents(list: ScheduleEvent[]): void {
  set([...events, ...list]);
}

export function updateEvent(id: string, patch: Partial<ScheduleEvent>): void {
  set(events.map((e) => (e.id === id ? { ...e, ...patch } : e)));
}

export function removeEvent(id: string): void {
  set(events.filter((e) => e.id !== id));
}
