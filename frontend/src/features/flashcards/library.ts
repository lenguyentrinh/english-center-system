import { useMemo } from "react";
import { buildReport, updateSet, useWRState, useWordRushSets } from "@/features/wordRush/store.ts";
import type { WRSetSummary } from "@/features/wordRush/types.ts";
import { updateDeck, useDecks } from "./store.ts";
import { useAllCourses } from "./useCourses.ts";
import type { DeckView } from "./types.ts";

/** Admin "Học liệu" row: a flashcard deck or a Word Rush set, from the center or from a teacher. */
export type LibraryItem = {
  /** Route id: `d-<deckId>` or `w-<setId>`. */
  id: string;
  kind: "Flashcard" | "Word Rush";
  src: "system" | "teacher";
  title: string;
  author: string;
  /** Class name (teacher content) or scope (center decks). */
  audience: string;
  published: boolean;
  /** Share of students who finished it; null = nobody is tracked yet. */
  donePct: number | null;
  count: number;
  /** Words shown on the card preview. */
  words: string[];
  cards: { word: string; ipa: string; meaning: string; example: string }[];
  /** pct = share of correct answers in the last live session; null = never played live. */
  qs: { sentence: string; options: string[]; answer: number; pct: number | null }[];
};

const pct = (done: number, total: number) => (total ? Math.round((done / total) * 100) : null);

function fromDeck(d: DeckView, className: (id: string) => string): LibraryItem {
  const system = d.source === "SYSTEM";
  return {
    id: `d-${d.id}`,
    kind: "Flashcard",
    src: system ? "system" : "teacher",
    title: d.title,
    author: d.authorName,
    audience: system ? (d.scope ?? "Toàn trung tâm") : className(d.classId),
    published: d.published,
    donePct: pct(d.studentsDone, d.studentsTotal),
    count: d.cards.length,
    words: d.cards.map((c) => c.word),
    cards: d.cards.map((c) => ({ word: c.word, ipa: c.ipa, meaning: c.meaning, example: c.example })),
    qs: [],
  };
}

function fromSet(s: WRSetSummary, perQ: (number | null)[], className: (id: string) => string): LibraryItem {
  return {
    id: `w-${s.id}`,
    kind: "Word Rush",
    src: "teacher",
    title: s.title,
    author: s.authorName,
    audience: className(s.classId),
    published: s.published,
    donePct: pct(s.studentsDone, s.studentsTotal),
    count: s.questions.length,
    words: s.questions.map((q) => q.options[q.answer]),
    cards: [],
    qs: s.questions.map((q, i) => ({ sentence: q.sentence, options: q.options, answer: q.answer, pct: perQ[i] ?? null })),
  };
}

export function useLibrary(): LibraryItem[] {
  const decks = useDecks();
  const sets = useWordRushSets();
  const { sets: raw } = useWRState();
  const { nameOf } = useAllCourses();
  return useMemo(
    () => [
      ...decks.map((d) => fromDeck(d, nameOf)),
      ...sets.map((s) => {
        const src = raw.find((r) => r.id === s.id);
        const rep = src ? buildReport(src) : null;
        return fromSet(s, rep?.hasData ? rep.perQuestion.map((p) => p.pct) : [], nameOf);
      }),
    ],
    [decks, sets, raw, nameOf],
  );
}

/** Hide from / show to students. Decks use `published`, Word Rush sets use `selfPaced`. */
export function setLibraryPublished(item: LibraryItem, published: boolean) {
  const raw = item.id.slice(2);
  if (item.kind === "Flashcard") updateDeck(raw, { published });
  else updateSet(raw, { selfPaced: published });
}

export const LIB_SRC = {
  system: { label: "★ English Center", bg: "#1f2937", fg: "#fff" },
  teacher: { label: "Giáo viên", bg: "#dbeafe", fg: "#1e40af" },
} as const;

export const kindStyle = (kind: LibraryItem["kind"]) =>
  kind === "Flashcard" ? { bg: "#eff6ff", fg: "#1e40af" } : { bg: "#ecfeff", fg: "#155e75" };

