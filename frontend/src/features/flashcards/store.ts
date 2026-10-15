import { useMemo, useSyncExternalStore } from "react";
import { useAuth } from "@/features/auth/useAuth.ts";
import { useStudentScope } from "./useStudentScope.ts";
import type { Actor, Card, Deck, DeckView, StudentDeckProgress } from "./types.ts";

/**
 * In-memory store (no backend for decks yet): starts empty and is lost on reload.
 * Authors/owners are passed in from the logged-in user; nothing here is seeded.
 */
type State = { decks: Deck[]; progress: Record<string, StudentDeckProgress> };

let state: State = { decks: [], progress: {} };
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
export function createDeck(classId: string, init: { title?: string; categoryId?: string; author: Actor }): string {
  const id = newId("deck");
  const deck: Deck = {
    id,
    title: init.title?.trim() || "Bộ thẻ mới",
    categoryId: init.categoryId,
    classId,
    published: false,
    authorId: init.author.id,
    authorName: init.author.name,
    cards: [],
  };
  set({ decks: [deck, ...state.decks] });
  return id;
}

/** Admin: publish a center-curated deck (source SYSTEM). Returns the new id. */
export function createCenterDeck(input: {
  title: string;
  /** Display label of the audience ("Toàn trung tâm" or the category name). */
  scope: string;
  categoryId?: string;
  scopeCategoryId?: string;
  /** The logged-in admin who publishes the deck. */
  author: Actor;
  cards: Pick<Card, "word" | "meaning" | "example">[];
}): string {
  const id = newId("sys");
  const deck: Deck = {
    id,
    title: input.title.trim(),
    classId: "",
    source: "SYSTEM",
    scope: input.scope,
    categoryId: input.categoryId || undefined,
    scopeCategoryId: input.scopeCategoryId || undefined,
    published: true,
    authorId: input.author.id,
    authorName: input.author.name,
    cards: input.cards.map((c) => ({ ...blankCard(), word: c.word.trim(), meaning: c.meaning.trim(), example: c.example.trim() })),
  };
  set({ decks: [deck, ...state.decks] });
  return id;
}

/** Only center decks can be deleted by an admin; teacher/student decks belong to their owners. */
export function deleteCenterDeck(id: string) {
  set({ decks: state.decks.filter((d) => !(d.id === id && d.source === "SYSTEM")) });
}

export function updateDeck(id: string, patch: Partial<Pick<Deck, "title" | "classId" | "published" | "categoryId">>) {
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
export type StudyOutcome = { hardIds: string[]; studiedIds: string[] };

/** Finish a study run: cards seen and not flagged hard become known; hard flags are replaced by the run's flags for those cards. */
export function finishStudy(deckId: string, { hardIds, studiedIds }: StudyOutcome) {
  const deck = state.decks.find((d) => d.id === deckId);
  if (!deck) return;
  const prev = state.progress[deckId] ?? emptyProgress(deck.cards.length);
  const live = new Set(deck.cards.map((c) => c.id));
  const hard = new Set([...(prev.hard ?? []).filter((id) => !studiedIds.includes(id)), ...hardIds]);
  const known = new Set([...(prev.known ?? []), ...studiedIds.filter((id) => !hardIds.includes(id))]);
  hard.forEach((id) => known.delete(id));
  const k = [...known].filter((id) => live.has(id));
  set({
    progress: {
      ...state.progress,
      [deckId]: { ...prev, known: k, hard: [...hard].filter((id) => live.has(id)), fresh: 0, learning: 0, review: 0, studiedToday: true },
    },
  });
}

/** Toggle a hard flag outside a study run (also used live while studying). */
export function setHardCards(deckId: string, hard: string[]) {
  const deck = state.decks.find((d) => d.id === deckId);
  if (!deck) return;
  const prev = state.progress[deckId] ?? emptyProgress(deck.cards.length);
  set({ progress: { ...state.progress, [deckId]: { ...prev, hard } } });
}

export function recordTest(deckId: string, test: { correct: number; total: number }) {
  const prev = state.progress[deckId] ?? emptyProgress(0);
  set({ progress: { ...state.progress, [deckId]: { ...prev, test } } });
}

/* ------- student-owned decks (source STUDENT, visible only to ownerId) ------- */
type OwnCard = Pick<Card, "word" | "meaning" | "example">;
const ownCards = (cards: OwnCard[]): Card[] =>
  cards.map((c) => ({ ...blankCard(), word: c.word.trim(), meaning: c.meaning.trim(), example: c.example.trim(), pos: "từ vựng" }));

export function createStudentDeck(input: { title: string; cards: OwnCard[]; owner: Actor }): string {
  const id = newId("my");
  const deck: Deck = {
    id,
    title: input.title.trim(),
    classId: "",
    source: "STUDENT",
    ownerId: input.owner.id,
    published: true,
    authorId: input.owner.id,
    authorName: "Bạn tự tạo",
    cards: ownCards(input.cards),
  };
  set({ decks: [...state.decks, deck] });
  return id;
}

/** Only the owner can change a STUDENT deck. Editing the cards restarts the deck's progress. */
export function updateStudentDeck(id: string, input: { title: string; cards: OwnCard[] }, ownerId: string) {
  const d = state.decks.find((x) => x.id === id);
  if (!d || d.source !== "STUDENT" || d.ownerId !== ownerId) return;
  const progress = { ...state.progress };
  delete progress[id];
  set({ decks: state.decks.map((x) => (x.id === id ? { ...x, title: input.title.trim(), cards: ownCards(input.cards) } : x)), progress });
}

export function deleteStudentDeck(id: string, ownerId: string) {
  const d = state.decks.find((x) => x.id === id);
  if (!d || d.source !== "STUDENT" || d.ownerId !== ownerId) return;
  const progress = { ...state.progress };
  delete progress[id];
  set({ decks: state.decks.filter((x) => x.id !== id), progress });
}

/** Cards still to review today: 0 once studied today; otherwise cards not yet known (or the whole deck when all are known). */
export function dueCount(deck: Deck, p: StudentDeckProgress): number {
  if (p.studiedToday || deck.cards.length === 0) return 0;
  const known = new Set(p.known ?? []);
  const unknown = deck.cards.filter((c) => !known.has(c.id)).length;
  return unknown > 0 ? unknown : deck.cards.length;
}

/* ------- derived data ------- */
function toView(deck: Deck): DeckView {
  // Per-student progress is not collected anywhere yet, so class stats are 0 (shown as "—").
  return { ...deck, studentsDone: 0, studentsTotal: 0, retention: 0 };
}

/** All decks (every teacher) with derived class stats. Used by the admin Library page. */
export function useDecks(): DeckView[] {
  const s = useSyncExternalStore(subscribe, getState);
  // Student-owned decks are private: never visible to teachers/admin.
  return useMemo(() => s.decks.filter((d) => d.source !== "STUDENT").map(toView), [s.decks]);
}

export function useDeck(id: string | undefined): Deck | undefined {
  const s = useSyncExternalStore(subscribe, getState);
  return s.decks.find((d) => d.id === id);
}

/**
 * Decks the logged-in student can see: own decks; published teacher decks of the classes they are enrolled in;
 * published center decks for the whole center or for a category they study.
 */
export function useStudentDecks(): { deck: Deck; progress: StudentDeckProgress }[] {
  const s = useSyncExternalStore(subscribe, getState);
  const { user } = useAuth();
  const { courseIds, categoryIds } = useStudentScope();
  return useMemo(
    () =>
      s.decks
        .filter((d) =>
          d.source === "STUDENT"
            ? !!user && d.ownerId === user.id
            : d.published &&
              (d.source === "SYSTEM" ? !d.scopeCategoryId || categoryIds.has(d.scopeCategoryId) : courseIds.has(d.classId)),
        )
        .map((deck) => ({ deck, progress: s.progress[deck.id] ?? emptyProgress(deck.cards.length) })),
    [s, user, courseIds, categoryIds],
  );
}

/** Every card meaning in the system, for building test distractors when a deck is too small. */
export function useAllDecks(): Deck[] {
  return useSyncExternalStore(subscribe, getState).decks;
}
