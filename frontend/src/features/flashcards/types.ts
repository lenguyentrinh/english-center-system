export type Card = {
  id: string;
  word: string;
  ipa: string;
  pos: string;
  meaning: string;
  synonym: string;
  example: string;
  exampleVi: string;
};

/** Who made the deck: SYSTEM = center-curated (admin), TEACHER = class deck, STUDENT = private to its owner. */
export type DeckSource = "SYSTEM" | "TEACHER" | "STUDENT";

export type Deck = {
  id: string;
  title: string;
  /** Class the deck is assigned to. Empty for center decks (they use `scope`). */
  classId: string;
  /** Missing on legacy decks = TEACHER. */
  source?: DeckSource;
  /** Center decks only: display label of the audience ("Toàn trung tâm" or the category name). */
  scope?: string;
  /** Center decks only: legacy free-text program (superseded by categoryId). */
  program?: string;
  /** Center decks only: audience = students of classes in this admin-defined category; empty = whole center. */
  scopeCategoryId?: string;
  /** Admin-defined category id; missing/unknown renders as "Chưa phân loại". */
  categoryId?: string;
  published: boolean;
  /** STUDENT decks only: the student who owns (and alone can see/edit) the deck. */
  ownerId?: string;
  authorId: string;
  authorName: string;
  cards: Card[];
};

/** Logged-in person who authors / owns content (comes from `useAuth().user`). */
export type Actor = { id: string; name: string };

/** Deck plus class stats. There is no per-student tracking on the server yet, so these stay 0 (UI shows "—"). */
export type DeckView = Deck & {
  studentsDone: number;
  studentsTotal: number;
  /** 0-100, share of rated cards marked good/easy. */
  retention: number;
};

export type StudentDeckProgress = {
  fresh: number;
  learning: number;
  review: number;
  studiedToday: boolean;
  /** Card ids the student marked as known / hard (student study mode). */
  known?: string[];
  hard?: string[];
  test: { correct: number; total: number } | null;
};
