import { useState } from "react";
import Modal from "@/shared/components/Modal";
import { fieldClass, fieldErrClass, labelClass, outlineBtn, primaryBtn } from "@/shared/components/PageHeader";
import { categoryColors, useCategories } from "@/features/categories/useCategories";

type Props = {
  kind: "deck" | "set";
  onClose: () => void;
  onCreate: (input: { name: string; categoryId: string }) => void;
};

const COPY = {
  deck: { title: "Tạo bộ flashcard", placeholder: "vd. TOEIC Part 5 · Từ loại", button: "Tạo & soạn thẻ" },
  set: { title: "Tạo bộ câu hỏi Word Rush", placeholder: "vd. Collocation với make / do", button: "Tạo & soạn câu hỏi" },
} as const;

/** Pick a category (from the admin-managed list) and name the new set, then jump into the editor. */
export default function NewSetModal({ kind, onClose, onCreate }: Props) {
  const { categories, isLoading } = useCategories();
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [tried, setTried] = useState(false);
  const copy = COPY[kind];

  const options = [{ id: "", name: "Chưa phân loại", color: null as string | null }, ...categories.map((c) => ({ id: c.id, name: c.name, color: c.color as string | null }))];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!name.trim()) return;
    onCreate({ name: name.trim(), categoryId });
  };

  return (
    <Modal isOpen title={copy.title} onClose={onClose} widthClassName="max-w-lg">
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div>
          <span className={labelClass}>Danh mục</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((o) => {
              const c = categoryColors(o.color);
              const on = categoryId === o.id;
              return (
                <button
                  key={o.id || "none"}
                  type="button"
                  onClick={() => setCategoryId(o.id)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left"
                  style={{ background: on ? c.bg : "#fff", boxShadow: on ? `0 0 0 2px ${c.solid}` : "0 0 0 1px #e2e8f0" }}
                >
                  <span className="grid size-[18px] shrink-0 place-items-center rounded-full border-2 text-[10px] font-black text-white" style={{ background: on ? c.solid : "#fff", borderColor: on ? c.solid : "#cbd5e1" }}>
                    {on ? "✓" : ""}
                  </span>
                  <span className="min-w-0 truncate text-sm font-extrabold" style={{ color: on ? c.fg : "#0f172a" }}>
                    {o.name}
                  </span>
                </button>
              );
            })}
          </div>
          {isLoading ? <p className="mt-2 text-xs text-slate-500">Đang tải danh mục…</p> : null}
          {!isLoading && categories.length === 0 ? <p className="mt-2 text-xs text-slate-500">Chưa có danh mục nào. Quản trị viên có thể tạo thêm ở mục Danh mục.</p> : null}
        </div>
        <label className="block">
          <span className={labelClass}>Tên bộ</span>
          <input className={`${fieldClass} ${tried && !name.trim() ? fieldErrClass : ""}`} value={name} onChange={(e) => setName(e.target.value)} placeholder={copy.placeholder} autoFocus />
          {tried && !name.trim() ? <span className="mt-1 block text-xs font-semibold text-rose-600">Nhập tên bộ.</span> : null}
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" className={outlineBtn} onClick={onClose}>
            Huỷ
          </button>
          <button type="submit" className={primaryBtn}>
            {copy.button}
          </button>
        </div>
      </form>
    </Modal>
  );
}
