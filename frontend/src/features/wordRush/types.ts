export type WRMode = "game" | "test";

export type WRQuestion = {
  id: string;
  sentence: string; // uses ___ for the blank
  options: string[]; // 4
  answer: number;
  topic: string;
  hint?: string;
  explain?: string;
};

export type WRSet = {
  id: string;
  title: string;
  classId: string;
  authorId: string;
  authorName: string;
  /** Assigned to students for self-study (game or test). */
  selfPaced: boolean;
  mode: WRMode;
  testMin: number;
  deadline: string; // ISO yyyy-mm-dd
  secPerQ: number;
  questions: WRQuestion[];
};

/** Row consumed by the admin Library page. */
export type WRSetSummary = WRSet & {
  published: boolean;
  studentsDone: number;
  studentsTotal: number;
  /** 0-100, last session */
  accuracy: number;
};

export type WRPhase = "lobby" | "question" | "reveal" | "board" | "podium";

export type WRPlayer = {
  id: string;
  name: string;
  bot: boolean;
  score: number;
  streak: number;
  prevRank: number;
  lastGain: number;
  lastCorrect: boolean | null; // null = no answer
  correctCount: number;
};

export type WRRoom = {
  pin: string;
  setId: string;
  title: string;
  teacherName: string;
  /** Snapshot taken when the room opened. */
  questions: WRQuestion[];
  secPerQ: number;
  phase: WRPhase;
  qIndex: number;
  qStartedAt: number;
  phaseAt: number;
  auto: boolean;
  players: WRPlayer[];
  /** playerId -> answer for the current question */
  answers: Record<string, { choice: number; ms: number }>;
  botPlans: Record<string, { atMs: number; choice: number }>;
};

export type WRResult = { setId: string; score: number; correct: number; total: number; at: number; kind: "game" | "test"; seconds: number };

export type WRReport = {
  players: number;
  avgPct: number;
  hardest: { index: number; pct: number } | null;
  avgSeconds: number;
  perQuestion: { index: number; pct: number; wrongOption: string | null; wrongCount: number }[];
  board: { name: string; score: number; correct: number; avgSec: number }[];
};
