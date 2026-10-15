import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import StudentLayout from "@/shared/components/layout/StudentLayout.tsx";
import ConfirmDialog from "@/shared/components/ConfirmDialog.tsx";
import { BackLink, fieldClass, fieldErrClass, outlineBtn, primaryBtn, surfaceClass } from "@/shared/components/PageHeader.tsx";
import { useAuth } from "@/features/auth/useAuth.ts";
import Highlight from "@/features/flashcards/Highlight.tsx";
import { createStudentDeck, deleteStudentDeck, updateStudentDeck, useStudentDecks } from "@/features/flashcards/store.ts";

type Row = { key: number; word: string; meaning: string; example: string };

let rowKey = 0;
const blank = (): Row => ({ key: ++rowKey, word: "", meaning: "", example: "" });
const filledRow = (r: Row) => r.word.trim() || r.meaning.trim();

/** One line per word: "từ - nghĩa - ví dụ", separated by tab, " - " or ": ". */
function parsePasted(text: string): Row[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const p = l.split(/\t| - | – |: /).map((x) => x.trim());
      return { key: ++rowKey, word: p[0] ?? "", meaning: p[1] ?? "", example: p.slice(2).join(" - ") };
    });
}

function validate(title: string, rows: Row[]): string {
  const filled = rows.filter(filledRow);
  if (!title.trim()) return "Nhập tên bộ thẻ.";
  if (!filled.length) return "Thêm ít nhất 1 thẻ.";
  if (filled.some((c) => !c.word.trim() || !c.meaning.trim())) return "Mỗi thẻ cần có cả từ và nghĩa.";
  return "";
}

export default function StudentDeckEditPage() {
  const { id } = useParams();
  const items = useStudentDecks();
  const existing = id ? items.find((x) => x.deck.id === id)?.deck : undefined;
  // Only the owner can open the editor: a deck that is not a visible STUDENT deck behaves as not found.
  const editable = existing && existing.source === "STUDENT" ? existing : undefined;

  if (id && !editable) {
    return (
      <StudentLayout>
        <BackLink to="/student/flashcards">Bộ thẻ</BackLink>
        <p className="mt-6 text-sm text-slate-500">Không tìm thấy bộ thẻ này hoặc bạn không có quyền sửa.</p>
      </StudentLayout>
    );
  }
  return <DeckForm key={editable?.id ?? "new"} deckId={editable?.id} initialTitle={editable?.title ?? ""} initialRows={editable?.cards.map((c) => ({ key: ++rowKey, word: c.word, meaning: c.meaning, example: c.example }))} />;
}

function DeckForm({ deckId, initialTitle, initialRows }: { deckId?: string; initialTitle: string; initialRows?: Row[] }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialTitle);
  const [rows, setRows] = useState<Row[]>(() => (initialRows && initialRows.length ? initialRows : [blank(), blank(), blank()]));
  const [tried, setTried] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const { user } = useAuth();
  const [pasteText, setPasteText] = useState("");
  const [focus, setFocus] = useState(0);
  const [confirmDel, setConfirmDel] = useState(false);
  const [autoKey, setAutoKey] = useState<number | null>(deckId ? null : (rows[0]?.key ?? null));
  const lastAdded = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoKey !== null) lastAdded.current?.focus();
  }, [autoKey]);

  const err = validate(title, rows);
  const filled = rows.filter(filledRow);
  const setRow = (key: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const pasted = parsePasted(pasteText);
  const pv = rows[Math.min(focus, rows.length - 1)] ?? blank();

  const save = () => {
    if (err) return setTried(true);
    const cards = filled.map((r) => ({ word: r.word, meaning: r.meaning, example: r.example }));
    if (deckId) {
      if (user) updateStudentDeck(deckId, { title, cards }, user.id);
      toast.success("Đã lưu bộ thẻ. Tiến độ ôn của bộ này được bắt đầu lại.");
    } else {
      if (user) createStudentDeck({ title, cards, owner: { id: user.id, name: user.fullName || user.username } });
      toast.success(`Đã tạo bộ “${title.trim()}” · ${cards.length} thẻ`);
    }
    navigate("/student/flashcards");
  };

  const addPasted = () => {
    if (!pasted.length) return;
    setRows((rs) => [...rs.filter(filledRow), ...pasted]);
    setPasteOpen(false);
    setPasteText("");
  };

  const input = "h-11 min-w-0 rounded-xl border-[1.5px] border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none focus:border-blue-600 focus:shadow-[0_0_0_4px_#dbeafe]";

  return (
    <StudentLayout>
      <div className="flex flex-col gap-[18px]">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-2">
            <BackLink to="/student/flashcards">Bộ thẻ</BackLink>
            <h1 className="text-[clamp(24px,3vw,32px)] font-black tracking-tight text-slate-950">{deckId ? "Sửa bộ thẻ" : "Tạo bộ thẻ của tôi"}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {deckId ? (
              <button type="button" className="h-[42px] rounded-full border border-rose-200 bg-white px-4 text-sm font-extrabold text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDel(true)}>
                Xoá bộ
              </button>
            ) : null}
            <button type="button" className={`${outlineBtn} h-[42px]`} onClick={() => navigate("/student/flashcards")}>
              Huỷ
            </button>
            <button type="button" className={`${primaryBtn} h-[42px] px-5`} onClick={save}>
              {deckId ? "Lưu bộ thẻ" : "Tạo bộ thẻ"}
            </button>
          </div>
        </header>

        <div className="flex flex-wrap items-start gap-5">
          <section className={`${surfaceClass} min-w-0 flex-[999_1_560px] overflow-hidden`}>
            <div className="flex flex-col gap-3 border-b border-[#eef2f6] px-5 py-[18px]">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-600">Tên bộ thẻ</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="vd. Từ mới phim Friends · tập 3"
                  maxLength={100}
                  className={`h-[46px] rounded-xl border-[1.5px] border-slate-200 bg-slate-50 px-3.5 text-[15px] font-bold text-slate-950 outline-none focus:border-blue-600 focus:shadow-[0_0_0_4px_#dbeafe] ${tried && !title.trim() ? fieldErrClass : ""}`}
                />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <span className="text-[13px] font-bold text-slate-500">{filled.length} thẻ · chỉ mình bạn thấy</span>
                <button type="button" className={`${outlineBtn} h-9`} onClick={() => setPasteOpen((v) => !v)}>
                  Dán danh sách từ
                </button>
              </div>
              {pasteOpen ? (
                <div className="flex flex-col gap-2 rounded-[14px] bg-slate-50 p-3.5">
                  <span className="text-[13px] text-slate-600">
                    Mỗi dòng một từ: <b>từ - nghĩa - câu ví dụ</b>. Dán từ Excel hay Google Sheets cũng được.
                  </span>
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    rows={4}
                    placeholder={"Resilient - Kiên cường - She is resilient.\nThrive - Phát triển mạnh"}
                    className={`${fieldClass} resize-y font-mono leading-relaxed`}
                  />
                  <div className="flex gap-2">
                    <button type="button" className={`${primaryBtn} h-9`} disabled={!pasted.length} onClick={addPasted}>
                      {pasted.length ? `Thêm ${pasted.length} thẻ` : "Thêm thẻ"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {rows.map((r, j) => (
              <div
                key={r.key}
                className={`grid items-start gap-2 border-b border-dashed border-[#eef2f6] px-5 py-3 min-[760px]:grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.6fr)_36px] grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)_36px] ${j === focus ? "bg-[#fbfdff]" : "bg-white"}`}
              >
                <span className="mt-2 grid size-7 place-items-center rounded-[9px] bg-slate-100 text-xs font-black text-slate-600">{j + 1}</span>
                <input
                  ref={r.key === autoKey ? lastAdded : undefined}
                  value={r.word}
                  onChange={(e) => setRow(r.key, { word: e.target.value })}
                  onFocus={() => setFocus(j)}
                  placeholder="Từ"
                  aria-label={`Từ ${j + 1}`}
                  className={`${input} ${tried && r.meaning.trim() && !r.word.trim() ? fieldErrClass : ""}`}
                />
                <input
                  value={r.meaning}
                  onChange={(e) => setRow(r.key, { meaning: e.target.value })}
                  onFocus={() => setFocus(j)}
                  placeholder="Nghĩa"
                  aria-label={`Nghĩa ${j + 1}`}
                  className={`${input} ${tried && r.word.trim() && !r.meaning.trim() ? fieldErrClass : ""}`}
                />
                <input
                  value={r.example}
                  onChange={(e) => setRow(r.key, { example: e.target.value })}
                  onFocus={() => setFocus(j)}
                  placeholder="Câu ví dụ (tuỳ chọn)"
                  aria-label={`Ví dụ ${j + 1}`}
                  className={`${input} col-[2/4] min-[760px]:col-auto`}
                />
                <button
                  type="button"
                  title="Xoá thẻ"
                  aria-label={`Xoá thẻ ${j + 1}`}
                  onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.key !== r.key) : [blank()]))}
                  className="col-[4] row-[1] mt-1 size-9 rounded-full text-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 min-[760px]:col-[5]"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const r = blank();
                setRows((rs) => [...rs, r]);
                setFocus(rows.length);
                setAutoKey(r.key);
              }}
              className="w-full px-5 py-3.5 text-left text-sm font-extrabold text-slate-800 hover:bg-slate-50"
            >
              + Thêm thẻ
            </button>
            {tried && err ? <div className="px-5 pb-4 text-[13px] font-bold text-rose-600">{err}</div> : null}
          </section>

          <aside className="mx-auto flex min-w-0 max-w-[360px] flex-[1_1_280px] flex-col gap-2.5">
            <span className="text-xs font-bold text-slate-500">
              Xem trước · thẻ {Math.min(focus, rows.length - 1) + 1}/{rows.length}
            </span>
            <div className="flex aspect-[5/4] flex-col items-center justify-center gap-2 rounded-[26px] bg-white p-5 text-center shadow-[0_0_0_1px_#e2e8f0,0_20px_40px_-24px_rgba(15,23,42,.25)]">
              <span className="break-words text-[clamp(26px,3vw,34px)] font-black tracking-tight text-slate-950">{pv.word || "Từ mới"}</span>
              <span className="text-xs font-bold text-slate-400">mặt trước</span>
            </div>
            <div className="flex aspect-[5/4] flex-col justify-center gap-2.5 rounded-[26px] bg-slate-900 p-5 text-white">
              <span className="text-[22px] font-black leading-tight">{pv.meaning || "Nghĩa của từ"}</span>
              <span className="text-sm leading-normal text-slate-300">{pv.example ? <Highlight text={pv.example} word={pv.word} /> : "Câu ví dụ sẽ hiện ở đây."}</span>
            </div>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDel}
        title="Xoá bộ thẻ"
        message="Xoá bộ thẻ này cùng tiến độ ôn? Việc này không hoàn tác được."
        confirmText="Xoá bộ"
        cancelText="Huỷ"
        isDangerous
        onCancel={() => setConfirmDel(false)}
        onConfirm={() => {
          if (deckId && user) deleteStudentDeck(deckId, user.id);
          toast.success("Đã xoá bộ thẻ");
          navigate("/student/flashcards");
        }}
      />
    </StudentLayout>
  );
}
