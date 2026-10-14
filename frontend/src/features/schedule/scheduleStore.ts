import { useSyncExternalStore } from "react";
import { INITIAL_EVENTS } from "./mock";
import type { ScheduleEvent } from "./types";

export type { ScheduleEvent } from "./types";

let events: ScheduleEvent[] = INITIAL_EVENTS.map((e) => ({ ...e }));
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

export const useScheduleEvents = (): ScheduleEvent[] => useSyncExternalStore(subscribe, () => events);

export function addEvents(list: ScheduleEvent[]): void {
  set([...events, ...list]);
}

export function removeEventsBySession(sessionId: string): void {
  set(events.filter((e) => e.sessionId !== sessionId));
}

export function updateEvent(id: string, patch: Partial<ScheduleEvent>): void {
  set(events.map((e) => (e.id === id ? { ...e, ...patch } : e)));
}

export function removeEvent(id: string): void {
  set(events.filter((e) => e.id !== id));
}

export function resetEvents(): void {
  set(INITIAL_EVENTS.map((e) => ({ ...e })));
}
