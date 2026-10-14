import { useEffect, useMemo, useRef, useState } from "react";
import StudentLayout from "@/shared/components/layout/StudentLayout.tsx";
import PageHeader, { TableFrame, outlineBtn, primaryBtn, tdClass, thClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { MOCK_CLASS_REFS, MOCK_STUDENT } from "@/features/mock/common.ts";
import TestRunner from "@/features/test/TestRunner.tsx";
import { ME_ID, fmtDeadline, rankOf, roomActions, saveResult, scoreFor, useWRState } from "@/features/wordRush/store.ts";
import { ANSWER_COLORS, LETTERS, fmtPin } from "@/features/wordRush/constants.ts";
import { useNow } from "@/features/wordRush/useNow.ts";
import type { WRQuestion, WRSet } from "@/features/wordRush/types.ts";

type PlayView = {
  head: string;
  rank?: number;
  score: number;
  stage: "wait" | "question" | "locked" | "result" | "board" | "end";
  name: string;
  qNo: number;
  qTotal: number;
  secLeft: number;
  durSec: number;
  q?: WRQuestion;
  chosen: number | null;
  answered?: number;
  result?: { correct: boolean | null; gain: number; streak: number; answerText: string };
  board?: { rank: number; score: number; gap: string; top: { name: string; score: number }[] };
  end?: { rank?: number; players?: number; score: number; correct: number; qTotal: number };
  onPick: (i: number) => void;
  onHome: () => void;
};

function BlankSentence({ text }: { text: string }) {
  const parts = text.split("___");
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 ? <span className="mx-1 inline-block min-w-14 rounded-xl bg-white/20 px-3 text-center">?</span> : null}
        </span>
      ))}
    </>
  );
}

function PlayFrame({ v }: { v: PlayView }) {
  const { stage, q, chosen, onPick } = v;
  useEffect(() => {
    if (stage !== "question") return;
    const h = (e: KeyboardEvent) => {
      const i = Number(e.key) - 1;
      if (i >= 0 && i < 4) onPick(i);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [stage, onPick]);

  const resultBg = v.result ? (v.result.correct ? "#047857" : "#be123c") : "#020617";
  const bg = stage === "result" ? resultBg : "#020617";
  const danger = v.secLeft <= 5;

  return (
    <div className="flex min-h-[560px] flex-col rounded-[32px] p-6 text-white transition-colors" style={{ background: bg }}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
        <span className="text-slate-200">{v.head}</span>
        <span className="flex items-center gap-2">
          {v.rank ? <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold">Hạng #{v.rank}</span> : null}
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold tabular-nums">{v.score.toLocaleString("vi-VN")} điểm</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center py-6">
        {stage === "wait" ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="grid h-[104px] w-[104px] animate-pulse place-items-center rounded-full border-4 border-cyan-400/60 bg-white text-4xl font-black text-slate-950">{v.name.charAt(0)}</div>
            <h2 className="text-[28px] font-black">Bạn đã vào phòng, {v.name}</h2>
            <p className="text-slate-400">Chờ giáo viên bắt đầu…</p>
          </div>
        ) : null}

        {(stage === "question" || stage === "locked") && q ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-cyan-300">Câu {v.qNo}/{v.qTotal}</span>
              <span className={`rounded-full px-3 py-1 text-sm font-black tabular-nums ${danger ? "bg-rose-500" : "bg-white/15"}`}>{Math.max(0, Math.ceil(v.secLeft))}s</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-cyan-400 transition-[width] duration-300" style={{ width: `${Math.max(0, (v.secLeft / v.durSec) * 100)}%` }} />
            </div>
            <p className="font-black leading-tight" style={{ fontSize: "clamp(24px, 3.4vw, 40px)" }}>
              <BlankSentence text={q.sentence} />
            </p>
            {stage === "question" ? (
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                {q.options.map((o, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onPick(i)}
                    className="flex min-h-24 items-center gap-3 rounded-2xl px-5 text-left text-xl font-black shadow-[inset_0_-6px_0_rgba(0,0,0,.2)]"
                    style={{ background: ANSWER_COLORS[i].bg, color: ANSWER_COLORS[i].fg }}
                  >
                    <span className="opacity-80">{LETTERS[i]}</span>
                    {o}
                  </button>
                ))}
              </div>
            ) : (
              <div
                className="grid min-h-[200px] place-items-center rounded-3xl px-6 text-center"
                style={{ background: ANSWER_COLORS[chosen ?? 0].bg, color: ANSWER_COLORS[chosen ?? 0].fg }}
              >
                <div>
                  <p className="text-2xl font-black">{chosen !== null ? `${LETTERS[chosen]}. ${q.options[chosen]}` : ""}</p>
                  <p className="mt-2 text-sm font-bold opacity-80">Đã khoá đáp án{v.answered !== undefined ? ` · ${v.answered} đã trả lời` : ""}</p>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {stage === "result" && v.result ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="grid h-[120px] w-[120px] place-items-center rounded-full bg-white/20 text-6xl font-black">{v.result.correct ? "✓" : "✕"}</div>
            <h2 className="text-[34px] font-black">{v.result.correct ? "Chính xác!" : v.result.correct === null ? "Hết giờ!" : "Chưa đúng"}</h2>
            <p className="text-xl font-extrabold">{v.result.correct ? `+${v.result.gain} điểm` : `Đáp án: ${v.result.answerText}`}</p>
            {v.result.streak > 1 ? <p className="text-sm font-bold text-white/80">{v.result.streak} câu đúng liên tiếp</p> : null}
          </div>
        ) : null}

        {stage === "board" && v.board ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-[96px] font-black leading-none">#{v.board.rank}</p>
            <p className="text-xl font-extrabold tabular-nums">{v.board.score.toLocaleString("vi-VN")} điểm</p>
            <p className="text-sm font-bold text-slate-400">{v.board.gap}</p>
            <ol className="mt-4 w-full max-w-sm list-none space-y-1.5 p-0">
              {v.board.top.map((t, i) => (
                <li key={t.name} className="flex justify-between rounded-xl bg-white/10 px-4 py-2 text-sm font-bold">
                  <span>{i + 1}. {t.name}</span>
                  <span className="tabular-nums">{t.score.toLocaleString("vi-VN")}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {stage === "end" && v.end ? (
          <div className="flex flex-col items-center gap-3 text-center">
            {v.end.rank ? <p className="text-[120px] font-black leading-none">#{v.end.rank}</p> : <p className="text-[96px] font-black leading-none tabular-nums">{v.end.score.toLocaleString("vi-VN")}</p>}
            <p className="text-lg font-bold text-slate-300">
              {v.end.players ? `trên ${v.end.players} người chơi · ` : ""}
              {v.end.score.toLocaleString("vi-VN")} điểm · {v.end.correct}/{v.end.qTotal} câu đúng
            </p>
            <button type="button" onClick={v.onHome} className="mt-3 rounded-full bg-white px-6 py-2.5 text-sm font-extrabold text-slate-950">
              Về trang chủ
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LivePlay() {
  const { room } = useWRState();
  const now = useNow(250);
  if (!room) return null;
  const me = room.players.find((p) => p.id === ME_ID);
  if (!me) return null;
  const ranked = rankOf(room.players);
  const rank = ranked.findIndex((p) => p.id === ME_ID) + 1;
  const q = room.questions[room.qIndex];
  const my = room.answers[ME_ID];
  const above = rank > 1 ? ranked[rank - 2] : null;
  const stage: PlayView["stage"] =
    room.phase === "lobby" ? "wait" : room.phase === "question" ? (my ? "locked" : "question") : room.phase === "reveal" ? "result" : room.phase === "board" ? "board" : "end";
  const v: PlayView = {
    head: `Word Rush · PIN ${fmtPin(room.pin)} · ${room.players.length} người chơi`,
    rank: room.phase === "lobby" ? undefined : rank,
    score: me.score,
    stage,
    name: me.name,
    qNo: room.qIndex + 1,
    qTotal: room.questions.length,
    secLeft: room.secPerQ - (now - room.qStartedAt) / 1000,
    durSec: room.secPerQ,
    q,
    chosen: my?.choice ?? null,
    answered: Object.keys(room.answers).length,
    result: { correct: me.lastCorrect, gain: me.lastGain, streak: me.streak, answerText: q?.options[q.answer] ?? "" },
    board: { rank, score: me.score, gap: above ? `Kém ${above.name} ${above.score - me.score} điểm` : "Bạn đang dẫn đầu", top: ranked.slice(0, 5).map((p) => ({ name: p.name, score: p.score })) },
    end: { rank, players: room.players.length, score: me.score, correct: me.correctCount, qTotal: room.questions.length },
    onPick: roomActions.answer,
    onHome: roomActions.leave,
  };
  return <PlayFrame v={v} />;
}

function SoloPlay({ set, onExit }: { set: WRSet; onExit: () => void }) {
  const qs = useMemo(() => set.questions.filter((x) => x.sentence.includes("___") && x.options.every((o) => o.trim())), [set]);
  const dur = set.secPerQ || 20;
  const [i, setI] = useState(0);
  const [stage, setStage] = useState<"question" | "result" | "end">("question");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [right, setRight] = useState(0);
  const [gain, setGain] = useState(0);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const now = useNow(250);
  const saved = useRef(false);
  const q = qs[i];

  const answer = (c: number | null) => {
    if (stage !== "question" || !q) return;
    const ok = c !== null && c === q.answer;
    const ns = ok ? streak + 1 : 0;
    const g = ok ? scoreFor(Date.now() - startedAt, dur, ns) : 0;
    setChosen(c);
    setCorrect(c === null ? null : ok);
    setStreak(ns);
    setGain(g);
    setScore((s) => s + g);
    if (ok) setRight((r) => r + 1);
    setStage("result");
  };

  const secLeft = dur - (now - startedAt) / 1000;
  const answerRef = useRef(answer);
  useEffect(() => {
    answerRef.current = answer;
  });
  useEffect(() => {
    if (stage !== "question") return;
    const t = window.setTimeout(() => answerRef.current(null), Math.max(0, dur * 1000 - (Date.now() - startedAt)));
    return () => window.clearTimeout(t);
  }, [stage, startedAt, dur]);

  useEffect(() => {
    if (stage !== "result") return;
    const t = window.setTimeout(() => {
      if (i + 1 >= qs.length) setStage("end");
      else {
        setI(i + 1);
        setChosen(null);
        setStartedAt(Date.now());
        setStage("question");
      }
    }, 3000);
    return () => window.clearTimeout(t);
  }, [stage, i, qs.length]);

  useEffect(() => {
    if (stage === "end" && !saved.current) {
      saved.current = true;
      saveResult({ setId: set.id, score, correct: right, total: qs.length, at: Date.now(), kind: "game", seconds: 0 });
    }
  }, [stage, set.id, score, right, qs.length]);

  const v: PlayView = {
    head: `Tự luyện · ${set.title}`,
    score,
    stage: stage === "question" ? (chosen !== null ? "locked" : "question") : stage,
    name: MOCK_STUDENT.name,
    qNo: i + 1,
    qTotal: qs.length,
    secLeft,
    durSec: dur,
    q,
    chosen,
    result: { correct, gain, streak, answerText: q?.options[q.answer] ?? "" },
    end: { score, correct: right, qTotal: qs.length },
    onPick: answer,
    onHome: onExit,
  };
  return (
    <div className="flex flex-col gap-3">
      <PlayFrame v={v} />
      {stage !== "end" ? (
        <button type="button" className={`${outlineBtn} self-start`} onClick={onExit}>
          ← Thoát
        </button>
      ) : null}
    </div>
  );
}

export default function StudentWordRushPage() {
  const { sets, room, results, best } = useWRState();
  const [mode, setMode] = useState<{ kind: "solo" | "test"; id: string } | null>(null);
  const [pin, setPin] = useState("");
  const [name, setName] = useState<string>(MOCK_STUDENT.name);
  const [error, setError] = useState("");
  const myClass = MOCK_CLASS_REFS[0].id;
  const assigned = useMemo(() => sets.filter((s) => s.selfPaced && s.classId === myClass), [sets, myClass]);
  const { rows, page, setPage, total, pageSize } = usePaged(assigned);
  const joined = !!room?.players.some((p) => p.id === ME_ID);
  const active = mode ? sets.find((s) => s.id === mode.id) : undefined;

  if (active && mode?.kind === "test") {
    const qs = active.questions.filter((x) => x.sentence.includes("___") && x.options.every((o) => o.trim()));
    return (
      <StudentLayout>
        <TestRunner
          title={active.title}
          description={`Kiểm tra Word Rush · ${qs.length} câu · ${active.testMin} phút`}
          questions={qs.map((x) => ({ id: x.id, sentence: x.sentence, options: x.options, answer: x.answer, explain: x.explain }))}
          minutes={active.testMin}
          onFinish={(r) => saveResult({ setId: active.id, score: r.correct * 100, correct: r.correct, total: r.total, at: Date.now(), kind: "test", seconds: r.seconds })}
          onExit={() => setMode(null)}
        />
      </StudentLayout>
    );
  }

  if (active && mode?.kind === "solo") {
    return (
      <StudentLayout>
        <SoloPlay key={active.id} set={active} onExit={() => setMode(null)} />
      </StudentLayout>
    );
  }

  if (joined) {
    return (
      <StudentLayout>
        <LivePlay />
      </StudentLayout>
    );
  }

  const join = () => {
    if (!roomActions.join(pin, name)) setError("Mã PIN chưa đúng, xem lại màn chiếu nhé.");
    else setError("");
  };

  return (
    <StudentLayout>
      <PageHeader crumb="Thi đấu cùng cả lớp hoặc tự luyện" title="Word Rush" />

      <div className="mb-8 flex flex-wrap items-start gap-8 border-b border-slate-200 pb-8">
        {room ? (
          <div className="min-w-0 flex-[999_1_420px]">
            <p className="text-[13px] font-semibold text-slate-500">Phòng của {room.teacherName} đang mở</p>
            <h2 className="text-[30px] font-extrabold">Vào phòng Word Rush</h2>
            <div className="mt-5 flex max-w-md flex-col gap-4">
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^\d ]/g, "").slice(0, 7))}
                placeholder="000 000"
                inputMode="numeric"
                aria-label="Mã PIN"
                className="w-full border-0 border-b-[3px] border-slate-950 bg-transparent pb-2 font-black tracking-[.14em] text-slate-950 outline-none placeholder:text-slate-300"
                style={{ fontSize: 44 }}
              />
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">Tên hiển thị</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" />
              </div>
              {error ? <p className="text-sm font-bold text-rose-600">{error}</p> : null}
              <button type="button" className={`${primaryBtn} self-start px-6 py-2.5`} onClick={join}>
                Vào phòng
              </button>
            </div>
          </div>
        ) : (
          <div className="min-w-0 flex-[999_1_420px]">
            <div className="mb-4 flex gap-1.5">
              {ANSWER_COLORS.map((c, i) => (
                <span key={i} className="grid h-9 w-9 place-items-center rounded-lg text-sm font-black" style={{ background: c.bg, color: c.fg }}>
                  {LETTERS[i]}
                </span>
              ))}
            </div>
            <h2 className="text-[30px] font-extrabold">Chưa có phòng nào đang mở</h2>
            <p className="mt-2 max-w-lg text-slate-600">Khi giáo viên mở phòng, màn hình này sẽ hiện ô nhập mã PIN. Trong lúc chờ, bạn có thể luyện các bài được giao ở bên dưới.</p>
          </div>
        )}
        <aside className="min-w-0 flex-[1_1_280px]">
          {room ? (
            <>
              <h3 className="mb-2 text-[17px] font-extrabold">Đang trong phòng · {room.players.length}</h3>
              <div className="flex flex-wrap gap-1.5">
                {room.players.map((p) => (
                  <span key={p.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{p.name}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="border-t-2 border-slate-950 pt-2.5">
                <p className="text-[22px] font-black tabular-nums">#{best.rank}</p>
                <p className="text-xs font-bold text-slate-500">lần chơi trước · trên {best.players} người</p>
              </div>
              <div className="border-t-2 border-slate-950 pt-2.5">
                <p className="text-[22px] font-black tabular-nums">{best.score.toLocaleString("vi-VN")}</p>
                <p className="text-xs font-bold text-slate-500">kỷ lục</p>
              </div>
            </div>
          )}
        </aside>
      </div>

      <h3 className="mb-2 text-[18px] font-extrabold">Bài được giao</h3>
      <TableFrame>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className={thClass}>Bộ câu hỏi</th>
              <th className={thClass}>Hình thức</th>
              <th className={thClass}>Số câu</th>
              <th className={thClass}>Hạn</th>
              <th className={thClass}>Kết quả của bạn</th>
              <th className={thClass} />
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const r = results[s.id];
              const isTest = s.mode === "test";
              return (
                <tr key={s.id} className="border-b border-slate-100 last:border-b-0">
                  <td className={tdClass}>
                    <div className="font-extrabold text-slate-950">{s.title}</div>
                    <div className="text-xs text-slate-500">GV {s.authorName}</div>
                  </td>
                  <td className={tdClass}>
                    {isTest ? (
                      <span className="whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">Kiểm tra · {s.testMin} phút</span>
                    ) : (
                      <span className="whitespace-nowrap rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-bold text-cyan-800">Kiểu game</span>
                    )}
                  </td>
                  <td className={`${tdClass} tabular-nums`}>{s.questions.length}</td>
                  <td className={tdClass}>{fmtDeadline(s.deadline)}</td>
                  <td className={`${tdClass} tabular-nums text-slate-600`}>
                    {r ? (r.kind === "test" ? `${r.correct}/${r.total} đúng` : `${r.score.toLocaleString("vi-VN")} điểm · ${r.correct}/${r.total} đúng`) : "Chưa làm"}
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <button type="button" className={r ? outlineBtn : primaryBtn} onClick={() => setMode({ kind: isTest ? "test" : "solo", id: s.id })}>
                      {isTest ? "Làm bài" : r ? "Luyện lại" : "Bắt đầu"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
      </TableFrame>
    </StudentLayout>
  );
}
