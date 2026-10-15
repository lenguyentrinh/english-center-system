import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import TeacherLayout from "@/shared/components/layout/TeacherLayout.tsx";
import { BackLink, TableFrame, outlineBtn, primaryBtn, rowClass, surfaceClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import Segmented from "@/shared/components/ui/Segmented.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { useAuth } from "@/features/auth/useAuth.ts";
import { categoryColors, useCategories } from "@/features/categories/useCategories.ts";
import { useAllCourses, useTeacherCourses } from "@/features/flashcards/useCourses.ts";
import { addCards, blankCard, removeCard, updateCard, updateDeck, useDeck } from "@/features/flashcards/store.ts";
import Highlight from "@/features/flashcards/Highlight.tsx";
import type { Card, Deck } from "@/features/flashcards/types.ts";

type Tab = "edit" | "results";

const GRID = "grid grid-cols-[36px_1.1fr_.9fr_1.3fr_2fr_36px] items-center gap-1";
const cellInput = "w-full min-w-0 rounded-lg border-0 bg-transparent px-2 py-2.5 text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-300";

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
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("edit");

  if (!deck) {
    return (
      <TeacherLayout>
        <BackLink to="/teacher/flashcards">Bộ thẻ của tôi</BackLink>
        <p className="mt-6 text-sm text-slate-500">Không tìm thấy bộ thẻ.</p>
      </TeacherLayout>
    );
  }
  // Only the author edits a deck: center/other teachers' decks are read-only here.
  if (deck.authorId !== user?.id) {
    return (
      <TeacherLayout>
        <BackLink to="/teacher/flashcards">Bộ thẻ của tôi</BackLink>
        <p className="mt-6 text-sm text-slate-500">Bạn chỉ có thể chỉnh sửa bộ thẻ do mình tạo.</p>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <DeckHeader deck={deck} tab={tab} setTab={setTab} />
      {tab === "edit" ? <EditTab deck={deck} /> : <ResultsTab deck={deck} />}
    </TeacherLayout>
  );
}

function DeckHeader({ deck, tab, setTab }: { deck: Deck; tab: Tab; setTab: (t: Tab) => void }) {
  const { courses } = useTeacherCourses();
  const { nameOf } = useAllCourses();
  const { categories, categoryById } = useCategories();
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const parsed = useMemo(() => parsePaste(pasteText), [pasteText]);
  // Own live classes, plus the one this deck is already assigned to even if it has closed since.
  const myClasses = courses.some((c) => c.id === deck.classId) || !deck.classId ? courses : [...courses, { id: deck.classId, name: nameOf(deck.classId) }];
  const col = categoryColors(categoryById(deck.categoryId)?.color);

  const filled = deck.cards.filter((c) => c.word.trim() || c.meaning.trim());
  const invalid = filled.some((c) => !c.word.trim() || !c.meaning.trim());
  const publishError = !deck.classId ? "Chọn lớp trước khi giao." : filled.length === 0 ? "Thêm ít nhất 1 thẻ trước khi giao." : invalid ? "Mỗi thẻ cần có cả từ và nghĩa." : "";

  const togglePublish = () => {
    if (!deck.published && publishError) return toast.error(publishError);
    updateDeck(deck.id, { published: !deck.published });
    const cls = nameOf(deck.classId);
    toast.success(deck.published ? "Đã thu hồi bộ thẻ" : `Đã giao cho ${cls}`);
  };

  const addParsed = () => {
    if (!parsed.length) return;
    // Replace the untouched blank rows with the pasted ones.
    const blanks = deck.cards.filter((c) => !c.word && !c.meaning);
    blanks.forEach((b) => removeCard(deck.id, b.id));
    addCards(deck.id, parsed);
    setPasteText("");
    setPasteOpen(false);
    toast.success(`Đã thêm ${parsed.length} thẻ`);
  };

  return (
    <div className="mb-5 flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-2">
          <BackLink to="/teacher/flashcards">Bộ thẻ của tôi</BackLink>
          <input
            aria-label="Tên bộ thẻ"
            value={deck.title}
            onChange={(e) => updateDeck(deck.id, { title: e.target.value })}
            placeholder="Bộ thẻ chưa đặt tên"
            className="w-full max-w-[640px] rounded-[10px] bg-transparent py-0.5 text-[clamp(24px,3vw,32px)] font-black tracking-tight text-slate-950 outline-none focus:shadow-[0_0_0_4px_#dbeafe]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Danh mục"
            value={deck.categoryId ?? ""}
            onChange={(e) => updateDeck(deck.id, { categoryId: e.target.value || undefined })}
            className="h-10 cursor-pointer rounded-full border-0 px-3.5 text-[13px] font-extrabold"
            style={{ background: col.bg, color: col.fg }}
          >
            <option value="">Chưa phân loại</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Lớp"
            value={deck.classId}
            onChange={(e) => updateDeck(deck.id, { classId: e.target.value })}
            className="h-10 rounded-full border border-slate-200 bg-white px-3.5 text-[13px] font-bold text-slate-700"
          >
            {deck.classId === "" ? <option value="">Chọn lớp…</option> : null}
            {myClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="button" className={`${outlineBtn} !h-10`} onClick={() => setPasteOpen((v) => !v)}>
            Dán danh sách
          </button>
          <button
            type="button"
            onClick={togglePublish}
            className={`inline-flex h-10 items-center rounded-full px-[18px] text-[13px] font-extrabold hover:brightness-95 ${deck.published ? "bg-emerald-100 text-emerald-800" : "bg-blue-600 text-white"}`}
          >
            {deck.published ? "Đã giao · thu hồi" : "Giao cho lớp"}
          </button>
        </div>
      </header>

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { key: "edit", label: "Soạn thẻ" },
          { key: "results", label: "Kết quả lớp" },
        ]}
        className="self-start"
      />

      {pasteOpen ? (
        <div className={`${surfaceClass} flex flex-col gap-2.5 p-4`}>
          <span className="text-[13px] font-bold text-slate-700">
            Mỗi dòng một từ: <b>từ - nghĩa - câu ví dụ</b>. Dán thẳng từ Excel cũng được.
          </span>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={4}
            placeholder="Pollution - Ô nhiễm - Air pollution is rising."
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm leading-relaxed outline-none focus:border-blue-600 focus:shadow-[0_0_0_4px_#dbeafe]"
          />
          <button type="button" className={`${primaryBtn} self-start`} disabled={!parsed.length} onClick={addParsed}>
            {parsed.length ? `Thêm ${parsed.length} thẻ` : "Thêm thẻ"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function EditTab({ deck }: { deck: Deck }) {
  const { rows, page, setPage, total, pageSize } = usePaged(deck.cards);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);

  const idx = Math.max(0, deck.cards.findIndex((c) => c.id === previewId));
  const preview = deck.cards[idx];

  const addRow = () => {
    const card = blankCard();
    addCards(deck.id, [card]);
    setFocusId(card.id);
    setPreviewId(card.id);
    setPage(Math.ceil((deck.cards.length + 1) / pageSize));
  };
  const focus = (id: string) => {
    if (previewId !== id) {
      setPreviewId(id);
      setFlipped(false);
    }
  };
  const ex = preview?.example || "Câu ví dụ sẽ hiện ở đây.";

  return (
    <div className="flex flex-wrap items-start gap-5">
      <section className="min-w-0 flex-[999_1_600px]">
        <TableFrame>
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className={`${GRID} border-b border-[#eef2f6] px-3.5 py-3 text-xs font-bold text-slate-500`}>
                <span>#</span>
                <span>Từ</span>
                <span>Phiên âm</span>
                <span>Nghĩa</span>
                <span>Câu ví dụ</span>
                <span />
              </div>
              {rows.map((c, i) => (
                <div key={c.id} className={`${GRID} ${rowClass} px-3.5 py-[3px] ${c.id === preview?.id ? "bg-slate-50" : ""}`} onFocus={() => focus(c.id)}>
                  <span className="text-xs font-extrabold text-slate-400">{(page - 1) * pageSize + i + 1}</span>
                  <input className={`${cellInput} font-extrabold text-slate-950`} value={c.word} autoFocus={c.id === focusId} placeholder="Từ mới" aria-label="Từ" onChange={(e) => updateCard(deck.id, c.id, { word: e.target.value })} />
                  <input className={`${cellInput} text-slate-600`} value={c.ipa} placeholder="/…/" aria-label="Phiên âm" onChange={(e) => updateCard(deck.id, c.id, { ipa: e.target.value })} />
                  <input className={cellInput} value={c.meaning} placeholder="Nghĩa" aria-label="Nghĩa" onChange={(e) => updateCard(deck.id, c.id, { meaning: e.target.value })} />
                  <input className={`${cellInput} text-slate-600`} value={c.example} placeholder="Câu ví dụ có chứa từ" aria-label="Câu ví dụ" onChange={(e) => updateCard(deck.id, c.id, { example: e.target.value })} />
                  <button
                    type="button"
                    title="Xoá"
                    aria-label="Xoá thẻ"
                    className="size-7 justify-self-center rounded-full text-[17px] text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => removeCard(deck.id, c.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {rows.length === 0 ? <p className="px-5 py-8 text-center text-sm text-slate-500">Chưa có thẻ. Thêm từ hoặc dán danh sách.</p> : null}
              <button type="button" onClick={addRow} className="block w-full px-5 py-3.5 text-left text-sm font-extrabold text-blue-600 hover:bg-slate-50">
                + Thêm từ
              </button>
            </div>
          </div>
          <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
        </TableFrame>
      </section>

      <aside className="sticky top-5 flex min-w-0 max-w-[360px] flex-[1_1_280px] flex-col gap-2.5">
        <span className="text-xs font-bold text-slate-500">Thẻ {preview ? idx + 1 : 0} · học viên sẽ thấy · chạm để lật</span>
        <button type="button" onClick={() => setFlipped((f) => !f)} aria-label="Lật thẻ" className="relative h-[250px] cursor-pointer text-left [perspective:1200px]">
          <div className="absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[26px] bg-white p-5 text-center shadow-[0_0_0_1px_#e2e8f0,0_20px_40px_-24px_rgba(15,23,42,.3)] [backface-visibility:hidden]">
              <span className="text-[32px] font-black tracking-tight text-slate-950 [overflow-wrap:anywhere]">{preview?.word || "Từ mới"}</span>
              <span className="text-sm text-slate-500">{preview?.ipa || "/…/"}</span>
            </div>
            <div className="absolute inset-0 flex flex-col justify-center gap-2.5 rounded-[26px] bg-slate-900 p-[22px] text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <span className="text-2xl font-black leading-tight">{preview?.meaning || "Nghĩa của từ"}</span>
              <span className="text-[13px] leading-normal text-slate-300">
                <Highlight text={ex} word={preview?.word ?? ""} />
              </span>
            </div>
          </div>
        </button>
        <span className="text-[13px] text-slate-500">
          {deck.cards.length} thẻ · tự lưu{deck.published ? " · học viên thấy ngay thay đổi" : " · bản nháp, học viên chưa thấy"}
        </span>
      </aside>
    </div>
  );
}

function ResultsTab({ deck }: { deck: Deck }) {
  const stats: [string, string][] = [
    ["Số thẻ", String(deck.cards.length)],
    ["Trạng thái", deck.published ? "Đã giao" : "Bản nháp"],
  ];

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="border-t-2 border-slate-950 pt-3">
            <div className="text-[13px] font-semibold text-slate-500">{label}</div>
            <div className="truncate text-[26px] font-black tabular-nums text-slate-950">{value}</div>
          </div>
        ))}
      </div>
      <div className={`${surfaceClass} px-6 py-10 text-center`}>
        <p className="text-base font-extrabold text-slate-950">Chưa có kết quả ôn tập của học viên</p>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
          {deck.published
            ? "Tiến độ ôn của từng học viên chưa được lưu trên máy chủ nên chưa thể thống kê theo lớp. Kết quả sẽ hiện ở đây khi tính năng này được bật."
            : "Bộ thẻ đang là bản nháp. Giao bộ thẻ cho lớp để học viên bắt đầu ôn."}
        </p>
      </div>
    </div>
  );
}
