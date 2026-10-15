import { useEffect, useMemo, useRef, useState } from "react";
import { ANSWER_COLORS, LETTERS } from "./constants.ts";
import { saveResult, scoreFor } from "./store.ts";
import { useNow } from "./useNow.ts";
import type { WRSet } from "./types.ts";

/** Student solo play (practice game + test) and the result page, per "Student v5" screens 'Đang chơi' and 'Kết quả'. */

type Answer = { pick: number; ok: boolean; gain: number };

const DOTS = { backgroundImage: "radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px)", backgroundSize: "24px 24px" } as const;
const BLUE_DOTS = { backgroundImage: "radial-gradient(rgba(37,99,235,.12) 1px, transparent 1px)", backgroundSize: "22px 22px" } as const;
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function validQuestions(set: WRSet) {
  return set.questions.filter((x) => x.sentence.includes("___") && x.options.every((o) => o.trim()));
}

function Play({ set, onDone, onExit }: { set: WRSet; onDone: (answers: Answer[], score: number, correct: number) => void; onExit: () => void }) {
  const qs = useMemo(() => validQuestions(set), [set]);
  const game = set.mode === "game";
  const dur = set.secPerQ || 15;
  const [ri, setRi] = useState(0);
  const [pick, setPick] = useState(-1);
  const [fb, setFb] = useState(false);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [testStart] = useState(() => Date.now());
  const now = useNow(250);
  const nextT = useRef<number | undefined>(undefined);
  const q = qs[ri];

  const finish = (list: Answer[], sc: number, ok: number) => onDone(list, sc, ok);

  const answer = (i: number) => {
    if (fb || !q) return;
    const ok = i === q.answer;
    const ns = ok ? streak + 1 : 0;
    const gain = ok ? (game ? scoreFor(Date.now() - startedAt, dur, ns) : 1) : 0;
    const list = [...answers, { pick: i, ok, gain }];
    const sc = score + (game ? gain : 0);
    const okN = correct + (ok ? 1 : 0);
    setPick(i);
    setFb(true);
    setScore(sc);
    setCorrect(okN);
    setStreak(ns);
    setAnswers(list);
    window.clearTimeout(nextT.current);
    nextT.current = window.setTimeout(
      () => {
        if (ri + 1 < qs.length) {
          setRi(ri + 1);
          setPick(-1);
          setFb(false);
          setStartedAt(Date.now());
        } else finish(list, sc, okN);
      },
      game ? 1700 : 650,
    );
  };

  const answerRef = useRef(answer);
  useEffect(() => {
    answerRef.current = answer;
  });
  useEffect(() => () => window.clearTimeout(nextT.current), []);

  // Practice: a question that runs out of time counts as unanswered.
  useEffect(() => {
    if (!game || fb) return;
    const t = window.setTimeout(() => answerRef.current(-1), Math.max(0, dur * 1000 - (Date.now() - startedAt)));
    return () => window.clearTimeout(t);
  }, [game, fb, startedAt, dur]);

  // Test: one overall time limit; unanswered questions are blank when it runs out.
  const testSecLeft = !game && set.testMin > 0 ? Math.max(0, Math.ceil(set.testMin * 60 - (now - testStart) / 1000)) : null;
  useEffect(() => {
    if (game || set.testMin <= 0) return;
    const t = window.setTimeout(
      () => {
        window.clearTimeout(nextT.current);
        const blanks = qs.slice(answers.length).map<Answer>(() => ({ pick: -1, ok: false, gain: 0 }));
        finish([...answers, ...blanks], score, correct);
      },
      Math.max(0, set.testMin * 60000 - (Date.now() - testStart)),
    );
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, set.testMin, answers.length]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const i = Number(e.key) - 1;
      if (i >= 0 && i < 4) answerRef.current(i);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (!q) return null;
  const lastA = answers[answers.length - 1];
  const parts = q.sentence.split("___");
  const secLeft = dur - (now - startedAt) / 1000;
  const bar = game ? Math.max(0, Math.min(100, (secLeft / dur) * 100)) : ((ri + (fb ? 1 : 0)) / qs.length) * 100;
  const barColor = game && secLeft < 5 && !fb ? "#f43f5e" : "#22d3ee";
  const blank = fb && pick >= 0 ? q.options[game ? q.answer : pick] : fb && game ? q.options[q.answer] : "?";
  const blankGreen = fb && game;
  const scoreText = game ? `${score.toLocaleString("vi-VN")} điểm` : `${answers.length}/${qs.length} đã làm${testSecLeft !== null ? ` · ${mmss(testSecLeft)}` : ""}`;
  const feedback = !fb
    ? game
      ? "Chọn nhanh để được nhiều điểm · phím 1–4"
      : "Bài kiểm tra · kết quả hiện khi nộp xong"
    : game
      ? lastA?.ok
        ? `Chính xác! +${lastA.gain}${q.explain ? ` · ${q.explain}` : ""}`
        : `${pick < 0 ? "Hết giờ! " : "Chưa đúng. "}Đáp án: ${q.options[q.answer]}${q.explain ? ` · ${q.explain}` : ""}`
      : "Đã ghi nhận câu trả lời";
  const fbColor = !fb ? "#94a3b8" : game ? (lastA?.ok ? "#6ee7b7" : "#fda4af") : "#cbd5e1";

  return (
    <section
      data-screen-label="Đang chơi"
      className="relative flex flex-col overflow-hidden rounded-[28px] bg-slate-950 text-white"
      style={{ ...DOTS, minHeight: "clamp(520px, 74vh, 700px)", padding: "clamp(18px, 3vw, 32px)", gap: 18 }}
    >
      <div className="flex items-center gap-3">
        <button type="button" onClick={onExit} title="Thoát" className="size-[38px] shrink-0 rounded-full bg-white/[.08] text-xl leading-none text-slate-200 hover:brightness-90">
          ×
        </button>
        <div className="flex min-w-0 flex-1 flex-col leading-[1.3]">
          <span className="truncate text-sm font-extrabold">{set.title}</span>
          <span className="text-xs font-bold text-slate-400">
            Câu {ri + 1}/{qs.length}
          </span>
        </div>
        <span className="rounded-full bg-white/[.08] px-3.5 py-1.5 text-[15px] font-black tabular-nums">{scoreText}</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[.08]">
        <div className="h-full rounded-full" style={{ background: barColor, width: `${bar}%`, transition: game ? "none" : "width .3s" }} />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3 py-2">
        <span className="text-xs font-extrabold uppercase tracking-[.2em] text-cyan-300">{q.topic}</span>
        <p className="m-0 font-black" style={{ fontSize: "clamp(24px, 3.6vw, 40px)", lineHeight: 1.3, letterSpacing: "-0.02em", textWrap: "balance" }}>
          {parts[0]}
          <span
            className="inline-block text-center"
            style={{
              minWidth: "3.2em",
              margin: "0 .15em",
              padding: "0 .3em",
              borderRadius: ".2em",
              background: blankGreen ? "rgba(16,185,129,.22)" : fb ? "rgba(59,130,246,.25)" : "rgba(59,130,246,.18)",
              color: blankGreen ? "#6ee7b7" : "#93c5fd",
              borderBottom: `.08em solid ${blankGreen ? "#10b981" : "#60a5fa"}`,
            }}
          >
            {blank}
          </span>
          {parts.slice(1).join("___")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {q.options.map((o, i) => {
          const isA = i === q.answer;
          const isP = i === pick;
          let bg: string = ANSWER_COLORS[i].bg;
          let fg: string = ANSWER_COLORS[i].fg;
          let op = 1;
          let tf = "none";
          let mark = "";
          if (fb && game) {
            if (isA) {
              bg = "#059669";
              fg = "#fff";
              tf = "scale(1.02)";
              mark = "✓";
            } else if (isP) {
              bg = "#be123c";
              fg = "#fff";
              mark = "✕";
            } else op = 0.3;
          } else if (fb && !isP) op = 0.35;
          return (
            <button
              key={i}
              type="button"
              onClick={() => answer(i)}
              className="flex items-center gap-3 rounded-[20px] px-4 py-3 text-left hover:brightness-90"
              style={{ minHeight: "clamp(64px, 9vh, 88px)", background: bg, color: fg, opacity: op, transform: tf, transition: "opacity .25s, transform .25s, background .25s", boxShadow: "inset 0 -5px 0 rgba(0,0,0,.22)" }}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-white/[.24] text-[15px] font-black">{LETTERS[i]}</span>
              <span className="min-w-0 flex-1 font-black leading-[1.2] [overflow-wrap:anywhere]" style={{ fontSize: "clamp(16px, 1.9vw, 20px)" }}>
                {o}
              </span>
              <span className="text-lg font-black">{mark}</span>
            </button>
          );
        })}
      </div>

      <div className="flex min-h-11 items-center gap-2.5 text-sm font-bold" style={{ color: fbColor }}>
        {feedback}
      </div>
    </section>
  );
}

function Result({ set, answers, score, correct, prevBest, onAgain, onBack }: { set: WRSet; answers: Answer[]; score: number; correct: number; prevBest: number; onAgain: () => void; onBack: () => void }) {
  const qs = useMemo(() => validQuestions(set), [set]);
  const game = set.mode === "game";
  const pc = Math.round((correct / Math.max(1, qs.length)) * 100);
  const note = pc >= 80 ? "Rất tốt, giữ phong độ nhé." : pc >= 50 ? "Khá ổn, xem lại các câu sai bên cạnh." : "Cần ôn thêm, thử lại sau khi xem giải thích.";
  const big = game ? score.toLocaleString("vi-VN") : `${correct}/${qs.length}`;
  const sub = game ? `${correct}/${qs.length} câu đúng${prevBest > score ? ` · kỷ lục ${prevBest.toLocaleString("vi-VN")}` : " · kỷ lục mới!"}` : `${pc}% câu đúng`;

  return (
    <div data-screen-label="Kết quả" className="flex flex-wrap items-start" style={{ gap: "clamp(24px, 4vw, 48px)" }}>
      <section
        className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 rounded-[28px] bg-[#e8f0ff] p-7 text-slate-950 shadow-[0_0_0_1px_#c7dafe,0_14px_30px_-18px_rgba(37,99,235,.45)]"
        style={BLUE_DOTS}
      >
        <span className="text-xs font-extrabold uppercase tracking-[.2em] text-cyan-600">{game ? "Kết thúc lượt chơi" : "Đã nộp bài"}</span>
        <span className="font-black leading-none tracking-[-0.05em]" style={{ fontSize: "clamp(56px, 8vw, 88px)" }}>
          {big}
        </span>
        <span className="text-base font-extrabold text-slate-700">{sub}</span>
        <span className="text-sm text-slate-600">{note}</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {game ? (
            <button type="button" onClick={onAgain} className="h-[46px] rounded-full bg-[#1f2937] px-5 text-sm font-black text-white hover:bg-[#0b1220]">
              Chơi lại
            </button>
          ) : null}
          <button type="button" onClick={onBack} className="h-[46px] rounded-full border border-blue-600/20 bg-transparent px-[18px] text-sm font-extrabold text-slate-950 hover:bg-slate-900/[.06]">
            Về Word Rush
          </button>
        </div>
      </section>

      <section className="flex min-w-0 flex-[999_1_440px] flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_0_4px_#cffafe]" />
          <h2 className="text-lg font-extrabold">Xem lại từng câu</h2>
        </div>
        <div className="rounded-3xl bg-white px-5 py-1 shadow-[0_0_0_1px_#e6ebf3,0_6px_18px_-10px_rgba(15,23,42,.12)]">
          {qs.map((q, i) => {
            const a = answers[i];
            const ok = !!a?.ok;
            const p = q.sentence.split("___");
            const note2 = ok ? (q.explain ?? "") : `${a && a.pick >= 0 ? `Bạn chọn “${q.options[a.pick]}” · ` : "Bỏ trống · "}${q.explain ?? ""}`;
            return (
              <div key={q.id} className={`grid grid-cols-[28px_minmax(0,1fr)] gap-3 py-3.5 ${i ? "border-t border-dashed border-slate-200" : ""}`}>
                <span className={`grid size-[26px] place-items-center rounded-full text-[13px] font-black ${ok ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"}`}>{ok ? "✓" : "✕"}</span>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[15px] font-bold leading-[1.45] text-slate-950">
                    {p[0]}
                    <b className="text-emerald-700">{q.options[q.answer]}</b>
                    {p.slice(1).join("___")}
                  </span>
                  <span className="text-[13px] text-slate-500">{note2}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/** Play -> result flow for one set. Practice can be replayed; a test is saved once and cannot be redone. */
export default function StudentRush({ set, prevBest, onExit }: { set: WRSet; prevBest: number; onExit: () => void }) {
  const [run, setRun] = useState(0);
  const [done, setDone] = useState<{ answers: Answer[]; score: number; correct: number } | null>(null);
  const saved = useRef<number>(-1);
  const total = validQuestions(set).length;
  const [bestBefore, setBestBefore] = useState(prevBest);

  const finish = (answers: Answer[], score: number, correct: number) => {
    if (saved.current !== run) {
      saved.current = run;
      saveResult({ setId: set.id, score: set.mode === "game" ? score : correct * 100, correct, total, at: Date.now(), kind: set.mode === "game" ? "game" : "test", seconds: 0 });
    }
    setDone({ answers, score, correct });
  };

  if (done) {
    return (
      <Result
        set={set}
        answers={done.answers}
        score={done.score}
        correct={done.correct}
        prevBest={bestBefore}
        onAgain={() => {
          setBestBefore(Math.max(bestBefore, done.score));
          setDone(null);
          setRun(run + 1);
        }}
        onBack={onExit}
      />
    );
  }
  return (
    <Play key={run} set={set} onDone={finish} onExit={onExit} />
  );
}
