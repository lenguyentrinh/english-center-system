import { useMemo, useSyncExternalStore } from "react";
import { MOCK_TEACHER } from "@/features/mock/common.ts";
import {
  CLASS_STUDENT_COUNT,
  MOCK_STUDENT_NAMES,
  SEED_DECKS,
  SEED_PROGRESS,
  STUDENT_CLASS_IDS,
  mockRating,
  studentsDoneFor,
} from "./mock.ts";
import type { Card, Deck, DeckView, Rating, StudentDeckProgress } from "./types.ts";

type State = { decks: Deck[]; progress: Record<string, StudentDeckProgress> };

let state: State = { decks: SEED_DECKS, progress: SEED_PROGRESS };
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getState = () => state;

let seq = 100;
const newId = (p: string) => `${p}-${++seq}`;

export const blankCard = (): Card => ({
  id: newId("card"),
  word: "",
  ipa: "",
  pos: "",
  meaning: "",
  synonym: "",
  example: "",
  exampleVi: "",
});

/* ------- teacher actions ------- */
export function createDeck(classId: string): string {
  const id = newId("deck");
  const deck: Deck = {
    id,
    title: "Bộ thẻ mới",
    classId,
    published: false,
    authorId: MOCK_TEACHER.id,
    authorName: MOCK_TEACHER.name,
    cards: [],
  };
  set({ decks: [deck, ...state.decks] });
  return id;
}

export function updateDeck(id: string, patch: Partial<Pick<Deck, "title" | "classId" | "published">>) {
  set({ decks: state.decks.map((d) => (d.id === id ? { ...d, ...patch } : d)) });
}

function mapCards(id: string, fn: (cards: Card[]) => Card[]) {
  set({ decks: state.decks.map((d) => (d.id === id ? { ...d, cards: fn(d.cards) } : d)) });
}
export const addCards = (id: string, cards: Card[]) => mapCards(id, (c) => [...c, ...cards]);
export const updateCard = (id: string, cardId: string, patch: Partial<Card>) =>
  mapCards(id, (c) => c.map((x) => (x.id === cardId ? { ...x, ...patch } : x)));
export const removeCard = (id: string, cardId: string) => mapCards(id, (c) => c.filter((x) => x.id !== cardId));

/* ------- student actions ------- */
const emptyProgress = (n: number): StudentDeckProgress => ({ fresh: n, learning: 0, review: 0, studiedToday: false, test: null });

export function markStudied(deckId: string) {
  const prev = state.progress[deckId] ?? emptyProgress(0);
  set({ progress: { ...state.progress, [deckId]: { ...prev, fresh: 0, learning: 0, review: 0, studiedToday: true } } });
}
export function recordTest(deckId: string, test: { correct: number; total: number }) {
  const prev = state.progress[deckId] ?? emptyProgress(0);
  set({ progress: { ...state.progress, [deckId]: { ...prev, test } } });
}

/* ------- derived data ------- */
export function classResults(deck: Deck) {
  const total = CLASS_STUDENT_COUNT[deck.classId] ?? 10;
  const students = MOCK_STUDENT_NAMES.slice(0, total).map((name, i) => ({
    name,
    ratings: deck.cards.map((c) => mockRating(deck, i, c)),
  }));
  let rated = 0;
  let good = 0;
  const hardPerCard = deck.cards.map(() => ({ rated: 0, hard: 0 }));
  students.forEach((s) =>
    s.ratings.forEach((r: Rating | null, ci) => {
      if (!r) return;
      rated++;
      hardPerCard[ci].rated++;
      if (r === "good" || r === "easy") good++;
      else hardPerCard[ci].hard++;
    }),
  );
  const hardest = deck.cards
    .map((card, ci) => ({ card, pct: hardPerCard[ci].rated ? Math.round((hardPerCard[ci].hard / hardPerCard[ci].rated) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct);
  return {
    students,
    done: studentsDoneFor(deck),
    total,
    retention: rated ? Math.round((good / rated) * 100) : 0,
    hardest,
  };
}

function toView(deck: Deck): DeckView {
  const r = classResults(deck);
  return { ...deck, studentsDone: r.done, studentsTotal: r.total, retention: r.retention };
}

/** All decks (every teacher) with derived class stats. Used by the admin Library page. */
export function useDecks(): DeckView[] {
  const s = useSyncExternalStore(subscribe, getState);
  return useMemo(() => s.decks.map(toView), [s.decks]);
}

export function useDeck(id: string | undefined): Deck | undefined {
  const s = useSyncExternalStore(subscribe, getState);
  return s.decks.find((d) => d.id === id);
}

export function useStudentDecks(): { deck: Deck; progress: StudentDeckProgress }[] {
  const s = useSyncExternalStore(subscribe, getState);
  return useMemo(
    () =>
      s.decks
        .filter((d) => d.published && STUDENT_CLASS_IDS.includes(d.classId))
        .map((deck) => ({ deck, progress: s.progress[deck.id] ?? emptyProgress(deck.cards.length) })),
    [s],
  );
}

/** Every card meaning in the system, for building test distractors when a deck is too small. */
export function useAllDecks(): Deck[] {
  return useSyncExternalStore(subscribe, getState).decks;
}
