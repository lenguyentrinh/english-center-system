import { Link, useNavigate } from "react-router-dom";
import TeacherLayout from "@/shared/components/layout/TeacherLayout.tsx";
import PageHeader, { TableFrame, primaryBtn, tdClass, thClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { MOCK_CLASS_REFS, MOCK_TEACHER } from "@/features/mock/common.ts";
import { createDeck, useDecks } from "@/features/flashcards/store.ts";

export default function TeacherFlashcardsPage() {
  const navigate = useNavigate();
  const mine = useDecks().filter((d) => d.authorId === MOCK_TEACHER.id);
  const { rows, page, setPage, total, pageSize } = usePaged(mine);

  const onCreate = () => navigate(`/teacher/flashcards/${createDeck(MOCK_CLASS_REFS[0].id)}`);

  return (
    <TeacherLayout>
      <PageHeader
        crumb={`Giáo viên · ${MOCK_TEACHER.name} · ${mine.length} bộ thẻ`}
        title="Flashcard của tôi"
        actions={
          <button type="button" className={primaryBtn} onClick={onCreate}>
            + Tạo bộ thẻ mới
          </button>
        }
      />
      <TableFrame>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className={thClass}>Bộ thẻ</th>
                <th className={thClass}>Lớp</th>
                <th className={thClass}>Số thẻ</th>
                <th className={thClass}>Trạng thái</th>
                <th className={thClass}>Học viên</th>
                <th className={thClass}>Tỉ lệ nhớ</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const cls = MOCK_CLASS_REFS.find((c) => c.id === d.classId);
                return (
                  <tr key={d.id} className="border-b border-slate-100 last:border-b-0">
                    <td className={tdClass}>
                      <div className="font-extrabold text-slate-950">{d.title}</div>
                      <div className="text-xs text-slate-500">
                        {d.cards.slice(0, 3).map((c) => c.word).filter(Boolean).join(", ") || "Chưa có thẻ"}
                      </div>
                    </td>
                    <td className={tdClass}>{cls?.name ?? "—"}</td>
                    <td className={`${tdClass} font-bold tabular-nums`}>{d.cards.length}</td>
                    <td className={tdClass}>
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-bold"
                        style={d.published ? { background: "#d1fae5", color: "#065f46" } : { background: "#e2e8f0", color: "#334155" }}
                      >
                        {d.published ? "Đã giao" : "Bản nháp"}
                      </span>
                    </td>
                    <td className={`${tdClass} tabular-nums`}>
                      {d.published ? `${d.studentsDone}/${d.studentsTotal} đã ôn` : "—"}
                    </td>
                    <td className={`${tdClass} font-bold tabular-nums`}>{d.published ? `${d.retention}%` : "—"}</td>
                    <td className={`${tdClass} text-right`}>
                      <Link to={`/teacher/flashcards/${d.id}`} className="text-sm font-bold text-blue-600 hover:underline">
                        Mở →
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                    Chưa có bộ thẻ nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
      </TableFrame>
    </TeacherLayout>
  );
}
