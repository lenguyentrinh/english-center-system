import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TeacherLayout from "@/shared/components/layout/TeacherLayout.tsx";
import PageHeader, { TableFrame, tdClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { MOCK_CLASS_REFS, MOCK_TEACHER } from "@/features/mock/common.ts";
import { isValidQuestion, rankOf, roomActions, useWRState } from "@/features/wordRush/store.ts";
import { ANSWER_COLORS, LETTERS, fmtPin } from "@/features/wordRush/constants.ts";
import { useNow } from "@/features/wordRush/useNow.ts";
import type { WRRoom } from "@/features/wordRush/types.ts";

const cq = (n: number) => `${n}cqw`;

function Sentence({ text, fill, ok }: { text: string; fill?: string; ok?: boolean }) {
  const parts = text.split("___");
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 ? (
            <span
              className="mx-[0.4cqw] inline-block rounded-[1cqw] px-[1.2cqw] text-center"
              style={{ background: fill ? (ok ? "#10b981" : "rgba(255,255,255,.15)") : "rgba(255,255,255,.18)", minWidth: cq(7) }}
            >
              {fill ?? "?"}
            </span>
          ) : null}
        </span>
      ))}
    </>
  );
}

function Ring({ left, total }: { left: number; total: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const danger = left <= 5;
  return (
    <div className="relative" style={{ width: cq(9), height: cq(9) }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={danger ? "#f43f5e" : "#22d3ee"} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, left) / total)} />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-black tabular-nums" style={{ fontSize: cq(3.6), color: danger ? "#fb7185" : "#fff" }}>
        {Math.max(0, Math.ceil(left))}
      </span>
    </div>
  );
}

function Screen({ room }: { room: WRRoom }) {
  const now = useNow(250);
  const q = room.questions[room.qIndex];
  const ranked = rankOf(room.players);
  const total = room.questions.length;
  const left = room.phase === "question" ? room.secPerQ - (now - room.qStartedAt) / 1000 : 0;
  const answered = Object.keys(room.answers).length;
  const dist = [0, 0, 0, 0];
  Object.values(room.answers).forEach((a) => (dist[a.choice] += 1));
  const maxDist = Math.max(1, ...dist);

  let body;
  if (room.phase === "lobby") {
    body = (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="font-extrabold uppercase tracking-[.3em] text-cyan-300" style={{ fontSize: cq(1.4) }}>Word Rush</p>
        <p className="mt-[1.2cqw] font-bold text-slate-300" style={{ fontSize: cq(2) }}>Mở englishcenter.vn/play trên điện thoại</p>
        <p className="mt-[2cqw] font-bold text-slate-400" style={{ fontSize: cq(1.6) }}>Mã PIN</p>
        <p className="font-black tabular-nums text-white" style={{ fontSize: cq(9.5), lineHeight: 1.1 }}>{fmtPin(room.pin)}</p>
        <p className="mt-[1.5cqw] font-bold text-cyan-300" style={{ fontSize: cq(2) }}>{room.players.length} người chơi</p>
        <div className="mt-[2cqw] flex max-w-[80%] flex-wrap justify-center gap-[.8cqw]">
          {room.players.map((p) => (
            <span key={p.id} className="rounded-full bg-white/10 px-[1.4cqw] py-[.5cqw] font-bold text-white" style={{ fontSize: cq(1.5) }}>{p.name}</span>
          ))}
        </div>
      </div>
    );
  } else if (room.phase === "question" || room.phase === "reveal") {
    const reveal = room.phase === "reveal";
    body = (
      <div className="flex h-full flex-col" style={{ gap: cq(2) }}>
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-cyan-300" style={{ fontSize: cq(1.8) }}>
            Câu {room.qIndex + 1}/{total} · {q.topic}
          </span>
          {reveal ? (
            <span className="rounded-full bg-emerald-500 px-[1.6cqw] py-[.5cqw] font-black text-white" style={{ fontSize: cq(1.6) }}>Đáp án</span>
          ) : (
            <div className="flex items-center" style={{ gap: cq(2) }}>
              <span className="font-bold text-slate-300" style={{ fontSize: cq(1.8) }}>{answered}/{room.players.length} đã trả lời</span>
              <Ring left={left} total={room.secPerQ} />
            </div>
          )}
        </div>
        <p className="font-black leading-tight text-white" style={{ fontSize: cq(4) }}>
          <Sentence text={q.sentence} fill={reveal ? q.options[q.answer] : undefined} ok />
        </p>
        <div className="grid flex-1 grid-cols-2" style={{ gap: cq(1.4) }}>
          {q.options.map((o, i) => {
            const dim = reveal && i !== q.answer;
            return (
              <div
                key={i}
                className="relative flex items-center overflow-hidden font-black"
                style={{
                  background: ANSWER_COLORS[i].bg,
                  color: ANSWER_COLORS[i].fg,
                  borderRadius: cq(1.6),
                  padding: `0 ${cq(2)}`,
                  fontSize: cq(2.8),
                  opacity: dim ? 0.35 : 1,
                  boxShadow: "inset 0 -.5cqw 0 rgba(0,0,0,.2)",
                  outline: reveal && i === q.answer ? `${cq(.4)} solid #34d399` : undefined,
                }}
              >
                <span className="mr-[1.4cqw] opacity-80">{LETTERS[i]}</span>
                <span className="flex-1">{o}</span>
                {reveal ? (
                  <span className="ml-[1cqw] font-black tabular-nums" style={{ fontSize: cq(2.4) }}>{dist[i]}</span>
                ) : null}
                {reveal ? <span className="absolute bottom-0 left-0 bg-black/25" style={{ height: cq(.7), width: `${(dist[i] / maxDist) * 100}%` }} /> : null}
              </div>
            );
          })}
        </div>
        {reveal && q.explain ? (
          <p className="font-semibold text-slate-300" style={{ fontSize: cq(1.6) }}>{q.explain}</p>
        ) : null}
      </div>
    );
  } else if (room.phase === "board") {
    const top = ranked.slice(0, 5);
    const max = Math.max(1, top[0]?.score ?? 1);
    body = (
      <div className="flex h-full flex-col justify-center" style={{ gap: cq(1.4) }}>
        <p className="font-extrabold uppercase tracking-[.3em] text-cyan-300" style={{ fontSize: cq(1.4) }}>Bảng xếp hạng · sau câu {room.qIndex + 1}</p>
        {top.map((p, i) => {
          const delta = p.prevRank ? p.prevRank - (i + 1) : 0;
          return (
            <div key={p.id} className="flex items-center rounded-[1.2cqw] bg-white/5 px-[1.6cqw] py-[1cqw]" style={{ gap: cq(1.6) }}>
              <span className="w-[3cqw] font-black text-white tabular-nums" style={{ fontSize: cq(2.6) }}>{i + 1}</span>
              <span className="w-[16cqw] truncate font-extrabold text-white" style={{ fontSize: cq(2.2) }}>{p.name}</span>
              <div className="h-[1.6cqw] flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-400" style={{ width: `${(p.score / max) * 100}%` }} />
              </div>
              <span className="w-[9cqw] text-right font-black tabular-nums text-white" style={{ fontSize: cq(2.2) }}>{p.score.toLocaleString("vi-VN")}</span>
              <span className="w-[5cqw] text-right font-black" style={{ fontSize: cq(1.6), color: delta > 0 ? "#34d399" : delta < 0 ? "#fb7185" : "#94a3b8" }}>
                {delta > 0 ? `▲${delta}` : delta < 0 ? `▼${-delta}` : "–"}
              </span>
            </div>
          );
        })}
      </div>
    );
  } else {
    const [a, b, c] = ranked;
    const cols = [
      { p: b, h: 46, bg: "#cbd5e1", n: 2 },
      { p: a, h: 62, bg: "#f59e0b", n: 1 },
      { p: c, h: 34, bg: "#d97706", n: 3 },
    ];
    body = (
      <div className="flex h-full flex-col">
        <p className="text-center font-extrabold uppercase tracking-[.3em] text-cyan-300" style={{ fontSize: cq(1.6) }}>Bục vinh danh</p>
        <div className="flex flex-1 items-end justify-center" style={{ gap: cq(2) }}>
          {cols.map(({ p, h, bg, n }) => (
            <div key={n} className="flex h-full flex-col justify-end text-center" style={{ width: cq(20) }}>
              <p className="truncate font-black text-white" style={{ fontSize: cq(2.2) }}>{p?.name ?? "—"}</p>
              <p className="font-bold tabular-nums text-slate-300" style={{ fontSize: cq(1.6), marginBottom: cq(.8) }}>{(p?.score ?? 0).toLocaleString("vi-VN")}</p>
              <div className="grid place-items-start justify-center font-black text-slate-950" style={{ height: `${h}%`, background: bg, borderRadius: `${cq(1.2)} ${cq(1.2)} 0 0`, fontSize: cq(5), paddingTop: cq(1) }}>
                {n}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-3xl" style={{ containerType: "inline-size" }}>
      <div className="aspect-video w-full bg-slate-950" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px)", backgroundSize: "24px 24px", padding: cq(3) }}>
        {body}
      </div>
    </div>
  );
}

function RoomView({ room }: { room: WRRoom }) {
  const total = room.questions.length;
  const last = room.qIndex + 1 >= total;
  const desc: Record<WRRoom["phase"], string> = {
    lobby: "Phòng chờ · học viên đang vào",
    question: `Câu ${room.qIndex + 1}/${total} đang diễn ra`,
    reveal: "Đang hiện đáp án",
    board: "Bảng xếp hạng",
    podium: "Kết thúc trận",
  };
  const btn = "rounded-full bg-slate-950 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-slate-800";
  return (
    <div className="flex flex-col gap-3">
      <Screen room={room} />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <span className={`h-2.5 w-2.5 rounded-full ${room.phase === "question" ? "animate-pulse bg-emerald-500" : "bg-slate-400"}`} />
          {desc[room.phase]} · PIN {fmtPin(room.pin)} · {room.players.length} người chơi
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={roomActions.toggleAuto} className="rounded-full border border-slate-200 px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50">
            Tự chuyển câu: {room.auto ? "Bật" : "Tắt"}
          </button>
          {room.phase === "lobby" ? (
            <button type="button" className={btn} onClick={roomActions.start} disabled={total === 0}>
              Bắt đầu · {room.players.length} người
            </button>
          ) : null}
          {room.phase === "question" ? <button type="button" className={btn} onClick={roomActions.endQuestion}>Kết thúc câu này</button> : null}
          {room.phase === "reveal" ? <button type="button" className={btn} onClick={roomActions.toBoard}>Bảng xếp hạng</button> : null}
          {room.phase === "board" ? (
            <button type="button" className={btn} onClick={roomActions.next}>{last ? "Bục vinh danh" : "Câu tiếp theo"}</button>
          ) : null}
          {room.phase === "podium" ? (
            <Link to={`/teacher/word-rush/sets/${room.setId}`} className={btn} onClick={roomActions.close}>Xem báo cáo</Link>
          ) : null}
          <button type="button" onClick={roomActions.close} className="rounded-full border border-rose-200 px-4 py-2 text-[13px] font-bold text-rose-600 hover:bg-rose-50">
            Đóng phòng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeacherWordRushRoomPage() {
  const { sets, room } = useWRState();
  const mine = useMemo(() => sets.filter((s) => s.authorId === MOCK_TEACHER.id), [sets]);
  const [pick, setPick] = useState<string>(mine[0]?.id ?? "");
  const { rows, page, setPage, total, pageSize } = usePaged(mine);
  const chosen = mine.find((s) => s.id === pick);
  const valid = chosen ? chosen.questions.filter(isValidQuestion).length : 0;

  return (
    <TeacherLayout wide>
      <PageHeader
        crumb={<Link to="/teacher/word-rush" className="font-extrabold text-blue-600 hover:underline">← Word Rush của tôi</Link>}
        title={room ? `Phòng chơi · ${room.title}` : "Mở phòng chơi"}
      />
      {room ? (
        <RoomView room={room} />
      ) : (
        <div className="flex flex-wrap items-start gap-6">
          <div className="min-w-0 flex-[999_1_560px]">
            <h3 className="mb-2 text-[17px] font-extrabold">1. Chọn bộ câu hỏi</h3>
            <TableFrame>
              <ul className="m-0 list-none p-0">
                {rows.map((s) => (
                  <li key={s.id} className="border-b border-slate-100 last:border-b-0">
                    <label className={`${tdClass} flex cursor-pointer items-center gap-3 hover:bg-slate-50`}>
                      <input type="radio" name="set" className="h-4 w-4 accent-slate-950" checked={pick === s.id} onChange={() => setPick(s.id)} />
                      <span className="flex-1">
                        <span className="block font-extrabold text-slate-950">{s.title}</span>
                        <span className="text-xs text-slate-500">
                          {MOCK_CLASS_REFS.find((c) => c.id === s.classId)?.name} · {s.questions.length} câu
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
            </TableFrame>
          </div>
          <aside className="min-w-0 flex-[1_1_300px] rounded-3xl bg-slate-950 p-5 text-white">
            <h3 className="text-[17px] font-extrabold">Phòng sẽ dùng</h3>
            <p className="mt-2 text-lg font-extrabold">{chosen?.title ?? "Chưa chọn bộ"}</p>
            <p className="mt-1 text-sm text-slate-300">
              {valid} câu hợp lệ · {chosen?.secPerQ ?? 20} giây mỗi câu
            </p>
            <p className="mt-3 text-[13px] text-slate-400">Bộ câu hỏi được chốt lúc mở phòng; sửa bộ sau đó không ảnh hưởng trận đang chơi.</p>
            <button
              type="button"
              disabled={!chosen || valid === 0}
              onClick={() => chosen && roomActions.open(chosen.id)}
              className="mt-4 w-full rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-slate-950 disabled:opacity-40"
            >
              Mở phòng &amp; hiện PIN
            </button>
          </aside>
        </div>
      )}
    </TeacherLayout>
  );
}
