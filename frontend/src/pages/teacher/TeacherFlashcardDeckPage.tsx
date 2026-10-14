import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TeacherLayout from "@/shared/components/layout/TeacherLayout.tsx";
import { TableFrame, outlineBtn, primaryBtn, tdClass, thClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { MOCK_CLASS_REFS } from "@/features/mock/common.ts";
import { addCards, blankCard, classResults, removeCard, updateCard, updateDeck, useDeck } from "@/features/flashcards/store.ts";
import Highlight from "@/features/flashcards/Highlight.tsx";
import type { Card, Deck, Rating } from "@/features/flashcards/types.ts";

type Tab = "edit" | "results";

const RATING_COLOR: Record<Rating, string> = { again: "#f43f5e", hard: "#f59e0b", good: "#3b82f6", easy: "#10b981" };
const RATING_LABEL: Record<Rating, string> = { again: "Lại", hard: "Khó", good: "Tốt", easy: "Dễ" };

const GRID = "grid grid-cols-[40px_1.1fr_.9fr_.7fr_1.2fr_2fr_40px] items-center";
const cellInput =
  "w-full min-w-0 rounded-lg border-0 bg-transparent px-2 py-2 text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-300";

function parsePaste(text: string): Card[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [word = "", meaning = "", example = ""] = line.split(/\t| - | – |: /).map((s) => s.trim());
      return { ...blankCard(), word, meaning, example };
    })
    .filter((c) => c.word);
}

export default function TeacherFlashcardDeckPage() {
  const { id } = useParams();
  const deck = useDeck(id);
  const [tab, setTab] = useState<Tab>("edit");

  if (!deck) {
    return (
      <TeacherLayout>
        <Link to="/teacher/flashcards" className="text-[13px] font-semibold text-slate-500 hover:text-slate-950">
          ← Tất cả bộ thẻ
        </Link>
        <p className="mt-6 text-sm text-slate-500">Không tìm thấy bộ thẻ.</p>
      </TeacherLayout>
    );
  }
  const cls = MOCK_CLASS_REFS.find((c) => c.id === deck.classId);

  return (
    <TeacherLayout>
      <div className="mb-5">
        <Link to="/teacher/flashcards" className="text-[13px] font-semibold text-slate-500 hover:text-slate-950">
          ← Tất cả bộ thẻ
        </Link>
        <h1 className="mt-1 text-[30px] font-extrabold leading-tight">{deck.title || "Bộ thẻ chưa đặt tên"}</h1>
        <p className="text-[13px] font-semibold text-slate-500">
          {cls?.name ?? "—"} · {deck.cards.length} thẻ · {deck.published ? "Đã giao" : "Bản nháp"}
        </p>
        <div className="mt-4 inline-flex rounded-full bg-slate-100 p-1">
          {(
            [
              ["edit", "Soạn thẻ"],
              ["results", "Kết quả lớp"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${tab === k ? "bg-slate-950 text-white" : "text-slate-600 hover:text-slate-950"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {tab === "edit" ? <EditTab deck={deck} /> : <ResultsTab deck={deck} />}
    </TeacherLayout>
  );
}

function EditTab({ deck }: { deck: Deck }) {
  const { rows, page, setPage, total, pageSize } = usePaged(deck.cards);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const parsed = useMemo(() => parsePaste(pasteText), [pasteText]);

  const preview = deck.cards.find((c) => c.id === previewId) ?? deck.cards[0];

  const addRow = () => {
    const card = blankCard();
    addCards(deck.id, [card]);
    setFocusId(card.id);
    setPage(Math.ceil((deck.cards.length + 1) / pageSize));
  };
  const submitPaste = () => {
    if (!parsed.length) return;
    addCards(deck.id, parsed);
    setPasteText("");
    setPasteOpen(false);
    setPage(Math.ceil((deck.cards.length + parsed.length) / pageSize));
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          aria-label="Tên bộ thẻ"
          value={deck.title}
          onChange={(e) => updateDeck(deck.id, { title: e.target.value })}
          className="min-w-[220px] flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-950 outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          aria-label="Lớp"
          value={deck.classId}
          onChange={(e) => updateDeck(deck.id, { classId: e.target.value })}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
        >
          {MOCK_CLASS_REFS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="button" className={deck.published ? outlineBtn : primaryBtn} onClick={() => updateDeck(deck.id, { published: !deck.published })}>
          {deck.published ? "Đã giao · thu hồi" : "Giao cho lớp"}
        </button>
        <button type="button" className={outlineBtn} onClick={() => setPasteOpen((v) => !v)}>
          Dán danh sách từ
        </button>
      </div>

      {pasteOpen ? (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-xs font-bold text-slate-600">Mỗi dòng: từ - nghĩa - câu ví dụ (tách bằng tab, " - ", " – " hoặc ": ")</p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={5}
            placeholder={"ubiquitous - có mặt ở khắp nơi - Smartphones are ubiquitous.\nmitigate: làm giảm nhẹ"}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-[13px] outline-none focus:ring-2 focus:ring-blue-300"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className={outlineBtn} onClick={() => setPasteOpen(false)}>
              Huỷ
            </button>
            <button type="button" className={`${primaryBtn} disabled:opacity-40`} disabled={!parsed.length} onClick={submitPaste}>
              Thêm {parsed.length} thẻ
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <TableFrame>
            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                <div className={`${GRID} border-b border-slate-100 bg-white`}>
                  {["#", "Từ", "Phiên âm", "Loại từ", "Nghĩa", "Câu ví dụ", ""].map((h, i) => (
                    <div key={i} className="px-2 py-3 text-xs font-bold text-slate-500">
                      {h}
                    </div>
                  ))}
                </div>
                {rows.map((c, i) => (
                  <div key={c.id} className={`${GRID} border-b border-slate-100`} onFocus={() => setPreviewId(c.id)}>
                    <div className="px-2 text-center text-xs font-bold tabular-nums text-slate-400">{(page - 1) * pageSize + i + 1}</div>
                    <input className={`${cellInput} font-bold`} value={c.word} autoFocus={c.id === focusId} aria-label="Từ" onChange={(e) => updateCard(deck.id, c.id, { word: e.target.value })} />
                    <input className={cellInput} value={c.ipa} aria-label="Phiên âm" onChange={(e) => updateCard(deck.id, c.id, { ipa: e.target.value })} />
                    <input className={cellInput} value={c.pos} aria-label="Loại từ" onChange={(e) => updateCard(deck.id, c.id, { pos: e.target.value })} />
                    <input className={cellInput} value={c.meaning} aria-label="Nghĩa" onChange={(e) => updateCard(deck.id, c.id, { meaning: e.target.value })} />
                    <input className={cellInput} value={c.example} aria-label="Câu ví dụ" onChange={(e) => updateCard(deck.id, c.id, { example: e.target.value })} />
                    <button type="button" aria-label="Xoá thẻ" className="h-8 w-8 justify-self-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => removeCard(deck.id, c.id)}>
                      ×
                    </button>
                  </div>
                ))}
                {rows.length === 0 ? <p className="px-5 py-8 text-center text-sm text-slate-500">Chưa có thẻ. Thêm từ hoặc dán danh sách.</p> : null}
                <button type="button" onClick={addRow} className="w-full px-5 py-3 text-left text-sm font-bold text-blue-600 hover:bg-slate-50">
                  + Thêm từ
                </button>
              </div>
            </div>
            <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
          </TableFrame>
        </div>

        <aside className="space-y-3">
          <p className="text-xs font-bold text-slate-500">Xem trước thẻ</p>
          {preview ? (
            <>
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-center" style={{ boxShadow: "0 30px 60px -30px rgba(15,23,42,.28)" }}>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800">{preview.pos || "loại từ"}</span>
                <div className="mt-4 break-words text-[30px] font-black leading-tight text-slate-950">{preview.word || "Từ mới"}</div>
                <div className="mt-1 text-sm text-slate-500">{preview.ipa}</div>
              </div>
              <div className="rounded-[28px] p-6 text-white" style={{ background: "#0f172a", boxShadow: "0 30px 60px -30px rgba(15,23,42,.28)" }}>
                <div className="text-[22px] font-black leading-tight">{preview.meaning || "Nghĩa"}</div>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  <Highlight text={preview.example} word={preview.word} />
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Thêm thẻ để xem trước.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function ResultsTab({ deck }: { deck: Deck }) {
  const res = useMemo(() => classResults(deck), [deck]);
  const heat = usePaged(res.students);
  const hard = usePaged(res.hardest);
  const top = res.hardest[0];

  const stats: [string, string][] = [
    ["Học viên đã ôn", `${res.done}/${res.total}`],
    ["Tỉ lệ nhớ (Tốt + Dễ)", deck.published ? `${res.retention}%` : "—"],
    ["Từ khó nhất", top && deck.published ? top.card.word || "—" : "—"],
    ["Số thẻ", String(deck.cards.length)],
  ];

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="border-t-2 border-slate-950 pt-3">
            <div className="text-[13px] font-semibold text-slate-500">{label}</div>
            <div className="truncate text-[26px] font-black text-slate-950 tabular-nums">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <TableFrame>
          <div className="flex flex-wrap gap-3 border-b border-slate-100 px-5 py-3 text-xs font-bold text-slate-600">
            {(Object.keys(RATING_COLOR) as Rating[]).map((r) => (
              <span key={r} className="flex items-center gap-1.5">
                <i className="inline-block h-3 w-3 rounded" style={{ background: RATING_COLOR[r] }} />
                {RATING_LABEL[r]}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <i className="inline-block h-3 w-3 rounded" style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }} />
              Chưa ôn
            </span>
          </div>
          <div className="overflow-x-auto px-5 pb-2 pt-3">
            <table className="border-separate" style={{ borderSpacing: 3 }}>
              <thead>
                <tr>
                  <th className="w-32" />
                  {deck.cards.map((c) => (
                    <th key={c.id} className="align-bottom pb-1 text-[11px] font-bold text-slate-600">
                      <div className="mx-auto max-h-24 overflow-hidden whitespace-nowrap [writing-mode:vertical-rl] rotate-180">{c.word}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heat.rows.map((s) => (
                  <tr key={s.name}>
                    <td className="whitespace-nowrap pr-3 text-[13px] font-semibold text-slate-700">{s.name}</td>
                    {s.ratings.map((r, i) => (
                      <td key={i} title={`${s.name} · ${deck.cards[i].word} · ${r ? RATING_LABEL[r] : "Chưa ôn"}`}>
                        <div className="h-[26px] w-[34px] rounded-[7px]" style={{ background: r ? RATING_COLOR[r] : "#f1f5f9" }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={heat.page} total={heat.total} pageSize={heat.pageSize} onChange={heat.setPage} />
        </TableFrame>

        <TableFrame>
          <div className="px-5 pt-4 text-[17px] font-extrabold text-slate-950">Từ khó nhất</div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Từ</th>
                <th className={thClass}>Lại + Khó</th>
              </tr>
            </thead>
            <tbody>
              {hard.rows.map(({ card, pct }) => (
                <tr key={card.id} className="border-t border-slate-100">
                  <td className={`${tdClass} font-bold text-slate-950`}>{card.word}</td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#f43f5e" }} />
                      </div>
                      <span className="text-xs font-bold tabular-nums text-slate-600">{pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={hard.page} total={hard.total} pageSize={hard.pageSize} onChange={hard.setPage} />
        </TableFrame>
      </div>
    </div>
  );
}
