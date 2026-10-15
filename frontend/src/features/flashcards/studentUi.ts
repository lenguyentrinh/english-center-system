import type { Deck, StudentDeckProgress } from "./types.ts";

export type SourceKey = "system" | "teacher" | "mine";

/** Fixed domain concept (who made the deck), not an admin category. */
export const SOURCE_TAG: Record<SourceKey, { label: string; bg: string; fg: string; color: string }> = {
  system: { label: "★ English Center", bg: "#1f2937", fg: "#ffffff", color: "#1f2937" },
  teacher: { label: "Giáo viên giao", bg: "#dbeafe", fg: "#1e40af", color: "#2563eb" },
  mine: { label: "Của tôi", bg: "#ecfeff", fg: "#155e75", color: "#0891b2" },
};

export const sourceOf = (d: Deck): SourceKey => (d.source === "SYSTEM" ? "system" : d.source === "STUDENT" ? "mine" : "teacher");

export const abbrOf = (title: string) => {
  const w = title.trim().split(/\s+/).filter(Boolean);
  return ((w[0]?.[0] ?? "?") + (w[1]?.[0] ?? "")).toUpperCase();
};

export type StudentDeckItem = { deck: Deck; progress: StudentDeckProgress };

export const knownCount = (deck: Deck, p: StudentDeckProgress) => {
  const live = new Set(deck.cards.map((c) => c.id));
  return (p.known ?? []).filter((id) => live.has(id)).length;
};

export const hardIds = (deck: Deck, p: StudentDeckProgress) => {
  const live = new Set(deck.cards.map((c) => c.id));
  return (p.hard ?? []).filter((id) => live.has(id));
};
