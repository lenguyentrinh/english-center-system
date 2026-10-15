import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import StudentLayout from "@/shared/components/layout/StudentLayout.tsx";
import { outlineBtn, primaryBtn } from "@/shared/components/PageHeader.tsx";
import Highlight from "@/features/flashcards/Highlight.tsx";
import { finishStudy, setHardCards, useDeck, useStudentDecks } from "@/features/flashcards/store.ts";
import { SOURCE_TAG, hardIds as liveHardIds, sourceOf } from "@/features/flashcards/studentUi.ts";
import type { Deck } from "@/features/flashcards/types.ts";

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

const NotFound = ({ text }: { text: string }) => (
  <StudentLayout>
    <Link to="/student/flashcards" className="text-[13px] font-bold text-slate-600 underline underline-offset-4 hover:opacity-70">
      ← Bộ thẻ
    </Link>
    <p className="mt-6 text-sm text-slate-500">{text}</p>
  </StudentLayout>
);

export default function StudentFlashcardStudyPage() {
  const { id } = useParams();
  const deck = useDeck(id);
  const visible = useStudentDecks();
  const item = visible.find((x) => x.deck.id === id);
  const [params] = useSearchParams();
  if (!deck || !item) return <NotFound text="Không tìm thấy bộ thẻ hoặc bộ thẻ không còn được giao cho bạn." />;
  if (deck.cards.length === 0) return <NotFound text="Bộ thẻ này chưa có thẻ nào." />;
  const initialHard = liveHardIds(deck, item.progress);
  const hardOnly = params.get("hard") === "1";
  if (hardOnly && initialHard.length === 0) return <NotFound text="Bạn chưa đánh dấu thẻ khó nào trong bộ này." />;
  return <StudyRun key={`${deck.id}:${hardOnly}`} deck={deck} hardOnly={hardOnly} initialHard={initialHard} />;
}

function StudyRun({ deck, hardOnly, initialHard }: { deck: Deck; hardOnly: boolean; initialHard: string[] }) {
  const navigate = useNavigate();
  // Queue is fixed for the run: all cards, or only the cards flagged hard when the run started.
  const queue = useMemo(() => (hardOnly ? deck.cards.filter((c) => initialHard.includes(c.id)) : deck.cards), [deck.cards, hardOnly, initialHard]);
  const [qi, setQi] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [instant, setInstant] = useState(true);
  const [hard, setHard] = useState<string[]>(initialHard);
  const [done, setDone] = useState<{ minutes: number; hard: number } | null>(null);
  const [startedAt] = useState(() => Date.now());

  const n = queue.length;
  const card = queue[Math.min(qi, n - 1)];
  const isHard = hard.includes(card.id);
  const last = qi >= n - 1;
  const tag = SOURCE_TAG[sourceOf(deck)];

  const finish = () => {
    const hardNow = hard.filter((h) => deck.cards.some((c) => c.id === h));
    finishStudy(deck.id, { hardIds: hardNow, studiedIds: queue.map((c) => c.id) });
    setDone({ minutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)), hard: hardNow.length });
  };
  const exit = () => {
    setHardCards(deck.id, hard);
    navigate("/student/flashcards");
  };
  const move = (dir: 1 | -1) => {
    const ni = qi + dir;
    if (ni < 0) return;
    if (ni >= n) return finish();
    setInstant(true);
    setFlipped(false);
    setQi(ni);
  };
  const flip = () => {
    setInstant(false);
    setFlipped((v) => !v);
  };
  const toggleHard = () => setHard((h) => (h.includes(card.id) ? h.filter((x) => x !== card.id) : [...h, card.id]));

  // The no-transition frame after a card swap is cleared on the next tick so the back face never flashes.
  useEffect(() => {
    if (!instant) return;
    const t = window.setTimeout(() => setInstant(false), 50);
    return () => window.clearTimeout(t);
  }, [instant, qi]);

  const actions = useRef({ move, flip, toggleHard });
  useEffect(() => {
    actions.current = { move, flip, toggleHard };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        actions.current.flip();
      } else if (e.key === "ArrowRight") actions.current.move(1);
      else if (e.key === "ArrowLeft") actions.current.move(-1);
      else if (e.key === "k" || e.key === "K") actions.current.toggleHard();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (done) {
    return (
      <StudentLayout>
        <div className="mx-auto flex min-h-[calc(100vh-130px)] max-w-[560px] flex-col items-center justify-center gap-[18px] text-center">
          <span className="grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <h1 className="text-[clamp(26px,3.6vw,36px)] font-black tracking-tight">Xong bộ thẻ rồi!</h1>
          <span className="text-[15px] text-slate-600">{deck.title}</span>
          <div className="flex gap-9 py-2">
            {[
              [String(n), "thẻ đã xem", "#020617"],
              [String(done.hard), "thẻ khó", done.hard ? "#d97706" : "#020617"],
              [`${done.minutes}'`, "thời gian", "#020617"],
            ].map(([v, l, c]) => (
              <div key={l} className="flex flex-col">
                <span className="text-[28px] font-black" style={{ color: c }}>
                  {v}
                </span>
                <span className="text-xs font-bold text-slate-500">{l}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {done.hard > 0 ? (
              <button
                type="button"
                className="h-12 rounded-full border border-amber-200 bg-amber-50 px-5 text-sm font-extrabold text-amber-800 hover:brightness-95"
                onClick={() => navigate(`/student/flashcards/${deck.id}/study?hard=1`)}
              >
                Ôn lại {done.hard} thẻ khó
              </button>
            ) : null}
            <button type="button" className={`${outlineBtn} h-12 px-5`} onClick={() => navigate(`/student/flashcards/${deck.id}/test`)}>
              Làm kiểm tra 4 đáp án
            </button>
            <button type="button" className={`${primaryBtn} h-12 px-[22px]`} onClick={() => navigate("/student/flashcards")}>
              Về danh sách bộ thẻ
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const face = "absolute inset-0 flex flex-col justify-center rounded-[32px] [backface-visibility:hidden]";

  return (
    <StudentLayout>
      <div className="mx-auto flex min-h-[calc(100vh-130px)] max-w-[760px] flex-col justify-center gap-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={exit} title="Thoát" aria-label="Thoát" className="size-10 shrink-0 rounded-full bg-white text-xl leading-none text-slate-700 shadow-[0_0_0_1px_#e2e8f0] hover:text-slate-950 hover:shadow-[0_0_0_1px_#94a3b8]">
            ×
          </button>
          <div className="flex min-w-0 flex-1 flex-col leading-snug">
            <span className="truncate text-[15px] font-extrabold text-slate-950">{deck.title}</span>
            <span className="text-xs font-bold text-slate-500">{hardOnly ? "Ôn lại thẻ khó" : tag.label}</span>
          </div>
          <span className="text-[15px] font-black tabular-nums text-slate-950">
            {qi + 1}/{n}
          </span>
        </div>

        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {queue.map((c, i) => (
            <span key={c.id} className="h-[5px] rounded-full transition-colors" style={{ background: i < qi ? "#10b981" : i === qi ? "#2563eb" : "#e2e8f0" }} />
          ))}
        </div>

        <div className="relative h-[clamp(320px,50vh,440px)] cursor-pointer [perspective:1600px]" onClick={flip}>
          <div className="absolute inset-0 [transform-style:preserve-3d]" style={{ transform: flipped ? "rotateY(180deg)" : "none", transition: instant ? "none" : "transform .5s cubic-bezier(.3,1.2,.5,1)" }}>
            <div className={`${face} items-center gap-3 bg-white p-7 text-center shadow-[0_0_0_1px_#e2e8f0,0_30px_60px_-30px_rgba(15,23,42,.28)]`}>
              {card.pos ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">{card.pos}</span> : null}
              <span className="break-words font-black leading-[1.05] tracking-tight text-slate-950" style={{ fontSize: "clamp(38px, 6vw, 60px)" }}>
                {card.word}
              </span>
              {card.ipa ? <span className="text-[17px] text-slate-500">{card.ipa}</span> : null}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(card.word);
                }}
                className="mt-1 flex h-10 items-center gap-2 rounded-full bg-blue-50 px-4 text-[13px] font-extrabold text-blue-800 hover:bg-blue-100"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
                </svg>
                Nghe
              </button>
              <span className="absolute inset-x-0 bottom-5 text-xs font-bold text-slate-400">Nghĩ nghĩa trong đầu, rồi chạm để lật</span>
            </div>
            <div className={`${face} gap-3.5 bg-slate-900 p-[clamp(24px,4vw,40px)] text-white shadow-[0_30px_60px_-30px_rgba(15,23,42,.5)]`} style={{ transform: "rotateY(180deg)" }}>
              <span className="text-[13px] font-bold text-slate-400">
                {card.word}
                {card.ipa ? ` · ${card.ipa}` : ""}
              </span>
              <span className="font-black leading-[1.1] tracking-tight" style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>
                {card.meaning}
              </span>
              {card.example ? (
                <>
                  <span className="h-px bg-white/10" />
                  <span className="text-[17px] leading-relaxed text-slate-300">
                    <Highlight text={card.example} word={card.word} />
                  </span>
                </>
              ) : null}
              {card.exampleVi ? <span className="text-sm leading-normal text-slate-500">{card.exampleVi}</span> : null}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleHard();
            }}
            title="Đánh dấu thẻ khó"
            className="absolute right-4 top-4 z-[2] h-[34px] rounded-full px-3 text-[13px] font-extrabold hover:brightness-95"
            style={{ background: isHard ? "#fef3c7" : "rgba(148,163,184,.14)", color: isHard ? "#92400e" : flipped ? "#cbd5e1" : "#475569" }}
          >
            {isHard ? "★ Thẻ khó" : "☆ Đánh dấu khó"}
          </button>
        </div>

        <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-2.5">
          <button type="button" disabled={qi === 0} onClick={() => move(-1)} className="h-[54px] rounded-2xl bg-white text-[15px] font-extrabold text-slate-700 shadow-[0_0_0_1px_#e2e8f0] hover:bg-slate-100 disabled:opacity-40">
            ← Trước
          </button>
          <button type="button" onClick={flip} className="h-[54px] rounded-2xl bg-slate-200 text-[15px] font-black text-slate-950 hover:bg-slate-300">
            {flipped ? "Xem mặt trước" : "Lật thẻ"}
          </button>
          <button type="button" onClick={() => move(1)} className="h-[54px] rounded-2xl bg-[#1f2937] text-[15px] font-black text-white hover:bg-[#111827]">
            {last ? "Hoàn thành" : "Tiếp"}
          </button>
        </div>

        <div className="hidden justify-center gap-[18px] text-xs font-bold text-slate-400 min-[900px]:flex">
          {[
            ["Space", "lật"],
            ["←", "chuyển thẻ"],
            ["K", "đánh dấu khó"],
          ].map(([k, l]) => (
            <span key={k}>
              <b className="rounded-md bg-white px-[7px] py-0.5 text-slate-700 shadow-[0_0_0_1px_#e2e8f0]">{k}</b> {l}
            </span>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
