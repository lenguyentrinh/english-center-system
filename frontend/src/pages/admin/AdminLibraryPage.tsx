import { useMemo } from "react";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import PageHeader, { TableFrame, tdClass, thClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { useDecks } from "@/features/flashcards";
import { useWordRushSets } from "@/features/wordRush/store.ts";
import { MOCK_CLASS_REFS } from "@/features/mock/common.ts";

type Row = {
  key: string;
  kind: "FLASHCARD" | "WORD RUSH";
  title: string;
  items: number;
  teacher: string;
  classId: string;
  published: boolean;
  done: number;
  total: number;
  effect: string;
};

const className = (id: string) => MOCK_CLASS_REFS.find((c) => c.id === id)?.name ?? "—";

export default function AdminLibraryPage() {
  const decks = useDecks();
  const sets = useWordRushSets();

  const rows = useMemo<Row[]>(
    () => [
      ...decks.map<Row>((d) => ({
        key: `d-${d.id}`,
        kind: "FLASHCARD",
        title: d.title,
        items: d.cards.length,
        teacher: d.authorName,
        classId: d.classId,
        published: d.published,
        done: d.studentsDone,
        total: d.studentsTotal,
        effect: d.published ? `${d.retention}% nhớ` : "—",
      })),
      ...sets.map<Row>((s) => ({
        key: `w-${s.id}`,
        kind: "WORD RUSH",
        title: s.title,
        items: s.questions.length,
        teacher: s.authorName,
        classId: s.classId,
        published: s.published,
        done: s.studentsDone,
        total: s.studentsTotal,
        effect: s.published || s.accuracy ? `${s.accuracy}% đúng` : "—",
      })),
    ],
    [decks, sets],
  );

  const { rows: pageRows, page, setPage, total, pageSize } = usePaged(rows);

  const publishedDecks = decks.filter((d) => d.published);
  const avgRetention = publishedDecks.length ? Math.round(publishedDecks.reduce((a, d) => a + d.retention, 0) / publishedDecks.length) : 0;
  // Mock estimate of this week's review sessions: students who finished x cards in the deck.
  const weeklyReviews = decks.reduce((a, d) => a + d.studentsDone * Math.min(d.cards.length, 12), 0);

  const stats = [
    { label: "Bộ flashcard", value: String(decks.length) },
    { label: "Bộ Word Rush", value: String(sets.length) },
    { label: "Lượt ôn tuần", value: weeklyReviews.toLocaleString("vi-VN") },
    { label: "Tỉ lệ nhớ", value: `${avgRetention}%` },
  ];

  return (
    <AdminLayout>
      <PageHeader crumb="Trung tâm" title="Học liệu" />

      <div className="mb-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border-t-2 border-slate-950 pt-3">
            <p className="text-[13px] font-semibold text-slate-500">{s.label}</p>
            <p className="text-[30px] font-extrabold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <TableFrame>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className={thClass}>Học liệu</th>
                <th className={thClass}>Giáo viên</th>
                <th className={thClass}>Lớp</th>
                <th className={thClass}>Trạng thái</th>
                <th className={thClass}>Học viên đã làm</th>
                <th className={thClass}>Hiệu quả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.map((r) => {
                const pct = r.total ? Math.round((r.done / r.total) * 100) : 0;
                const fc = r.kind === "FLASHCARD";
                return (
                  <tr key={r.key} className="hover:bg-slate-50/70">
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                          style={fc ? { background: "#eff6ff", color: "#1e40af" } : { background: "#ecfeff", color: "#155e75" }}
                        >
                          {r.kind}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-slate-950">{r.title}</span>
                          <span className="block text-xs text-slate-500">
                            {r.items} {fc ? "thẻ" : "câu"}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className={`${tdClass} text-slate-700`}>{r.teacher}</td>
                    <td className={`${tdClass} text-slate-700`}>{className(r.classId)}</td>
                    <td className={tdClass}>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                        style={r.published ? { background: "#d1fae5", color: "#065f46" } : { background: "#e2e8f0", color: "#334155" }}
                      >
                        {r.published ? "Đã giao" : "Nháp"}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold tabular-nums text-slate-600">{pct}%</span>
                      </div>
                    </td>
                    <td className={`${tdClass} font-bold tabular-nums text-slate-800`}>{r.effect}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
      </TableFrame>
    </AdminLayout>
  );
}
