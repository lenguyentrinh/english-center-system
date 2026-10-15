import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "@/shared/components/layout/StudentLayout.tsx";
import PageHeader, { outlineBtn, primaryBtn, surfaceClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import SearchInput from "@/shared/components/ui/SearchInput.tsx";
import Segmented from "@/shared/components/ui/Segmented.tsx";
import { Tag } from "@/shared/components/ui/Tag.tsx";
import { categoryColors, useCategories } from "@/features/categories/useCategories.ts";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { dueCount, useStudentDecks } from "@/features/flashcards/store.ts";
import { SOURCE_TAG, abbrOf, hardIds, knownCount, sourceOf, type SourceKey } from "@/features/flashcards/studentUi.ts";

type Filter = "all" | SourceKey;

export default function StudentFlashcardsPage() {
  const navigate = useNavigate();
  const items = useStudentDecks();
  const { categoryById } = useCategories();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: items.length, system: 0, teacher: 0, mine: 0 };
    items.forEach(({ deck }) => (c[sourceOf(deck)] += 1));
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter(({ deck }) => {
      if (filter !== "all" && sourceOf(deck) !== filter) return false;
      if (!needle) return true;
      return [deck.title, ...deck.cards.flatMap((c) => [c.word, c.meaning])].join(" ").toLowerCase().includes(needle);
    });
  }, [items, q, filter]);

  const { rows, page, setPage, total, pageSize } = usePaged(filtered, `${q}|${filter}`);

  return (
    <StudentLayout>
      <div className="flex flex-col gap-6">
        <PageHeader
          crumb="Ôn thẻ"
          title="Bộ thẻ của bạn"
          actions={
            <button type="button" className={`${primaryBtn} h-[42px] px-[18px]`} onClick={() => navigate("/student/flashcards/new")}>
              + Tạo bộ thẻ
            </button>
          }
        />

        <div className="-mb-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5">
          <SearchInput value={q} onChange={setQ} placeholder="Tìm bộ thẻ hoặc từ vựng" className="max-w-[380px] flex-1 basis-[260px]" />
          <Segmented
            square
            value={filter}
            onChange={setFilter}
            options={[
              { key: "all", label: "Tất cả", count: counts.all },
              { key: "system", label: "Trung tâm", count: counts.system },
              { key: "teacher", label: "Giáo viên giao", count: counts.teacher },
              { key: "mine", label: "Của tôi", count: counts.mine },
            ]}
          />
        </div>

        <section className={`${surfaceClass} px-5 pb-0 pt-1`}>
          {rows.length === 0 ? (
            filter === "mine" && !q.trim() ? (
              <div className="flex flex-wrap items-center justify-between gap-3 py-[22px]">
                <div className="flex flex-col gap-1">
                  <span className="text-base font-extrabold text-slate-950">Bạn chưa có bộ thẻ riêng</span>
                  <span className="text-[13px] text-slate-500">Tự gõ từ mới gặp được khi đọc, nghe, xem phim rồi ôn như bộ của giáo viên.</span>
                </div>
                <button type="button" className={outlineBtn} onClick={() => navigate("/student/flashcards/new")}>
                  Tạo bộ đầu tiên
                </button>
              </div>
            ) : (
              <div className="py-6 text-sm text-slate-500">
                {q.trim() ? `Không tìm thấy bộ thẻ nào khớp “${q.trim()}”.` : "Chưa có bộ thẻ nào trong mục này. Giáo viên chưa giao bộ thẻ cho lớp của bạn."}
              </div>
            )
          ) : (
            rows.map(({ deck, progress }, i) => {
              const src = sourceOf(deck);
              const tag = SOURCE_TAG[src];
              const known = knownCount(deck, progress);
              const hard = hardIds(deck, progress).length;
              const due = dueCount(deck, progress);
              const pct = deck.cards.length ? Math.round((known / deck.cards.length) * 100) : 0;
              const empty = deck.cards.length === 0;
              // Deck color = its category color (admin-defined); decks without one fall back to the source color.
              const color = deck.categoryId && categoryById(deck.categoryId) ? categoryColors(categoryById(deck.categoryId)?.color).solid : tag.color;
              return (
                <div key={deck.id} className={`flex flex-wrap items-center gap-x-[18px] gap-y-3.5 py-[18px] ${i ? "border-t border-dashed border-slate-200" : ""}`}>
                  <span className="grid size-[46px] shrink-0 place-items-center rounded-[14px] text-[15px] font-black text-white" style={{ background: color }}>
                    {abbrOf(deck.title)}
                  </span>
                  <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-[3px]">
                    <span className="self-start">
                      <Tag width={124} bg={tag.bg} fg={tag.fg} className="!text-[11px]">
                        {tag.label}
                      </Tag>
                    </span>
                    <span className="break-words text-base font-extrabold text-slate-950">{deck.title}</span>
                    <span className="text-[13px] text-slate-500">
                      {deck.authorName} · {deck.cards.length} thẻ
                    </span>
                  </div>
                  <div className="flex min-w-[140px] flex-[0_1_200px] flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Đã thuộc</span>
                      <span className="text-slate-950">
                        {known}/{deck.cards.length}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                  <Tag width={136} bg={due ? "#ecfeff" : "#ecfdf5"} fg={due ? "#155e75" : "#065f46"} className="!py-[5px]">
                    {empty ? "Chưa có thẻ" : due ? `${due} thẻ đến hạn` : "Đã ôn hôm nay"}
                  </Tag>
                  <div className="ml-auto flex max-w-full flex-[1_1_250px] flex-nowrap justify-end gap-1.5">
                    {hard > 0 ? (
                      <button
                        type="button"
                        className="h-10 shrink-0 whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-3.5 text-[13px] font-extrabold text-amber-800 hover:brightness-95"
                        onClick={() => navigate(`/student/flashcards/${deck.id}/study?hard=1`)}
                      >
                        ★ {hard} thẻ khó
                      </button>
                    ) : null}
                    {src === "mine" ? (
                      <button type="button" className={`${outlineBtn} h-10 shrink-0`} onClick={() => navigate(`/student/flashcards/${deck.id}/edit`)}>
                        Sửa
                      </button>
                    ) : null}
                    <button type="button" disabled={empty} className={`${primaryBtn} h-10 min-w-24 shrink-0`} onClick={() => navigate(`/student/flashcards/${deck.id}/study`)}>
                      {due || empty ? "Học" : "Học lại"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
          <div className="-mx-5">
            <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
          </div>
        </section>
      </div>
    </StudentLayout>
  );
}
