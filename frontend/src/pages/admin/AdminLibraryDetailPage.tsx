import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import ConfirmDialog from "@/shared/components/ConfirmDialog.tsx";
import PageHeader, { BackLink, outlineBtn, surfaceClass } from "@/shared/components/PageHeader.tsx";
import { Tag } from "@/shared/components/ui/Tag.tsx";
import { deleteCenterDeck } from "@/features/flashcards/store.ts";
import { LIB_SRC, kindStyle, setLibraryPublished, useLibrary } from "@/features/flashcards/library.ts";

const pctColor = (p: number) => (p >= 75 ? "#059669" : p >= 50 ? "#b45309" : "#e11d48");

export default function AdminLibraryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = useLibrary().find((x) => x.id === id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!item) {
    return (
      <AdminLayout>
        <BackLink to="/admin/library">Học liệu</BackLink>
        <div className={`${surfaceClass} mt-4 px-6 py-10 text-center text-sm font-semibold text-slate-500`}>Không tìm thấy bộ học liệu (có thể đã bị xoá).</div>
      </AdminLayout>
    );
  }

  const src = LIB_SRC[item.src];
  const k = kindStyle(item.kind);
  const isCard = item.kind === "Flashcard";
  const unit = isCard ? "thẻ" : "câu";

  const toggle = () => {
    setLibraryPublished(item, !item.published);
    toast.success(item.published ? "Đã ẩn bộ khỏi học viên" : "Đã hiện lại bộ cho học viên");
  };

  const info: [string, string][] = [
    ["Nguồn", src.label],
    ["Người tạo", item.author],
    ["Áp dụng cho", item.audience],
    ["Số lượng", `${item.count} ${unit}`],
    ["Học viên đã làm", item.donePct === null ? "—" : `${item.donePct}%`],
  ];

  return (
    <AdminLayout>
      <div className="mb-3">
        <BackLink to="/admin/library">Học liệu</BackLink>
      </div>
      <PageHeader
        crumb={
          <span className="flex flex-wrap items-center gap-2">
            <Tag bg={src.bg} fg={src.fg} width={124}>{src.label}</Tag>
            <Tag bg={k.bg} fg={k.fg} width={84}>{item.kind}</Tag>
            <Tag bg={item.published ? "#ecfdf5" : "#f1f5f9"} fg={item.published ? "#065f46" : "#475569"} width={84}>
              {item.published ? "Đã giao" : "Đang ẩn"}
            </Tag>
          </span>
        }
        title={item.title}
        actions={
          <>
            <button type="button" className={outlineBtn} onClick={toggle}>
              {item.published ? "Ẩn khỏi học viên" : "Hiện lại cho học viên"}
            </button>
            {item.src === "system" ? (
              <button type="button" className={`${outlineBtn} !border-rose-200 !text-rose-600`} onClick={() => setConfirmDelete(true)}>
                Xoá bộ
              </button>
            ) : null}
          </>
        }
      />
      <p className="-mt-3 mb-5 text-[13px] font-semibold text-slate-500">
        {item.author} · {item.audience} · {item.count} {unit}
      </p>

      <div className="grid items-start gap-5 min-[1100px]:grid-cols-[minmax(0,1fr)_300px]">
        <section className={`${surfaceClass} overflow-hidden`}>
          <h2 className="border-b border-[#eef2f6] px-5 py-3.5 text-sm font-black">{isCard ? "Danh sách thẻ" : "Câu hỏi & tỉ lệ đúng"}</h2>
          {isCard
            ? item.cards.map((c, i) => (
                <div key={i} className="grid grid-cols-[28px_1fr] gap-x-3 gap-y-1 border-b border-dashed border-[#eef2f6] px-5 py-3 last:border-b-0 sm:grid-cols-[28px_1fr_1.4fr]">
                  <span className="text-xs font-bold text-slate-400">{i + 1}</span>
                  <span className="flex flex-col">
                    <span className="text-[15px] font-black text-slate-950">{c.word}</span>
                    {c.ipa ? <span className="text-xs font-semibold text-slate-400">{c.ipa}</span> : null}
                  </span>
                  <span className="col-start-2 flex flex-col sm:col-start-auto">
                    <span className="text-sm font-bold text-slate-700">{c.meaning}</span>
                    {c.example ? <span className="text-xs font-semibold italic text-slate-500">{c.example}</span> : null}
                  </span>
                </div>
              ))
            : item.qs.map((q, i) => {
                const [before, ...rest] = q.sentence.split("___");
                return (
                  <div key={i} className="flex flex-col gap-2 border-b border-dashed border-[#eef2f6] px-5 py-3.5 last:border-b-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[15px] font-bold text-slate-900">
                        <span className="mr-2 text-xs text-slate-400">{i + 1}</span>
                        {before}
                        <span className="rounded bg-emerald-50 px-1.5 font-black text-emerald-700">{q.options[q.answer]}</span>
                        {rest.join("___")}
                      </p>
                      <span className="shrink-0 text-sm font-black tabular-nums" style={{ color: q.pct === null ? "#94a3b8" : pctColor(q.pct) }}>{q.pct === null ? "Chưa có dữ liệu" : `${q.pct}% đúng`}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {q.options.map((o, j) => (
                        <span
                          key={j}
                          className="rounded-lg px-2.5 py-1 text-xs font-bold"
                          style={j === q.answer ? { background: "#ecfdf5", color: "#065f46" } : { background: "#f8fafc", color: "#475569" }}
                        >
                          {"ABCD"[j]} · {o}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
          {(isCard ? item.cards.length : item.qs.length) === 0 ? <p className="px-5 py-8 text-center text-sm font-semibold text-slate-500">Bộ này chưa có nội dung.</p> : null}
        </section>

        <aside className={`${surfaceClass} p-5`}>
          <h2 className="mb-2 text-sm font-black">Thông tin</h2>
          <dl>
            {info.map(([l, v], i) => (
              <div key={l} className={`flex items-start justify-between gap-3 py-2.5 ${i ? "border-t border-dashed border-[#eef2f6]" : ""}`}>
                <dt className="text-[13px] font-semibold text-slate-500">{l}</dt>
                <dd className="text-right text-[13px] font-extrabold text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Xoá bộ thẻ trung tâm"
        message={`Xoá “${item.title}”? Học viên sẽ không còn thấy bộ này nữa.`}
        confirmText="Xoá bộ"
        cancelText="Huỷ"
        isDangerous
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteCenterDeck(item.id.slice(2));
          toast.success(`Đã xoá bộ ${item.title}`);
          navigate("/admin/library", { replace: true });
        }}
      />
    </AdminLayout>
  );
}
