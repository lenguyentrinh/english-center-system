import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import PageHeader, { TableFrame, primaryBtn, rowClass, tdClass, thClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import SearchInput from "@/shared/components/ui/SearchInput.tsx";
import Segmented from "@/shared/components/ui/Segmented.tsx";
import { Tag } from "@/shared/components/ui/Tag.tsx";
import ClassFormModal from "@/components/courses/ClassFormModal.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { useQueryErrorMessage } from "@/shared/hooks/useQueryErrorMessage.ts";
import { categoryColors, useCategories } from "@/features/categories/useCategories.ts";
import { getCourses } from "@/features/courses/courseApi.ts";
import { useCourseMutations } from "@/features/courses/useCourseMutations.ts";
import { STATUS_TAG } from "@/features/courses/classUi.ts";
import { scheduleText } from "@/features/courses/scheduleUi.ts";
import type { Course, CourseStatus } from "@/features/courses/types.ts";

const NO_COURSES: Course[] = [];
type Filter = "all" | CourseStatus;

export default function AdminClassesPage() {
  const navigate = useNavigate();
  const { data, isLoading, error: queryError } = useQuery({ queryKey: ["courses"], queryFn: getCourses });
  const courses = data?.data ?? NO_COURSES;
  const listError = useQueryErrorMessage(queryError, "Không tải được danh sách lớp học");
  const { create, submitting } = useCourseMutations();
  const { categoryById } = useCategories();

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: courses.length, OPEN: 0, ACTIVE: 0, CLOSE: 0 };
    courses.forEach((x) => (c[x.status] += 1));
    return c;
  }, [courses]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return courses.filter(
      (c) => (filter === "all" || c.status === filter) && (!s || `${c.name} ${c.code} ${c.teacher?.fullName ?? ""} ${c.room ?? ""}`.toLowerCase().includes(s)),
    );
  }, [courses, q, filter]);
  const { rows, page, setPage, total, pageSize } = usePaged(filtered, `${q}|${filter}`);

  const handleCreate = async (payload: Parameters<typeof create.mutateAsync>[0]) => {
    const res = await create.mutateAsync(payload);
    toast.success(`Đã tạo khoá ${payload.name}`);
    setOpen(false);
    if (res.data?.id) navigate(`/admin/classes/${res.data.id}`);
  };

  return (
    <AdminLayout>
      <PageHeader
        crumb={`${courses.length} lớp học`}
        title="Lớp học"
        actions={
          <button type="button" className={primaryBtn} onClick={() => setOpen(true)}>
            + Tạo khoá học
          </button>
        }
      />

      {listError ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{listError}</div> : null}

      <TableFrame>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f6] px-5 py-3">
          <SearchInput value={q} onChange={setQ} placeholder="Tìm tên lớp, mã lớp, giáo viên, phòng" />
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { key: "all", label: "Tất cả", count: counts.all },
              { key: "OPEN", label: "Tuyển sinh", count: counts.OPEN },
              { key: "ACTIVE", label: "Đang học", count: counts.ACTIVE },
              { key: "CLOSE", label: "Đã đóng", count: counts.CLOSE },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Lớp</th>
                <th className={thClass}>Giáo viên</th>
                <th className={thClass}>Lịch học</th>
                <th className={thClass}>Sĩ số</th>
                <th className={thClass}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className={`${tdClass} text-slate-500`} colSpan={5}>
                    Đang tải…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className={`${tdClass} text-slate-500`} colSpan={5}>
                    Không có lớp học phù hợp.
                  </td>
                </tr>
              ) : (
                rows.map((c) => {
                  const st = STATUS_TAG[c.status];
                  const cat = categoryById(c.categoryId);
                  const col = categoryColors(cat?.color ?? c.categoryColor);
                  const catName = cat?.name ?? c.categoryName;
                  const enrolled = c.enrolledCount ?? 0;
                  const pct = c.maxStudent ? Math.min(100, Math.round((enrolled / c.maxStudent) * 100)) : 0;
                  const sched = scheduleText(c);
                  return (
                    <tr key={c.id} onClick={() => navigate(`/admin/classes/${c.id}`)} className={`${rowClass} cursor-pointer hover:bg-slate-50`}>
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <span className="h-9 w-1 shrink-0 rounded-full" style={{ background: col.solid }} />
                          <div className="flex min-w-0 flex-col gap-0.5 leading-snug">
                            <span className="truncate font-extrabold text-slate-950">{c.name}</span>
                            <span className="flex items-center gap-2 text-xs text-slate-500">
                              {c.code}
                              {catName ? (
                                <Tag bg={col.bg} fg={col.fg} className="!py-0 !text-[11px]">
                                  {catName}
                                </Tag>
                              ) : null}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={`${tdClass} font-bold text-slate-700`}>{c.teacher?.fullName ?? <span className="font-semibold text-slate-400">Chưa phân công</span>}</td>
                      <td className={`${tdClass} whitespace-nowrap`}>
                        {sched ? (
                          <>
                            <span className="block font-semibold text-slate-700">{sched}</span>
                            <span className="text-xs text-slate-500">{c.room || "—"}</span>
                          </>
                        ) : (
                          <span className="text-slate-400">Chưa xếp lịch</span>
                        )}
                      </td>
                      <td className={tdClass}>
                        <div className="flex items-center gap-2.5">
                          <div className="h-1.5 w-[84px] overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: enrolled >= c.maxStudent ? "#f59e0b" : "#2563eb" }} />
                          </div>
                          <span className="text-[13px] font-bold tabular-nums text-slate-700">
                            {enrolled}/{c.maxStudent}
                          </span>
                        </div>
                      </td>
                      <td className={tdClass}>
                        <Tag bg={st.bg} fg={st.fg} width={124}>
                          {st.label}
                        </Tag>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
      </TableFrame>

      <ClassFormModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSubmit={handleCreate}
        submitting={submitting}
        codes={courses.map((c) => c.code)}
        rooms={courses.map((c) => c.room ?? "").filter(Boolean)}
      />
    </AdminLayout>
  );
}
