import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/shared/components/layout/AdminLayout";
import PageHeader, { TableFrame, rowClass, tdClass, thClass } from "@/shared/components/PageHeader";
import Pagination from "@/shared/components/Pagination";
import { Tag } from "@/shared/components/ui/Tag";
import { usePaged } from "@/shared/hooks/usePaged";
import { useQueryErrorMessage } from "@/shared/hooks/useQueryErrorMessage";
import AdminTeacherWeek from "@/features/schedule/AdminTeacherWeek";
import { categoryColors, useCategories } from "@/features/categories/useCategories";
import { getCourseSchedule } from "@/features/courses/courseApi";
import { addDays, dmy, durText, fmtMin, isoDate, isoWeek, mondayOf, toMin } from "@/features/courses/scheduleUi";
import type { TeacherSchedule } from "@/features/courses/types";

const NO_ROWS: TeacherSchedule[] = [];
/** Capacity used for "mức kín lịch": 6 teaching days x 15 hours (07:00-22:00). */
const CAPACITY_MIN = 6 * 15 * 60;

export default function AdminSchedulePage() {
  const [offset, setOffset] = useState(0);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const { categoryById } = useCategories();

  const thisMonday = mondayOf(new Date());
  const weekStart = addDays(thisMonday, offset * 7);
  const from = isoDate(weekStart);
  const to = isoDate(addDays(weekStart, 6));

  const { data, isLoading, error } = useQuery({ queryKey: ["course-schedule", from, to], queryFn: () => getCourseSchedule({ from, to }) });
  const schedules = data ?? NO_ROWS;
  const errText = useQueryErrorMessage(error, "Không tải được lịch giáo viên");

  const todayIso = isoDate(new Date());
  const rows = useMemo(
    () =>
      schedules.map((t) => {
        const mins = t.occurrences.reduce((a, o) => a + toMin(o.endTime) - toMin(o.startTime), 0);
        const today = t.occurrences.filter((o) => o.date === todayIso).sort((a, b) => a.startTime.localeCompare(b.startTime));
        return { t, mins, today, load: Math.min(100, Math.round((mins / CAPACITY_MIN) * 100)) };
      }),
    [schedules, todayIso],
  );
  const { rows: pageRows, page, setPage, total, pageSize } = usePaged(rows, from);

  const picked = schedules.find((t) => t.teacherId === teacherId);
  if (picked) {
    return (
      <AdminLayout>
        <AdminTeacherWeek
          teacher={picked}
          weekStart={weekStart}
          isCurrentWeek={offset === 0}
          onPrev={() => setOffset((o) => o - 1)}
          onNext={() => setOffset((o) => o + 1)}
          onNow={() => setOffset(0)}
          onBack={() => setTeacherId(null)}
        />
      </AdminLayout>
    );
  }

  const navBtn = "h-[38px] rounded-full bg-white text-[17px] font-black text-slate-700 shadow-[0_0_0_1px_#e2e8f0] hover:bg-slate-100";

  return (
    <AdminLayout>
      <PageHeader
        crumb={`Tuần ${isoWeek(weekStart)} · ${dmy(weekStart)} – ${dmy(addDays(weekStart, 6))} · ${rows.length} giáo viên`}
        title="Lịch giáo viên"
        actions={
          <div className="flex gap-1">
            <button type="button" aria-label="Tuần trước" className={`${navBtn} w-[38px]`} onClick={() => setOffset((o) => o - 1)}>
              ‹
            </button>
            <button
              type="button"
              disabled={offset === 0}
              className={`${navBtn} px-3.5 !text-[13px] !font-extrabold disabled:!bg-slate-100 disabled:!text-slate-400`}
              onClick={() => setOffset(0)}
            >
              Tuần này
            </button>
            <button type="button" aria-label="Tuần sau" className={`${navBtn} w-[38px]`} onClick={() => setOffset((o) => o + 1)}>
              ›
            </button>
          </div>
        }
      />
      {errText ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errText}</div> : null}
      <TableFrame>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Giáo viên</th>
                <th className={thClass}>Lớp phụ trách</th>
                <th className={thClass}>Giờ dạy tuần</th>
                <th className={thClass}>Hôm nay</th>
                <th className={thClass}>Mức kín lịch</th>
                <th className={thClass}>Trùng lịch</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className={`${tdClass} text-slate-500`} colSpan={7}>
                    Đang tải…
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td className={`${tdClass} text-slate-500`} colSpan={7}>
                    Chưa có giáo viên nào. Gán vai trò Giáo viên ở trang Người dùng.
                  </td>
                </tr>
              ) : (
                pageRows.map(({ t, mins, today, load }) => (
                  <tr key={t.teacherId} onClick={() => setTeacherId(t.teacherId)} className={`${rowClass} cursor-pointer hover:bg-slate-50`}>
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-800">
                          {(t.teacherFullName ?? "?").trim().split(" ").pop()?.[0]?.toUpperCase()}
                        </span>
                        <div className="flex min-w-0 flex-col gap-0.5 leading-snug">
                          <span className="truncate font-extrabold text-slate-950">{t.teacherFullName ?? "—"}</span>
                          <span className="flex flex-wrap gap-1">
                            {t.categoryIds.length === 0 ? (
                              <span className="text-xs text-slate-400">Chưa có chuyên môn</span>
                            ) : (
                              t.categoryIds.slice(0, 3).map((cid) => {
                                const c = categoryById(cid);
                                if (!c) return null;
                                const col = categoryColors(c.color);
                                return (
                                  <Tag key={cid} bg={col.bg} fg={col.fg} className="!py-0 !text-[11px]">
                                    {c.name}
                                  </Tag>
                                );
                              })
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={`${tdClass} max-w-[260px] truncate text-slate-600`} title={t.courseCodes.join(", ")}>
                      {t.courseCodes.join(", ") || "—"}
                    </td>
                    <td className={`${tdClass} font-extrabold tabular-nums text-slate-950`}>{mins ? durText(mins) : "—"}</td>
                    <td className={`${tdClass} text-slate-600`}>
                      {offset !== 0 ? "—" : today.length ? `${today.length} buổi · ${today.map((o) => fmtMin(toMin(o.startTime))).join(", ")}` : "Không có buổi"}
                    </td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-[90px] overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full" style={{ width: `${load}%`, background: load > 40 ? "#f59e0b" : "#2563eb" }} />
                        </div>
                        <span className="text-[13px] font-bold tabular-nums text-slate-700">{load}%</span>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <Tag width={96} bg={t.conflictCount ? "#ffe4e6" : "#f1f5f9"} fg={t.conflictCount ? "#be123c" : "#475569"}>
                        {t.conflictCount ? `${t.conflictCount} trùng` : "Không"}
                      </Tag>
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-right font-extrabold text-slate-800 underline underline-offset-4`}>Xem lịch</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
      </TableFrame>
    </AdminLayout>
  );
}
