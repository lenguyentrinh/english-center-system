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

export type Deck = {
  id: string;
  title: string;
  classId: string;
  published: boolean;
  authorId: string;
  authorName: string;
  cards: Card[];
};

export type Rating = "again" | "hard" | "good" | "easy";

/** Deck plus numbers derived from the (mock) class results. */
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
  test: { correct: number; total: number } | null;
};
