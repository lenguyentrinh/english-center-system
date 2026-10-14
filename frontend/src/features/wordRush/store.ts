import { useMemo, useSyncExternalStore } from "react";
import { MOCK_TEACHER } from "@/features/mock/common.ts";
import { BOT_NAMES, SEED_BEST, SEED_RESULTS, SEED_SETS, STUDENTS_TOTAL } from "./mock.ts";
import type { WRPlayer, WRQuestion, WRReport, WRResult, WRRoom, WRSet, WRSetSummary } from "./types.ts";

/**
 * Module-level mock store (no backend yet). The live room is shared in-memory and driven by simulated
 * bot players; a WebSocket/SSE feed would replace `tick()` and the room actions later.
 */
type State = {
  sets: WRSet[];
  room: WRRoom | null;
  results: Record<string, WRResult>;
  best: { score: number; rank: number; players: number; title: string };
};

let state: State = { sets: SEED_SETS, room: null, results: SEED_RESULTS, best: SEED_BEST };
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

export const ME_ID = "me";
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

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

/* ---------- sets ---------- */
export function buildReport(s: WRSet, result?: WRResult): WRReport {
  const seed = [...s.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const players = Math.min(STUDENTS_TOTAL[s.classId] ?? 12, 14);
  const perQuestion = s.questions.map((qq, i) => {
    const pct = 32 + ((seed * 7 + i * 29) % 64);
    const wrongIdx = [0, 1, 2, 3].filter((k) => k !== qq.answer)[(i + seed) % 3];
    return { index: i, pct, wrongOption: qq.options[wrongIdx] ?? null, wrongCount: Math.max(1, Math.round((players * (100 - pct)) / 100 / 1.6)) };
  });
  const avgPct = perQuestion.length ? Math.round(perQuestion.reduce((a, b) => a + b.pct, 0) / perQuestion.length) : 0;
  const hardest = perQuestion.length ? perQuestion.reduce((a, b) => (b.pct < a.pct ? b : a)) : null;
  const board = BOT_NAMES.slice(0, Math.max(0, players - 1)).map((name, i) => {
    const correct = Math.max(0, Math.min(s.questions.length, Math.round((s.questions.length * (avgPct + 22 - i * 4)) / 100)));
    return { name, score: correct * 760 + ((seed + i * 13) % 140), correct, avgSec: 6 + ((seed + i * 5) % 9) };
  });
  if (result && result.setId === s.id) board.push({ name: "Minh Anh", score: result.score, correct: result.correct, avgSec: Math.round(result.seconds / Math.max(1, result.total)) });
  board.sort((a, b) => b.score - a.score);
  return {
    players: board.length,
    avgPct,
    hardest: hardest ? { index: hardest.index, pct: hardest.pct } : null,
    avgSeconds: 8 + (seed % 5),
    perQuestion,
    board,
  };
}

function summarize(s: WRSet, results: Record<string, WRResult>): WRSetSummary {
  const total = STUDENTS_TOTAL[s.classId] ?? 12;
  const rep = buildReport(s, results[s.id]);
  const done = s.selfPaced || s.id === "s1" ? Math.min(total, Math.max(0, rep.players - 3)) : 0;
  return { ...s, published: s.selfPaced, studentsDone: done, studentsTotal: total, accuracy: s.questions.length ? rep.avgPct : 0 };
}

/** Read API for the admin Library page. */
export function useWordRushSets(): WRSetSummary[] {
  const { sets, results } = useWRState();
  return useMemo(() => sets.map((s) => summarize(s, results)), [sets, results]);
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
export function createSet(): string {
  const id = `s${Date.now()}`;
  const s: WRSet = {
    id,
    title: "Bộ câu hỏi mới",
    classId: "c1",
    authorId: MOCK_TEACHER.id,
    authorName: MOCK_TEACHER.name,
    selfPaced: false,
    mode: "game",
    testMin: 10,
    deadline: "2026-10-25",
    secPerQ: 20,
    questions: [{ id: `q${Date.now()}a`, sentence: "Viết câu có chỗ trống ___ ở đây.", options: ["", "", "", ""], answer: 0, topic: "Chủ đề mới" }],
  };
  set({ sets: [s, ...state.sets] });
  return id;
}

/* ---------- student results ---------- */
export function saveResult(r: WRResult) {
  const prev = state.results[r.setId];
  const best = r.kind === "game" && r.score > state.best.score ? { ...state.best, score: r.score, title: state.sets.find((s) => s.id === r.setId)?.title ?? state.best.title } : state.best;
  set({ results: { ...state.results, [r.setId]: prev && prev.kind === "game" && prev.score > r.score && r.kind === "game" ? prev : r }, best });
}

/* ---------- live room ---------- */
function patchRoom(fn: (r: WRRoom) => WRRoom) {
  if (state.room) set({ room: fn(state.room) });
}

function newPlayer(id: string, name: string, bot: boolean): WRPlayer {
  return { id, name, bot, score: 0, streak: 0, prevRank: 0, lastGain: 0, lastCorrect: null, correctCount: 0 };
}

function planBots(r: WRRoom): Record<string, { atMs: number; choice: number }> {
  const plans: WRRoom["botPlans"] = {};
  const correct = r.questions[r.qIndex].answer;
  r.players
    .filter((p) => p.bot)
    .forEach((p) => {
      const ok = Math.random() < 0.68;
      const wrong = [0, 1, 2, 3].filter((k) => k !== correct);
      plans[p.id] = { atMs: rnd(1800, r.secPerQ * 1000 * 0.85), choice: ok ? correct : wrong[Math.floor(Math.random() * 3)] };
    });
  return plans;
}

function toReveal(r: WRRoom): WRRoom {
  const order = rankOf(r.players);
  const dur = r.secPerQ;
  const correct = r.questions[r.qIndex].answer;
  const players = r.players.map((p) => {
    const a = r.answers[p.id];
    const prevRank = order.findIndex((x) => x.id === p.id) + 1;
    if (a && a.choice === correct) {
      const streak = p.streak + 1;
      const gain = scoreFor(a.ms, dur, streak);
      return { ...p, streak, score: p.score + gain, lastGain: gain, lastCorrect: true, correctCount: p.correctCount + 1, prevRank };
    }
    return { ...p, streak: 0, lastGain: 0, lastCorrect: a ? false : null, prevRank };
  });
  return { ...r, phase: "reveal", phaseAt: Date.now(), players };
}

function tick() {
  const r = state.room;
  if (!r) return;
  const now = Date.now();
  if (r.phase === "lobby") {
    if (r.players.length < 11 && Math.random() < 0.18) {
      const used = new Set(r.players.map((p) => p.name));
      const name = BOT_NAMES.find((n) => !used.has(n));
      if (name) set({ room: { ...r, players: [...r.players, newPlayer(`b-${name}`, name, true)] } });
    }
    return;
  }
  if (r.phase === "question") {
    const elapsed = now - r.qStartedAt;
    const answers = { ...r.answers };
    let changed = false;
    for (const [id, plan] of Object.entries(r.botPlans)) {
      if (!answers[id] && plan.atMs <= elapsed) {
        answers[id] = { choice: plan.choice, ms: plan.atMs };
        changed = true;
      }
    }
    const next = changed ? { ...r, answers } : r;
    if (elapsed >= r.secPerQ * 1000) set({ room: toReveal(next) });
    else if (changed) set({ room: next });
    return;
  }
  if (r.auto && now - r.phaseAt > 4500) {
    if (r.phase === "reveal") set({ room: { ...r, phase: "board", phaseAt: now } });
    else if (r.phase === "board") set({ room: advance(r) });
  }
}

function advance(r: WRRoom): WRRoom {
  if (r.qIndex + 1 >= r.questions.length) return { ...r, phase: "podium", phaseAt: Date.now() };
  const next: WRRoom = { ...r, qIndex: r.qIndex + 1, phase: "question", qStartedAt: Date.now(), phaseAt: Date.now(), answers: {} };
  return { ...next, botPlans: planBots(next) };
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
    const bots = BOT_NAMES.slice(0, 4).map((n) => newPlayer(`b-${n}`, n, true));
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
        auto: true,
        players: bots,
        answers: {},
        botPlans: {},
      },
    });
    ensureTimer();
  },
  start() {
    patchRoom((r) => {
      if (r.questions.length === 0) return r;
      const next: WRRoom = { ...r, phase: "question", qIndex: 0, qStartedAt: Date.now(), phaseAt: Date.now(), answers: {} };
      return { ...next, botPlans: planBots(next) };
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
  toggleAuto() {
    patchRoom((r) => ({ ...r, auto: !r.auto, phaseAt: Date.now() }));
  },
  close() {
    stopTimer();
    set({ room: null });
  },
  /** Student side */
  join(pin: string, name: string): boolean {
    const r = state.room;
    if (!r || r.pin !== pin.replace(/\s/g, "")) return false;
    if (!r.players.some((p) => p.id === ME_ID)) patchRoom((x) => ({ ...x, players: [...x.players, newPlayer(ME_ID, name.trim() || "Minh Anh", false)] }));
    return true;
  },
  leave() {
    patchRoom((r) => ({ ...r, players: r.players.filter((p) => p.id !== ME_ID) }));
  },
  answer(choice: number) {
    patchRoom((r) => {
      if (r.phase !== "question" || r.answers[ME_ID] || !r.players.some((p) => p.id === ME_ID)) return r;
      return { ...r, answers: { ...r.answers, [ME_ID]: { choice, ms: Date.now() - r.qStartedAt } } };
    });
  },
};
