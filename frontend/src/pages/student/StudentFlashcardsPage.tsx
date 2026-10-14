import { useNavigate } from "react-router-dom";
import StudentLayout from "@/shared/components/layout/StudentLayout.tsx";
import PageHeader, { TableFrame, outlineBtn, primaryBtn, tdClass, thClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { useStudentDecks } from "@/features/flashcards/store.ts";

export default function StudentFlashcardsPage() {
  const navigate = useNavigate();
  const items = useStudentDecks();
  const { rows, page, setPage, total, pageSize } = usePaged(items);

  return (
    <StudentLayout>
      <PageHeader crumb={`Học tập · ${items.length} bộ thẻ`} title="Ôn thẻ" />
      <TableFrame>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className={thClass}>Bộ thẻ</th>
                <th className={thClass}>Cần ôn</th>
                <th className={thClass}>Hôm nay</th>
                <th className={thClass}>Kiểm tra</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ deck, progress: p }) => {
                const due = p.fresh + p.learning + p.review;
                const done = p.studiedToday || due === 0;
                return (
                  <tr key={deck.id} className="border-b border-slate-100 last:border-b-0">
                    <td className={tdClass}>
                      <div className="font-extrabold text-slate-950">{deck.title}</div>
                      <div className="text-xs text-slate-500">
                        {deck.authorName} · {deck.cards.length} thẻ
                      </div>
                    </td>
                    <td className={`${tdClass} text-[13px] font-bold`}>
                      <span style={{ color: "#2563eb" }}>{p.fresh} mới</span>
                      <span className="text-slate-300"> · </span>
                      <span style={{ color: "#e11d48" }}>{p.learning} đang học</span>
                      <span className="text-slate-300"> · </span>
                      <span style={{ color: "#059669" }}>{p.review} ôn lại</span>
                    </td>
                    <td className={tdClass}>
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-bold"
                        style={done ? { background: "#d1fae5", color: "#065f46" } : { background: "#dbeafe", color: "#1e40af" }}
                      >
                        {done ? "Đã học xong" : `${due} thẻ đến hạn`}
                      </span>
                    </td>
                    <td className={`${tdClass} font-bold tabular-nums`}>
                      {p.test ? `${p.test.correct}/${p.test.total} đúng` : <span className="font-semibold text-slate-400">Chưa làm</span>}
                    </td>
                    <td className={tdClass}>
                      <div className="flex justify-end gap-2">
                        <button type="button" className={primaryBtn} onClick={() => navigate(`/student/flashcards/${deck.id}/study`)}>
                          Học
                        </button>
                        <button type="button" className={outlineBtn} onClick={() => navigate(`/student/flashcards/${deck.id}/test`)}>
                          Kiểm tra
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                    Giáo viên chưa giao bộ thẻ nào cho lớp của bạn.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
      </TableFrame>
    </StudentLayout>
  );
}
