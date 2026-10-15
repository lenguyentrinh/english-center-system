import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TeacherLayout from "@/shared/components/layout/TeacherLayout.tsx";
import PageHeader, { outlineBtn, primaryBtn, surfaceClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import { Tag } from "@/shared/components/ui/Tag.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { useAuth } from "@/features/auth/useAuth.ts";
import { categoryColors, useCategories } from "@/features/categories/useCategories.ts";
import { useAllCourses, useTeacherCourses } from "@/features/flashcards/useCourses.ts";
import { createSet, isValidQuestion, roomActions, useWRState } from "@/features/wordRush/store.ts";
import { fmtPin } from "@/features/wordRush/constants.ts";
import NewSetModal from "@/features/flashcards/NewSetModal.tsx";

export default function TeacherWordRushPage() {
  const { sets, room } = useWRState();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { nameOf } = useAllCourses();
  const { courses: myCourses } = useTeacherCourses();
  const { categoryById } = useCategories();
  const [creating, setCreating] = useState(false);
  const mine = useMemo(() => sets.filter((s) => s.authorId === user?.id), [sets, user?.id]);
  const { rows, page, setPage, total, pageSize } = usePaged(mine);

  const onCreate = ({ name, categoryId }: { name: string; categoryId: string }) => {
    if (!user) return;
    setCreating(false);
    navigate(`/teacher/word-rush/sets/${createSet({ title: name, categoryId: categoryId || undefined, classId: myCourses.length === 1 ? myCourses[0].id : "", author: { id: user.id, name: user.fullName || user.username } })}`);
  };

  const present = (id: string) => {
    roomActions.open(id);
    navigate("/teacher/word-rush/room");
  };

  return (
    <TeacherLayout>
      <PageHeader
        crumb={
          <>
            Word Rush
            {room ? (
              <>
                {" · "}
                <Link to="/teacher/word-rush/room" className="underline underline-offset-4 hover:opacity-70">
                  Phòng đang mở · PIN {fmtPin(room.pin)}
                </Link>
              </>
            ) : null}
          </>
        }
        title="Bộ câu hỏi của tôi"
        actions={
          <button type="button" className={`${primaryBtn} !h-11 !px-5 !text-sm !font-extrabold`} onClick={() => setCreating(true)}>
            + Tạo bộ câu hỏi
          </button>
        }
      />

      <section className={`${surfaceClass} !rounded-[24px] overflow-hidden px-[clamp(14px,2.4vw,20px)] py-1`}>
        {rows.map((s, i) => {
          const valid = s.questions.filter(isValidQuestion).length;
          const ok = valid === s.questions.length && s.questions.length > 0;
          const cat = categoryById(s.categoryId);
          const col = categoryColors(cat?.color);
          const cls = s.classId ? nameOf(s.classId) : "Chưa gán lớp";
          return (
            <div
              key={s.id}
              className={`grid grid-cols-[minmax(0,1fr)_128px] items-center gap-x-5 gap-y-3 py-[18px] min-[1180px]:grid-cols-[minmax(0,1fr)_220px] ${i ? "border-t border-dashed border-slate-200" : ""}`}
            >
              <div className="flex min-w-0 flex-col gap-1.5">
                <span
                  className="inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-extrabold"
                  style={{ background: ok ? "#d1fae5" : "#ffe4e6", color: ok ? "#065f46" : "#be123c" }}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {ok ? "Sẵn sàng" : s.questions.length === 0 ? "Chưa có câu hỏi" : `${s.questions.length - valid} câu chưa hợp lệ`}
                </span>
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="min-w-0 flex-1 truncate text-base font-extrabold text-slate-950">{s.title}</span>
                </div>
                <span className="truncate text-[13px] text-slate-500">{s.questions[0]?.sentence ?? "Chưa có câu hỏi"}</span>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                  <Tag bg={col.bg} fg={col.fg}>
                    {cat?.name ?? "Chưa phân loại"}
                  </Tag>
                  <span className="whitespace-nowrap text-[13px] font-bold text-slate-600">{cls}</span>
                  <span className="size-1 shrink-0 rounded-full bg-slate-300" />
                  <span className="whitespace-nowrap text-[13px] font-extrabold text-slate-950">{s.questions.length} câu</span>
                </div>
              </div>
              <div className="grid w-[128px] grid-cols-1 gap-1.5 min-[1180px]:w-[220px] min-[1180px]:grid-cols-2">
                <button type="button" className={`${outlineBtn} !h-10 !px-3.5 !text-[13px] !font-extrabold whitespace-nowrap`} onClick={() => navigate(`/teacher/word-rush/sets/${s.id}`)}>
                  Soạn
                </button>
                <button type="button" disabled={valid === 0} className={`${primaryBtn} !h-10 !px-3.5 !text-[13px] !font-extrabold whitespace-nowrap`} onClick={() => present(s.id)}>
                  Trình chiếu
                </button>
              </div>
            </div>
          );
        })}
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-slate-500">Bạn chưa có bộ câu hỏi nào. Tạo bộ đầu tiên rồi trình chiếu cho lớp.</p>
            <button type="button" className={outlineBtn} onClick={() => setCreating(true)}>
              + Tạo bộ câu hỏi
            </button>
          </div>
        ) : null}
      </section>
      <div className={`${surfaceClass} mt-5 overflow-hidden`}>
        <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
      </div>

      {creating ? <NewSetModal kind="set" onClose={() => setCreating(false)} onCreate={onCreate} /> : null}
    </TeacherLayout>
  );
}
