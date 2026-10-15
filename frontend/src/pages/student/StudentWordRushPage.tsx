import { useEffect, useMemo, useState, type FormEvent } from "react";
import StudentLayout from "@/shared/components/layout/StudentLayout.tsx";
import PageHeader, { surfaceClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import SearchInput from "@/shared/components/ui/SearchInput.tsx";
import Segmented from "@/shared/components/ui/Segmented.tsx";
import { Tag } from "@/shared/components/ui/Tag.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { useAuth } from "@/features/auth/useAuth.ts";
import { nowDate } from "@/shared/utils/now.ts";
import { useStudentScope } from "@/features/flashcards/useStudentScope.ts";
import StudentRush from "@/features/wordRush/StudentRush.tsx";
import { fmtDeadline, rankOf, roomActions, useWRState } from "@/features/wordRush/store.ts";
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

function LivePlay({ playerId }: { playerId: string }) {
  const { room } = useWRState();
  const now = useNow(250);
  if (!room) return null;
  const me = room.players.find((p) => p.id === playerId);
  if (!me) return null;
  const ranked = rankOf(room.players);
  const rank = ranked.findIndex((p) => p.id === playerId) + 1;
  const q = room.questions[room.qIndex];
  const my = room.answers[playerId];
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
    onPick: (i) => roomActions.answer(i, playerId),
    onHome: () => roomActions.leave(playerId),
  };
  return <PlayFrame v={v} />;
}

type Filter = "all" | "todo" | "game" | "test";

/** Tests are one attempt and close at the deadline (end of that day); practice sets stay playable. */
function rowState(s: WRSet, done: boolean) {
  const expired = s.deadline < nowDate();
  const locked = s.mode === "test" && (done || expired);
  return { expired, locked };
}

export default function StudentWordRushPage() {
  const { sets, room, results } = useWRState();
  const { user } = useAuth();
  const [mode, setMode] = useState<{ kind: "solo" | "test"; id: string } | null>(null);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const name = user?.fullName || user?.username || "Học viên";
  const { courseIds } = useStudentScope();
  const assigned = useMemo(() => sets.filter((s) => s.selfPaced && courseIds.has(s.classId)), [sets, courseIds]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: assigned.length, todo: 0, game: 0, test: 0 };
    assigned.forEach((s) => {
      if (!results[s.id]) c.todo += 1;
      c[s.mode] += 1;
    });
    return c;
  }, [assigned, results]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return assigned.filter((s) => {
      if (filter === "todo" ? !!results[s.id] : filter !== "all" && s.mode !== filter) return false;
      return !needle || `${s.title} ${s.authorName}`.toLowerCase().includes(needle);
    });
  }, [assigned, results, q, filter]);

  const { rows, page, setPage, total, pageSize } = usePaged(filtered, `${q}|${filter}`);
  const joined = !!user && !!room?.players.some((p) => p.id === user.id);
  const active = mode ? sets.find((s) => s.id === mode.id) : undefined;

  if (active) {
    return (
      <StudentLayout>
        <StudentRush key={active.id} set={active} prevBest={results[active.id]?.kind === "game" ? results[active.id].score : 0} onExit={() => setMode(null)} />
      </StudentLayout>
    );
  }

  if (joined) {
    return (
      <StudentLayout>
        <LivePlay playerId={user!.id} />
      </StudentLayout>
    );
  }

  const join = (e: FormEvent) => {
    e.preventDefault();
    if (pin.length < 6) return setPinErr("Mã PIN gồm 6 chữ số.");
    if (!user || !roomActions.join(pin, { id: user.id, name })) return setPinErr("Chưa có phòng nào dùng mã này. Xem lại màn chiếu nhé.");
    setPinErr("");
  };

  const start = (s: WRSet) => {
    if (rowState(s, !!results[s.id]).locked) return;
    setMode({ kind: s.mode === "test" ? "test" : "solo", id: s.id });
  };

  return (
    <StudentLayout>
      <div className="flex flex-col gap-6">
        <PageHeader crumb="Word Rush" title="Điền đúng, điền nhanh" />

        <section
          className="flex flex-wrap items-center justify-between gap-x-7 gap-y-[18px] overflow-hidden rounded-[28px] bg-[#e8f0ff] p-[clamp(20px,3vw,28px)] text-slate-950 shadow-[0_0_0_1px_#c7dafe,0_14px_30px_-18px_rgba(37,99,235,.45)]"
          style={{ backgroundImage: "radial-gradient(rgba(37,99,235,.12) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        >
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="grid shrink-0 grid-cols-[repeat(2,22px)] gap-1">
              {ANSWER_COLORS.map((c, i) => (
                <span key={i} className="h-[22px] rounded-md" style={{ background: c.bg }} />
              ))}
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-lg font-black">Vào phòng của lớp</span>
              <span className="text-[13px] text-slate-600">
                Nhập mã PIN đang hiện trên màn chiếu của giáo viên.
              </span>
            </div>
          </div>
          <form onSubmit={join} className="flex min-w-[min(100%,240px)] flex-[0_1_320px] flex-col gap-1.5">
            <div className="flex gap-2">
              <input
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setPinErr("");
                }}
                inputMode="numeric"
                placeholder="Mã PIN"
                aria-label="Mã PIN"
                className="h-12 min-w-0 flex-1 rounded-[14px] border-[1.5px] border-blue-600/15 bg-blue-600/[.06] px-4 text-lg font-black tracking-[.18em] text-slate-950 outline-none focus:border-cyan-400"
              />
              <button type="submit" className="h-12 rounded-[14px] bg-[#1f2937] px-5 text-[15px] font-black text-white hover:bg-[#0b1220]">
                Vào
              </button>
            </div>
            {pinErr ? <span className="text-[13px] font-bold text-rose-700">{pinErr}</span> : null}
          </form>
        </section>

        <section className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_0_4px_#cffafe]" />
            <h2 className="text-lg font-extrabold">Bài được giao</h2>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5">
            <SearchInput value={q} onChange={setQ} placeholder="Tìm bài theo tên hoặc giáo viên" className="max-w-[380px] flex-1 basis-[260px]" />
            <Segmented
              square
              value={filter}
              onChange={setFilter}
              options={[
                { key: "all", label: "Tất cả", count: counts.all },
                { key: "todo", label: "Chưa làm", count: counts.todo },
                { key: "game", label: "Luyện tập", count: counts.game },
                { key: "test", label: "Kiểm tra", count: counts.test },
              ]}
            />
          </div>
          <div className={`${surfaceClass} px-5 pt-1`}>
            {rows.length === 0 ? (
              <div className="py-6 text-sm text-slate-500">{q.trim() ? `Không tìm thấy bài nào khớp “${q.trim()}”.` : assigned.length === 0 ? "Giáo viên chưa giao bài Word Rush nào cho lớp của bạn. Khi có bài mới, nó sẽ hiện ở đây." : "Không có bài nào trong mục này."}</div>
            ) : (
              rows.map((s, i) => {
                const r = results[s.id];
                const game = s.mode === "game";
                const { expired, locked } = rowState(s, !!r);
                const missed = expired && !r && !game;
                return (
                  <div key={s.id} className={`flex flex-wrap items-center gap-x-[18px] gap-y-3 py-[18px] ${i ? "border-t border-dashed border-slate-200" : ""}`}>
                    <Tag width={86} bg={game ? "#ecfeff" : "#fffbeb"} fg={game ? "#155e75" : "#92400e"} className="!py-[5px]">
                      {game ? "Luyện tập" : "Kiểm tra"}
                    </Tag>
                    <div className="flex min-w-0 flex-[1_1_160px] flex-col gap-[3px]">
                      <span className="break-words text-base font-extrabold text-slate-950">{s.title}</span>
                      <span className="text-[13px] text-slate-500">
                        {s.questions.length} câu{game ? "" : ` · ${s.testMin} phút`} · hạn {fmtDeadline(s.deadline)} · {s.authorName}
                      </span>
                    </div>
                    <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-3">
                      <div className="flex min-w-[84px] flex-col items-end whitespace-nowrap">
                        <span className={`text-base font-black ${r ? "text-slate-950" : missed ? "text-rose-600" : "text-slate-400"}`}>
                          {r ? (game ? r.score.toLocaleString("vi-VN") : `${r.correct}/${r.total}`) : missed ? "Quá hạn" : "Chưa làm"}
                        </span>
                        <span className="text-xs font-bold text-slate-400">{r ? (game ? "điểm cao nhất" : "câu đúng") : `hạn ${fmtDeadline(s.deadline)}`}</span>
                      </div>
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => start(s)}
                        className={`h-10 min-w-24 rounded-full px-[18px] text-sm font-extrabold disabled:cursor-not-allowed ${locked ? "bg-slate-100 text-slate-400" : "bg-[#1f2937] text-white hover:bg-[#111827]"}`}
                      >
                        {game ? (r ? "Chơi lại" : "Chơi") : r ? "Đã nộp" : expired ? "Hết hạn" : "Làm bài"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
            <div className="-mx-5">
              <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
            </div>
          </div>
        </section>
      </div>
    </StudentLayout>
  );
}
