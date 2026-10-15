import { useMemo, useSyncExternalStore } from "react";
import { addIsoDays, nowDate } from "@/shared/utils/now.ts";
import type { WRPlayer, WRQuestion, WRReport, WRResult, WRRoom, WRSet, WRSetSummary } from "./types.ts";

/**
 * In-memory store (no backend for Word Rush yet): starts empty and is lost on reload. The live room lives in
 * this browser tab only; a WebSocket/SSE feed would replace the local timer and the room actions later.
 * Reports are built from live sessions that were really played, never from generated numbers.
 */
type State = {
  sets: WRSet[];
  room: WRRoom | null;
  results: Record<string, WRResult>;
  /** Last finished live session per set. */
  reports: Record<string, WRReport>;
  best: { score: number; title: string };
};

let state: State = { sets: [], room: null, results: {}, reports: {}, best: { score: 0, title: "" } };
const listeners = new Set<() => void>();
let timer: number | null = null;

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const snapshot = () => state;
export const useWRState = () => useSyncExternalStore(subscribe, snapshot);

/** Identity of whoever joins a live room (the logged-in student). */
export type RoomPlayer = { id: string; name: string };

/* ---------- validation / helpers ---------- */
export const isValidQuestion = (x: WRQuestion) =>
  x.sentence.includes("___") && x.options.length === 4 && x.options.every((o) => o.trim() !== "") && x.answer >= 0 && x.answer < 4;

const DOW = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
export function fmtDeadline(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return `${DOW[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const rankOf = (players: WRPlayer[]) => [...players].sort((a, b) => b.score - a.score);

export function scoreFor(ms: number, durSec: number, streak: number) {
  const base = Math.round(1000 * (1 - ms / 1000 / durSec / 2));
  return Math.max(0, base) + 100 * Math.min(streak, 5);
}

/* ---------- reports ---------- */
const emptyReport = (s: WRSet): WRReport => ({
  hasData: false,
  players: 0,
  avgPct: 0,
  hardest: null,
  avgSeconds: 0,
  perQuestion: s.questions.map((_, index) => ({ index, pct: 0, wrongOption: null, wrongCount: 0 })),
  board: [],
});

/** Report of the last live session of this set, or an empty one when it was never played. */
export function buildReport(s: WRSet): WRReport {
  const saved = state.reports[s.id];
  return saved ? { ...saved, perQuestion: saved.perQuestion.filter((p) => p.index < s.questions.length) } : emptyReport(s);
}

function reportOf(r: WRRoom): WRReport {
  const perQuestion = r.questions.map((q, index) => {
    const st = r.stats[index] ?? { answered: 0, correct: 0, wrong: [0, 0, 0, 0] };
    const worst = st.wrong.reduce((best, n, k) => (n > st.wrong[best] ? k : best), 0);
    return {
      index,
      pct: st.answered ? Math.round((st.correct / st.answered) * 100) : 0,
      wrongOption: st.wrong[worst] > 0 ? q.options[worst] : null,
      wrongCount: st.wrong[worst] ?? 0,
    };
  });
  const answered = r.stats.reduce((a, x) => a + x.answered, 0);
  const correct = r.stats.reduce((a, x) => a + x.correct, 0);
  const asked = perQuestion.filter((_, i) => (r.stats[i]?.answered ?? 0) > 0);
  const hardest = asked.length ? asked.reduce((a, b) => (b.pct < a.pct ? b : a)) : null;
  const totalMs = r.players.reduce((a, p) => a + p.answerMs, 0);
  const totalAnswers = r.players.reduce((a, p) => a + p.answered, 0);
  return {
    hasData: answered > 0,
    players: r.players.length,
    avgPct: answered ? Math.round((correct / answered) * 100) : 0,
    hardest: hardest ? { index: hardest.index, pct: hardest.pct } : null,
    avgSeconds: totalAnswers ? Math.round(totalMs / totalAnswers / 1000) : 0,
    perQuestion,
    board: rankOf(r.players).map((p) => ({ name: p.name, score: p.score, correct: p.correctCount, avgSec: p.answered ? Math.round(p.answerMs / p.answered / 1000) : 0 })),
  };
}

function summarize(s: WRSet): WRSetSummary {
  // Student participation is not tracked per student yet, so done/total stay 0 (UI shows "—").
  return { ...s, published: s.selfPaced, studentsDone: 0, studentsTotal: 0, accuracy: state.reports[s.id]?.avgPct ?? 0 };
}

/** Read API for the admin Library page. */
export function useWordRushSets(): WRSetSummary[] {
  const { sets } = useWRState();
  return useMemo(() => sets.map(summarize), [sets]);
}

export function useWRSet(id: string | undefined) {
  const { sets } = useWRState();
  return sets.find((s) => s.id === id);
}

export function updateSet(id: string, patch: Partial<WRSet>) {
  set({ sets: state.sets.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
}
export function updateQuestion(setId: string, qid: string, patch: Partial<WRQuestion>) {
  set({ sets: state.sets.map((s) => (s.id === setId ? { ...s, questions: s.questions.map((x) => (x.id === qid ? { ...x, ...patch } : x)) } : s)) });
}
export function addQuestion(setId: string): string {
  const id = `q${Date.now()}`;
  const nq: WRQuestion = { id, sentence: "Viết câu có chỗ trống ___ ở đây.", options: ["", "", "", ""], answer: 0, topic: "Chủ đề mới" };
  set({ sets: state.sets.map((s) => (s.id === setId ? { ...s, questions: [...s.questions, nq] } : s)) });
  return id;
}
export function deleteQuestion(setId: string, qid: string) {
  set({ sets: state.sets.map((s) => (s.id === setId ? { ...s, questions: s.questions.filter((x) => x.id !== qid) } : s)) });
}
export function createSet(init: { title?: string; categoryId?: string; classId?: string; author: { id: string; name: string } }): string {
  const id = `s${Date.now()}`;
  const s: WRSet = {
    id,
    title: init.title?.trim() || "Bộ câu hỏi mới",
    categoryId: init.categoryId,
    classId: init.classId ?? "",
    authorId: init.author.id,
    authorName: init.author.name,
    selfPaced: false,
    mode: "game",
    testMin: 10,
    deadline: addIsoDays(nowDate(), 14),
    secPerQ: 20,
    questions: [{ id: `q${Date.now()}a`, sentence: "Viết câu có chỗ trống ___ ở đây.", options: ["", "", "", ""], answer: 0, topic: "Chủ đề mới" }],
  };
  set({ sets: [s, ...state.sets] });
  return id;
}

/* ---------- student results ---------- */
export function saveResult(r: WRResult) {
  const prev = state.results[r.setId];
  const best = r.kind === "game" && r.score > state.best.score ? { score: r.score, title: state.sets.find((s) => s.id === r.setId)?.title ?? state.best.title } : state.best;
  set({ results: { ...state.results, [r.setId]: prev && prev.kind === "game" && prev.score > r.score && r.kind === "game" ? prev : r }, best });
}

/* ---------- live room ---------- */
function patchRoom(fn: (r: WRRoom) => WRRoom) {
  if (state.room) set({ room: fn(state.room) });
}

function newPlayer(id: string, name: string): WRPlayer {
  return { id, name, score: 0, streak: 0, prevRank: 0, lastGain: 0, lastCorrect: null, correctCount: 0, answerMs: 0, answered: 0 };
}

function toReveal(r: WRRoom): WRRoom {
  const order = rankOf(r.players);
  const dur = r.secPerQ;
  const q = r.questions[r.qIndex];
  const correct = q.answer;
  const st = { answered: 0, correct: 0, wrong: [0, 0, 0, 0] };
  const players = r.players.map((p) => {
    const a = r.answers[p.id];
    const prevRank = order.findIndex((x) => x.id === p.id) + 1;
    if (!a) return { ...p, streak: 0, lastGain: 0, lastCorrect: null, prevRank };
    st.answered++;
    const answerMs = p.answerMs + a.ms;
    const answered = p.answered + 1;
    if (a.choice === correct) {
      st.correct++;
      const streak = p.streak + 1;
      const gain = scoreFor(a.ms, dur, streak);
      return { ...p, streak, score: p.score + gain, lastGain: gain, lastCorrect: true, correctCount: p.correctCount + 1, prevRank, answerMs, answered };
    }
    st.wrong[a.choice]++;
    return { ...p, streak: 0, lastGain: 0, lastCorrect: false, prevRank, answerMs, answered };
  });
  const stats = [...r.stats];
  stats[r.qIndex] = st;
  return { ...r, phase: "reveal", phaseAt: Date.now(), players, stats };
}

function tick() {
  const r = state.room;
  if (!r) return;
  const now = Date.now();
  if (r.phase === "question") {
    // Time is up (or everybody answered): reveal.
    const everyone = r.players.length > 0 && r.players.every((p) => r.answers[p.id]);
    if (everyone || now - r.qStartedAt >= r.secPerQ * 1000) set({ room: toReveal(r) });
    return;
  }
  if (r.auto && now - r.phaseAt > 4500) {
    if (r.phase === "reveal") set({ room: { ...r, phase: "board", phaseAt: now } });
    else if (r.phase === "board") set({ room: advance(r) });
  }
}

function advance(r: WRRoom): WRRoom {
  if (r.qIndex + 1 >= r.questions.length) return { ...r, phase: "podium", phaseAt: Date.now() };
  return { ...r, qIndex: r.qIndex + 1, phase: "question", qStartedAt: Date.now(), phaseAt: Date.now(), answers: {} };
}

function ensureTimer() {
  if (timer === null) timer = window.setInterval(tick, 300);
}
function stopTimer() {
  if (timer !== null) window.clearInterval(timer);
  timer = null;
}

export const roomActions = {
  open(setId: string) {
    const s = state.sets.find((x) => x.id === setId);
    if (!s) return;
    const questions = s.questions.filter(isValidQuestion).map((x) => ({ ...x, options: [...x.options] })); // snapshot
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    set({
      room: {
        pin,
        setId,
        title: s.title,
        teacherName: s.authorName,
        questions,
        secPerQ: s.secPerQ || 20,
        phase: "lobby",
        qIndex: 0,
        qStartedAt: 0,
        phaseAt: Date.now(),
        auto: false, // design v5: the teacher moves every step manually
        players: [],
        answers: {},
        stats: [],
      },
    });
    ensureTimer();
  },
  start() {
    patchRoom((r) => {
      if (r.questions.length === 0) return r;
      return { ...r, phase: "question", qIndex: 0, qStartedAt: Date.now(), phaseAt: Date.now(), answers: {}, stats: [] };
    });
  },
  endQuestion() {
    patchRoom((r) => (r.phase === "question" ? toReveal(r) : r));
  },
  toBoard() {
    patchRoom((r) => ({ ...r, phase: "board", phaseAt: Date.now() }));
  },
  next() {
    patchRoom(advance);
  },
  /** Last question revealed -> final standings (design: the end screen is the board titled "Kết quả chung cuộc"). */
  toFinal() {
    patchRoom((r) => ({ ...r, phase: "podium", phaseAt: Date.now() }));
  },
  toggleAuto() {
    patchRoom((r) => ({ ...r, auto: !r.auto, phaseAt: Date.now() }));
  },
  /** Closing a room that really played saves its report for the Library / set report. */
  close() {
    stopTimer();
    const r = state.room;
    const report = r ? reportOf(r) : null;
    set({ room: null, reports: r && report?.hasData ? { ...state.reports, [r.setId]: report } : state.reports });
  },
  /** Student side */
  join(pin: string, who: RoomPlayer): boolean {
    const r = state.room;
    if (!r || r.pin !== pin.replace(/\s/g, "")) return false;
    if (!r.players.some((p) => p.id === who.id)) patchRoom((x) => ({ ...x, players: [...x.players, newPlayer(who.id, who.name.trim() || "Học viên")] }));
    return true;
  },
  leave(playerId: string) {
    patchRoom((r) => ({ ...r, players: r.players.filter((p) => p.id !== playerId) }));
  },
  answer(choice: number, playerId: string) {
    patchRoom((r) => {
      if (r.phase !== "question" || r.answers[playerId] || !r.players.some((p) => p.id === playerId)) return r;
      return { ...r, answers: { ...r.answers, [playerId]: { choice, ms: Date.now() - r.qStartedAt } } };
    });
  },
};
