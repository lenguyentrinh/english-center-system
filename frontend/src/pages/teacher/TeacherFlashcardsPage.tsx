import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "@/shared/components/layout/TeacherLayout.tsx";
import PageHeader, { primaryBtn, surfaceClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import SearchInput from "@/shared/components/ui/SearchInput.tsx";
import Segmented from "@/shared/components/ui/Segmented.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { useAuth } from "@/features/auth/useAuth.ts";
import { categoryColors, useCategories } from "@/features/categories/useCategories.ts";
import { useAllCourses, useTeacherCourses } from "@/features/flashcards/useCourses.ts";
import { createDeck, useDecks } from "@/features/flashcards/store.ts";
import StackedCard, { NewTile } from "@/features/flashcards/StackedCard.tsx";
import NewSetModal from "@/features/flashcards/NewSetModal.tsx";

type Filter = "all" | "published" | "draft";
const PAGE = 9;

export default function TeacherFlashcardsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { nameOf } = useAllCourses();
  const { courses: myCourses } = useTeacherCourses();
  const { categoryById } = useCategories();
  const all = useDecks();
  const mine = useMemo(() => all.filter((d) => d.authorId === user?.id), [all, user?.id]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [creating, setCreating] = useState(false);

  const className = (id: string) => (id ? nameOf(id) : "Chưa gán lớp");
  const needle = q.trim().toLowerCase();
  const shown = mine.filter(
    (d) =>
      (filter === "all" || (filter === "published" ? d.published : !d.published)) &&
      (!needle || `${d.title} ${className(d.classId)} ${d.cards.map((c) => `${c.word} ${c.meaning}`).join(" ")}`.toLowerCase().includes(needle)),
  );
  const paged = usePaged(shown, `${needle}|${filter}`, PAGE);

  const onCreate = ({ name, categoryId }: { name: string; categoryId: string }) => {
    if (!user) return;
    setCreating(false);
    // The class is chosen in the editor; start with the teacher's only class when there is exactly one.
    const classId = myCourses.length === 1 ? myCourses[0].id : "";
    navigate(`/teacher/flashcards/${createDeck(classId, { title: name, categoryId: categoryId || undefined, author: { id: user.id, name: user.fullName || user.username } })}`);
  };

  return (
    <TeacherLayout>
      <PageHeader
        crumb={`Flashcard · ${mine.length} bộ`}
        title="Bộ thẻ của tôi"
        actions={
          <button type="button" className={`${primaryBtn} !h-11 !px-5`} onClick={() => setCreating(true)}>
            + Tạo bộ thẻ
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Tìm bộ thẻ, lớp, từ vựng" />
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { key: "all", label: "Tất cả", count: mine.length },
            { key: "published", label: "Đã giao", count: mine.filter((d) => d.published).length },
            { key: "draft", label: "Bản nháp", count: mine.filter((d) => !d.published).length },
          ]}
        />
      </div>

      <section className="grid gap-[22px] [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
        {paged.rows.map((d) => {
          const cat = categoryById(d.categoryId);
          const col = categoryColors(cat?.color);
          const words = d.cards.map((c) => c.word).filter(Boolean);
          return (
            <StackedCard
              key={d.id}
              back={d.published ? "#bfdbfe" : "#e2e8f0"}
              status={d.published ? { label: "Đã giao", bg: "#d1fae5", fg: "#065f46" } : { label: "Bản nháp", bg: "#f1f5f9", fg: "#475569" }}
              category={{ label: cat?.name ?? "Chưa phân loại", bg: col.bg, fg: col.fg }}
              subtitle={className(d.classId)}
              title={d.title || "Bộ thẻ chưa đặt tên"}
              chips={words}
              total={words.length}
              footerLeft={`${d.cards.length} thẻ`}
              footerRight={d.published ? "Đã giao cho lớp" : "Chưa giao cho lớp"}
              onOpen={() => navigate(`/teacher/flashcards/${d.id}`)}
            />
          );
        })}
        {paged.page === 1 && !needle && filter === "all" ? <NewTile label="Tạo bộ thẻ mới" onClick={() => setCreating(true)} /> : null}
      </section>
      {shown.length === 0 ? (
        <p className="mt-2 text-center text-sm text-slate-500">
          {mine.length === 0 ? "Bạn chưa có bộ thẻ nào. Bấm “+ Tạo bộ thẻ” để soạn bộ đầu tiên rồi giao cho lớp." : "Không có bộ thẻ phù hợp."}
        </p>
      ) : null}

      <div className={`${surfaceClass} mt-6 overflow-hidden`}>
        <Pagination page={paged.page} total={paged.total} pageSize={paged.pageSize} onChange={paged.setPage} />
      </div>

      {creating ? <NewSetModal kind="deck" onClose={() => setCreating(false)} onCreate={onCreate} /> : null}
    </TeacherLayout>
  );
}
