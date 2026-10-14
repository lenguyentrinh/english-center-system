import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import StudentLayout from "@/shared/components/layout/StudentLayout.tsx";
import { TableFrame, outlineBtn, primaryBtn } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import Highlight from "@/features/flashcards/Highlight.tsx";
import { markStudied, useDeck } from "@/features/flashcards/store.ts";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export default function StudentFlashcardStudyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const deck = useDeck(id);
  const cards = deck?.cards ?? [];
  const n = cards.length;

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [anim, setAnim] = useState(true);
  const [flips, setFlips] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState<number | null>(null);
  const order = usePaged(cards);

  const go = (i: number) => {
    if (i < 0 || i >= n || i === idx) return;
    setAnim(false); // no transition while swapping so the back face never flashes
    setFlipped(false);
    setIdx(i);
    order.setPage(Math.floor(i / order.pageSize) + 1);
    window.setTimeout(() => setAnim(true), 60);
  };
  const flip = () => {
    setFlips((f) => f + 1);
    setFlipped((v) => !v);
  };
  const next = () => {
    if (idx < n - 1) return go(idx + 1);
    setElapsed(Math.round((Date.now() - startedAt) / 1000));
    if (deck) markStudied(deck.id);
  };

  const actions = useRef({ prev: () => go(idx - 1), flip, next });
  useEffect(() => {
    actions.current = { prev: () => go(idx - 1), flip, next };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      if (e.key === "ArrowRight") actions.current.next();
      else if (e.key === "ArrowLeft") actions.current.prev();
      else if (e.key === " ") {
        e.preventDefault();
        actions.current.flip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!deck || n === 0) {
    return (
      <StudentLayout>
        <Link to="/student/flashcards" className="text-[13px] font-semibold text-slate-500 hover:text-slate-950">
          ← Bộ thẻ
        </Link>
        <p className="mt-6 text-sm text-slate-500">Không tìm thấy bộ thẻ hoặc bộ thẻ chưa có thẻ nào.</p>
      </StudentLayout>
    );
  }

  if (elapsed !== null) {
    return (
      <StudentLayout>
        <div className="mx-auto max-w-[780px] py-10">
          <p className="text-[13px] font-semibold text-slate-500">{deck.title}</p>
          <h1 className="text-[40px] font-black leading-tight text-slate-950">Hoàn thành!</h1>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {(
              [
                ["Số thẻ", String(n)],
                ["Lần lật", String(flips)],
                ["Thời gian", fmt(elapsed)],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="border-t-2 border-slate-950 pt-3">
                <div className="text-[13px] font-semibold text-slate-500">{label}</div>
                <div className="text-[30px] font-black tabular-nums text-slate-950">{value}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-600">Gợi ý: làm kiểm tra 4 đáp án để biết mình nhớ được bao nhiêu từ.</p>
          <div className="mt-5 flex gap-2">
            <button type="button" className={primaryBtn} onClick={() => navigate(`/student/flashcards/${deck.id}/test`)}>
              Làm kiểm tra 4 đáp án
            </button>
            <button type="button" className={outlineBtn} onClick={() => navigate("/student/flashcards")}>
              Về danh sách bộ thẻ
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const card = cards[idx];
  const pct = Math.round(((idx + 1) / n) * 100);
  const face = "absolute inset-0 flex flex-col items-center justify-center rounded-[32px] p-8 text-center [backface-visibility:hidden]";

  return (
    <StudentLayout>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,780px)_300px]">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Link to="/student/flashcards" className="text-[13px] font-semibold text-slate-500 hover:text-slate-950">
              ← Bộ thẻ
            </Link>
            <span className="flex-1 truncate text-[15px] font-extrabold text-slate-950">{deck.title}</span>
            <span className="text-[13px] font-bold tabular-nums text-slate-500">{pct}%</span>
          </div>
          <div className="mb-5 h-1 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-slate-950 transition-[width]" style={{ width: `${pct}%` }} />
          </div>

          <div style={{ perspective: "1600px" }}>
            <div
              className="relative h-[440px] cursor-pointer"
              onClick={flip}
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "none",
                transition: anim ? "transform .5s cubic-bezier(.3,1.2,.5,1)" : "none",
              }}
            >
              <div className={`${face} border border-slate-200 bg-white`} style={{ boxShadow: "0 30px 60px -30px rgba(15,23,42,.28)" }}>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{card.pos}</span>
                <div className="mt-5 break-words font-black leading-tight text-slate-950" style={{ fontSize: "clamp(40px, 6vw, 64px)" }}>
                  {card.word}
                </div>
                <div className="mt-2 text-lg text-slate-500">{card.ipa}</div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(card.word);
                  }}
                  className={`${outlineBtn} mt-6`}
                >
                  Nghe
                </button>
              </div>
              <div
                className={`${face} text-white`}
                style={{ background: "#0f172a", transform: "rotateY(180deg)", boxShadow: "0 30px 60px -30px rgba(15,23,42,.28)" }}
              >
                <div className="text-sm font-semibold text-slate-400">
                  {card.word} · {card.ipa}
                  {card.synonym ? ` · ≈ ${card.synonym}` : ""}
                </div>
                <div className="mt-3 font-black leading-tight" style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>
                  {card.meaning}
                </div>
                <p className="mt-5 max-w-[560px] text-base leading-relaxed text-slate-200">
                  <Highlight text={card.example} word={card.word} />
                </p>
                {card.exampleVi ? <p className="mt-1 max-w-[560px] text-sm text-slate-400">{card.exampleVi}</p> : null}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button type="button" className={`${outlineBtn} ${idx === 0 ? "opacity-40" : ""}`} disabled={idx === 0} onClick={() => go(idx - 1)}>
              ← Trước
            </button>
            <button type="button" className={outlineBtn} onClick={flip}>
              {flipped ? "Xem mặt trước" : "Lật thẻ"} <span className="text-xs text-slate-400">(Space)</span>
            </button>
            <button type="button" className={primaryBtn} onClick={next}>
              {idx === n - 1 ? "Hoàn thành" : "Tiếp →"}
            </button>
          </div>
        </div>

        <aside>
          <p className="text-[13px] font-semibold text-slate-500">
            Tiến độ · Thẻ {idx + 1}/{n}
          </p>
          <h3 className="mb-2 text-[17px] font-extrabold text-slate-950">Thứ tự thẻ</h3>
          <TableFrame>
            <ul>
              {order.rows.map((c, i) => {
                const abs = (order.page - 1) * order.pageSize + i;
                const color = abs < idx ? "#10b981" : abs === idx ? "#3b82f6" : "#cbd5e1";
                return (
                  <li key={c.id} className="border-b border-slate-100 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => go(abs)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50 ${abs === idx ? "font-extrabold text-slate-950" : "font-semibold text-slate-600"}`}
                    >
                      <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                      <span className="tabular-nums text-slate-400">{abs + 1}</span>
                      <span className="truncate">{c.word}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <Pagination page={order.page} total={order.total} pageSize={order.pageSize} onChange={order.setPage} />
          </TableFrame>
        </aside>
      </div>
    </StudentLayout>
  );
}
