import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import PageHeader, { fieldClass, fieldErrClass, labelClass, outlineBtn, primaryBtn, surfaceClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import Modal from "@/shared/components/Modal.tsx";
import SearchInput from "@/shared/components/ui/SearchInput.tsx";
import Segmented from "@/shared/components/ui/Segmented.tsx";
import { Tag } from "@/shared/components/ui/Tag.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { useAuth } from "@/features/auth/useAuth.ts";
import { useCategories } from "@/features/categories/useCategories.ts";
import { createCenterDeck } from "@/features/flashcards/store.ts";
import { LIB_SRC, kindStyle, useLibrary, type LibraryItem } from "@/features/flashcards/library.ts";

type Filter = "all" | "system" | "teacher" | "rush";

const backColor = (i: LibraryItem) => (i.src === "system" ? "#cbd5e1" : i.kind === "Flashcard" ? "#bfdbfe" : "#a5f3fc");

const PAGE = 9;

export default function AdminLibraryPage() {
  const navigate = useNavigate();
  const all = useLibrary();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [creating, setCreating] = useState(false);

  const needle = q.trim().toLowerCase();
  const list = all.filter(
    (x) =>
      (filter === "all" || (filter === "rush" ? x.kind === "Word Rush" : x.src === filter)) &&
      (!needle || `${x.title} ${x.author} ${x.audience}`.toLowerCase().includes(needle)),
  );
  const { rows, page, setPage, total } = usePaged(list, `${q}|${filter}`, PAGE);

  return (
    <AdminLayout>
      <PageHeader
        crumb={`Trung tâm · ${all.length} bộ`}
        title="Học liệu toàn trung tâm"
        actions={
          <button type="button" className={primaryBtn} onClick={() => setCreating(true)}>
            + Tạo bộ thẻ trung tâm
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Tìm theo tên bộ, giáo viên, lớp" />
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { key: "all", label: "Tất cả", count: all.length },
            { key: "system", label: "English Center", count: all.filter((x) => x.src === "system").length },
            { key: "teacher", label: "Giáo viên", count: all.filter((x) => x.src === "teacher").length },
            { key: "rush", label: "Word Rush", count: all.filter((x) => x.kind === "Word Rush").length },
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <div className={`${surfaceClass} flex flex-col items-center gap-3 px-6 py-12 text-center`}>
          <span className="text-sm font-semibold text-slate-500">
            {all.length === 0 ? "Chưa có học liệu nào. Tạo bộ thẻ trung tâm đầu tiên, hoặc chờ giáo viên giao bộ thẻ và bộ câu hỏi cho lớp." : "Không có học liệu phù hợp."}
          </span>
          {all.length === 0 ? (
            <button type="button" className={primaryBtn} onClick={() => setCreating(true)}>
              + Tạo bộ thẻ trung tâm
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-[22px]" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
          {rows.map((x) => {
            const src = LIB_SRC[x.src];
            const k = kindStyle(x.kind);
            return (
              <div key={x.id} className="relative">
                <span aria-hidden className="absolute inset-0 rounded-[22px]" style={{ background: backColor(x), transform: "rotate(1.6deg)" }} />
                <button
                  type="button"
                  onClick={() => navigate(`/admin/library/${x.id}`)}
                  className={`${surfaceClass} relative flex h-full w-full flex-col gap-2.5 p-[18px] text-left hover:-translate-y-0.5`}
                >
                  <span className="flex items-center gap-2">
                    <Tag bg={src.bg} fg={src.fg} width={124}>{src.label}</Tag>
                    <Tag bg={k.bg} fg={k.fg} width={84}>{x.kind}</Tag>
                  </span>
                  <span className="truncate text-xs font-bold text-slate-500">
                    {x.src === "system" ? x.audience : `${x.author} · ${x.audience}`}
                  </span>
                  <span className="line-clamp-2 text-[18px] font-black leading-snug tracking-tight text-slate-950">{x.title}</span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    {x.words.slice(0, 4).map((w, i) => (
                      <span key={i} className="max-w-[110px] truncate rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{w}</span>
                    ))}
                    {x.words.length > 4 ? <span className="text-xs font-bold text-slate-400">+{x.words.length - 4}</span> : null}
                  </span>
                  <span className="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-[#eef2f6] pt-2.5 text-xs font-bold text-slate-500">
                    <span>{x.count} {x.kind === "Flashcard" ? "thẻ" : "câu"}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full" style={{ background: x.published ? "#10b981" : "#94a3b8" }} />
                      {x.published ? "Đã giao" : "Đang ẩn"}
                    </span>
                    <span>{x.donePct === null ? "—" : `${x.donePct}% đã làm`}</span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className={`${surfaceClass} mt-6`}>
        <Pagination page={page} total={total} pageSize={PAGE} onChange={setPage} />
      </div>

      {creating ? (
        <CreateCenterDeckModal
          onClose={() => setCreating(false)}
          onCreated={(id, title) => {
            setCreating(false);
            toast.success(`Đã phát hành bộ “${title}”`);
            navigate(`/admin/library/d-${id}`);
          }}
        />
      ) : null}
    </AdminLayout>
  );
}

type CardRow = { word: string; meaning: string; example: string };
const blank = (): CardRow => ({ word: "", meaning: "", example: "" });

function CreateCenterDeckModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string, title: string) => void }) {
  const [title, setTitle] = useState("");
  const { categories } = useCategories();
  const { user } = useAuth();
  // Categories are admin-managed; "" = no category / whole center.
  const [categoryId, setCategoryId] = useState("");
  const [scopeCategoryId, setScopeCategoryId] = useState("");
  const [cards, setCards] = useState<CardRow[]>([blank(), blank(), blank()]);
  const [tried, setTried] = useState(false);

  const filled = cards.filter((c) => c.word.trim() || c.meaning.trim());
  const error = !title.trim()
    ? "Nhập tên bộ thẻ."
    : filled.length === 0
      ? "Thêm ít nhất 1 thẻ."
      : filled.some((c) => !c.word.trim() || !c.meaning.trim())
        ? "Mỗi thẻ cần có cả từ và nghĩa."
        : "";

  const patch = (i: number, p: Partial<CardRow>) => setCards((cs) => cs.map((c, j) => (j === i ? { ...c, ...p } : c)));

  const submit = () => {
    if (error) return setTried(true);
    const t = title.trim();
    const scope = scopeCategoryId ? `Lớp thuộc ${categories.find((c) => c.id === scopeCategoryId)?.name ?? "danh mục"}` : "Toàn trung tâm";
    onCreated(createCenterDeck({ title: t, scope, categoryId, scopeCategoryId, cards: filled, author: { id: user?.id ?? "", name: user?.fullName || user?.username || "Quản trị viên" } }), t);
  };

  return (
    <Modal
      isOpen
      title="Tạo bộ thẻ trung tâm"
      onClose={onClose}
      widthClassName="max-w-2xl"
      footer={
        <div className="flex flex-col gap-2">
          {tried && error ? <p className="text-[13px] font-bold text-rose-600">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <button type="button" className={outlineBtn} onClick={onClose}>Huỷ</button>
            <button type="button" className={primaryBtn} onClick={submit}>Tạo &amp; phát hành</button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelClass}>Tên bộ</label>
          <input className={`${fieldClass} ${tried && !title.trim() ? fieldErrClass : ""}`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="vd. Oxford 3000 · Chủ đề Du lịch" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Danh mục</label>
            <select className={fieldClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Không phân loại</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Áp dụng cho</label>
            <select className={fieldClass} value={scopeCategoryId} onChange={(e) => setScopeCategoryId(e.target.value)}>
              <option value="">Toàn trung tâm</option>
              {categories.map((c) => <option key={c.id} value={c.id}>Lớp thuộc {c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className={labelClass}>Thẻ ({filled.length})</span>
          {cards.map((c, i) => (
            <div key={i} className="grid grid-cols-[22px_1fr_28px] items-center gap-2 sm:grid-cols-[22px_1fr_1fr_1.3fr_28px]">
              <span className="text-xs font-bold text-slate-400">{i + 1}</span>
              <input className={`${fieldClass} ${tried && c.meaning.trim() && !c.word.trim() ? fieldErrClass : ""}`} value={c.word} onChange={(e) => patch(i, { word: e.target.value })} placeholder="Từ" aria-label="Từ" />
              <input className={`${fieldClass} col-start-2 sm:col-start-auto ${tried && c.word.trim() && !c.meaning.trim() ? fieldErrClass : ""}`} value={c.meaning} onChange={(e) => patch(i, { meaning: e.target.value })} placeholder="Nghĩa" aria-label="Nghĩa" />
              <input className={`${fieldClass} col-start-2 sm:col-start-auto`} value={c.example} onChange={(e) => patch(i, { example: e.target.value })} placeholder="Ví dụ (tuỳ chọn)" aria-label="Ví dụ" />
              <button
                type="button"
                aria-label="Xoá thẻ"
                onClick={() => setCards((cs) => (cs.length > 1 ? cs.filter((_, j) => j !== i) : [blank()]))}
                className="col-start-3 row-start-1 grid size-7 place-items-center rounded-full text-slate-400 hover:bg-slate-900/5 hover:text-rose-600 sm:col-start-auto sm:row-start-auto"
              >
                ×
              </button>
            </div>
          ))}
          <button type="button" className={`${outlineBtn} self-start`} onClick={() => setCards((cs) => [...cs, blank()])}>
            + Thêm thẻ
          </button>
        </div>
      </div>
    </Modal>
  );
}
