import type { ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TeacherLayout from "@/shared/components/layout/TeacherLayout.tsx";
import { outlineBtn, primaryBtn, surfaceClass } from "@/shared/components/PageHeader.tsx";
import { rankOf, roomActions, useWRState } from "@/features/wordRush/store.ts";
import { ANSWER_COLORS, LETTERS, fmtPin } from "@/features/wordRush/constants.ts";
import { useNow } from "@/features/wordRush/useNow.ts";
import type { WRRoom } from "@/features/wordRush/types.ts";

const RANK_COLORS = ["#f59e0b", "#cbd5e1", "#d97706", "#94a3b8", "#94a3b8"];

/** Teacher presentation screen, sized entirely in cqw like design v5 (16:9, container-type: inline-size). */
function Screen({ room }: { room: WRRoom }) {
  const now = useNow(250);
  const q = room.questions[Math.min(room.qIndex, room.questions.length - 1)];
  const total = room.questions.length;
  const ranked = rankOf(room.players);
  const reveal = room.phase === "reveal";
  const left = room.phase === "question" ? Math.max(0, Math.ceil(room.secPerQ - (now - room.qStartedAt) / 1000)) : 0;
  const tColor = left <= 5 ? "#f43f5e" : "#22d3ee";
  const answered = Object.keys(room.answers).length;
  const dist = [0, 0, 0, 0];
  Object.values(room.answers).forEach((a) => (dist[a.choice] += 1));
  const maxDist = Math.max(1, ...dist);

  let body: ReactNode;
  if (room.phase === "lobby") {
    body = (
      <div className="absolute inset-0 grid grid-cols-[1fr_1.15fr]" style={{ gap: "3cqw", padding: "4.5cqw" }}>
        <div className="flex flex-col justify-center" style={{ gap: ".8cqw" }}>
          <span className="font-bold text-[#94a3b8]" style={{ fontSize: "1.6cqw" }}>
            Mở <b className="text-white">englishcenter.vn/play</b> trên điện thoại
          </span>
          <span className="font-extrabold uppercase text-[#67e8f9]" style={{ fontSize: "1.3cqw", letterSpacing: ".3em", marginTop: "1.6cqw" }}>
            Mã PIN
          </span>
          <span className="font-black" style={{ fontSize: "9cqw", lineHeight: 1 }}>
            {fmtPin(room.pin)}
          </span>
          <span className="font-extrabold text-[#cbd5e1]" style={{ fontSize: "1.9cqw", marginTop: "1.4cqw" }}>
            {room.players.length} người chơi · {room.title}
          </span>
        </div>
        <div className="flex flex-wrap content-center self-center" style={{ gap: ".8cqw" }}>
          {room.players.map((p) => (
            <span key={p.id} className="rounded-full font-extrabold" style={{ padding: ".8cqw 1.5cqw", background: "rgba(255,255,255,.08)", fontSize: "1.6cqw" }}>
              {p.name}
            </span>
          ))}
        </div>
      </div>
    );
  } else if (room.phase === "question" || reveal) {
    const parts = q.sentence.split("___");
    body = (
      <div className="absolute inset-0 flex flex-col" style={{ padding: "3cqw 3.5cqw", gap: "1.6cqw" }}>
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-[#94a3b8]" style={{ fontSize: "1.6cqw" }}>
            Câu {room.qIndex + 1}/{total}
          </span>
          <span className="font-extrabold text-[#cbd5e1]" style={{ fontSize: "1.6cqw" }}>
            {answered}/{room.players.length} đã trả lời · <b style={{ color: tColor }}>{left}s</b>
          </span>
        </div>
        <div className="overflow-hidden rounded-full" style={{ height: ".5cqw", background: "rgba(255,255,255,.08)" }}>
          <div className="h-full" style={{ background: tColor, width: `${(left / room.secPerQ) * 100}%`, transition: "width 1s linear" }} />
        </div>
        <div className="flex flex-1 flex-col justify-center" style={{ gap: "1.2cqw" }}>
          <p className="m-0 font-black [text-wrap:balance]" style={{ fontSize: "4cqw", lineHeight: 1.35, letterSpacing: "-0.02em" }}>
            {parts[0]}
            <span
              className="inline-block text-center"
              style={{
                minWidth: "12cqw",
                margin: "0 .6cqw",
                padding: "0 1.4cqw",
                borderRadius: "1cqw",
                background: reveal ? "rgba(16,185,129,.22)" : "rgba(59,130,246,.22)",
                color: reveal ? "#6ee7b7" : "#93c5fd",
                borderBottom: `.4cqw solid ${reveal ? "#10b981" : "#60a5fa"}`,
              }}
            >
              {reveal ? q.options[q.answer] : "?"}
            </span>
            {parts.slice(1).join("___")}
          </p>
          {reveal && q.explain ? (
            <span className="text-[#cbd5e1]" style={{ fontSize: "1.7cqw" }}>
              {q.explain}
            </span>
          ) : null}
        </div>
        <div className="grid grid-cols-2" style={{ gap: "1.2cqw" }}>
          {q.options.map((o, i) => {
            const right = reveal && i === q.answer;
            return (
              <div
                key={i}
                className="relative flex items-center overflow-hidden"
                style={{
                  gap: "1.4cqw",
                  padding: "1.5cqw 1.8cqw",
                  borderRadius: "1.6cqw",
                  background: right ? "#059669" : ANSWER_COLORS[i].bg,
                  color: right ? "#fff" : ANSWER_COLORS[i].fg,
                  opacity: reveal && !right ? 0.35 : 1,
                  boxShadow: "inset 0 -.5cqw 0 rgba(0,0,0,.2)",
                }}
              >
                <div className="absolute inset-y-0 left-0" style={{ width: reveal ? `${(dist[i] / maxDist) * 100}%` : "0%", background: "rgba(255,255,255,.2)", transition: "width .7s" }} />
                <span className="relative grid shrink-0 place-items-center font-black" style={{ width: "3.6cqw", height: "3.6cqw", borderRadius: "1cqw", background: "rgba(255,255,255,.24)", fontSize: "1.8cqw" }}>
                  {LETTERS[i]}
                </span>
                <span className="relative flex-1 font-black" style={{ fontSize: "2.4cqw" }}>
                  {o}
                </span>
                <span className="relative font-black" style={{ fontSize: "2.4cqw" }}>
                  {reveal ? dist[i] : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    // board (after a question) and podium (final standings) share one layout in the design
    const top = ranked.slice(0, 5);
    const max = Math.max(1, top[0]?.score ?? 1);
    body = (
      <div className="absolute inset-0 flex flex-col justify-center" style={{ gap: "1cqw", padding: "3cqw 10cqw" }}>
        <span className="font-extrabold uppercase text-[#67e8f9]" style={{ fontSize: "1.4cqw", letterSpacing: ".3em", marginBottom: "1cqw" }}>
          {room.phase === "podium" ? "Kết quả chung cuộc" : `Bảng xếp hạng · sau câu ${room.qIndex + 1}`}
        </span>
        {top.map((p, i) => (
          <div key={p.id} className="relative flex items-center overflow-hidden" style={{ gap: "1.8cqw", padding: "1.3cqw 2cqw", borderRadius: "1.4cqw", background: i === 0 ? "rgba(245,158,11,.16)" : "rgba(255,255,255,.05)" }}>
            <div className="absolute inset-y-0 left-0" style={{ width: `${(p.score / max) * 100}%`, background: "rgba(59,130,246,.2)" }} />
            <span className="relative font-black" style={{ width: "3cqw", fontSize: "2.4cqw", color: RANK_COLORS[i] }}>
              {i + 1}
            </span>
            <span className="relative flex-1 truncate font-black" style={{ fontSize: "2.5cqw" }}>
              {p.name}
            </span>
            <span className="relative font-black" style={{ fontSize: "2.5cqw" }}>
              {p.score.toLocaleString("vi-VN")}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto aspect-video overflow-hidden rounded-3xl bg-[#020617] text-white"
      style={{
        width: "min(100%, calc((100vh - 130px) * 16 / 9))",
        containerType: "inline-size",
        backgroundImage: "radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {body}
    </div>
  );
}

const DOT: Record<WRRoom["phase"], string> = { lobby: "#22d3ee", question: "#f43f5e", reveal: "#10b981", board: "#3b82f6", podium: "#f59e0b" };

export default function TeacherWordRushRoomPage() {
  const { room } = useWRState();
  const navigate = useNavigate();

  // The room is opened from the list/editor ("Trình chiếu"); without one there is nothing to show.
  if (!room) return <Navigate to="/teacher/word-rush" replace />;

  const total = room.questions.length;
  const last = room.qIndex + 1 >= total;
  const answered = Object.keys(room.answers).length;
  const status: Record<WRRoom["phase"], string> = {
    lobby: `Đang chờ học viên vào bằng PIN ${fmtPin(room.pin)}`,
    question: `Đang nhận câu trả lời · ${answered}/${room.players.length}`,
    reveal: `Đáp án câu ${room.qIndex + 1}`,
    board: "Bảng xếp hạng",
    podium: `Đã kết thúc · ${room.players.length} người chơi`,
  };
  const close = () => {
    roomActions.close();
    navigate("/teacher/word-rush");
  };
  const primary: Record<WRRoom["phase"], { label: string; run: () => void }> = {
    lobby: { label: `Bắt đầu · ${room.players.length} người`, run: roomActions.start },
    question: { label: "Kết thúc câu này", run: roomActions.endQuestion },
    reveal: last ? { label: "Kết quả chung cuộc", run: roomActions.toFinal } : { label: "Bảng xếp hạng", run: roomActions.toBoard },
    board: { label: "Câu tiếp theo", run: roomActions.next },
    podium: {
      label: "Lưu & đóng phòng",
      run: () => {
        close();
        toast.success("Đã đóng phòng · kết quả lưu vào báo cáo");
      },
    },
  };
  const act = primary[room.phase];

  return (
    <TeacherLayout>
      <div className="flex flex-col gap-3">
        <Screen room={room} />
        <div className={`${surfaceClass} flex min-h-16 flex-wrap items-center justify-between gap-3 !rounded-[18px] py-3 pl-[18px] pr-3.5`}>
          <div className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-full" style={{ background: DOT[room.phase] }} />
            <span className="text-sm font-extrabold text-slate-950">{status[room.phase]}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={close} className={`${outlineBtn} !h-10 !px-4 !text-[13px] !font-extrabold whitespace-nowrap`}>
              Đóng phòng
            </button>
            <button type="button" onClick={act.run} disabled={room.phase === "lobby" && total === 0} className={`${primaryBtn} !h-10 !px-5 !text-sm !font-extrabold whitespace-nowrap`}>
              {act.label}
            </button>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
