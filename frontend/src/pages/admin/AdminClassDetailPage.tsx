import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import ConfirmDialog from "@/shared/components/ConfirmDialog.tsx";
import Modal from "@/shared/components/Modal.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import PageHeader, { BackLink, fieldClass, outlineBtn, primaryBtn, rowClass, surfaceClass, tdClass, thClass } from "@/shared/components/PageHeader.tsx";
import SearchInput from "@/shared/components/ui/SearchInput.tsx";
import { StatusDot, Tag } from "@/shared/components/ui/Tag.tsx";
import ClassFormModal from "@/components/courses/ClassFormModal.tsx";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { categoryColors, useCategories } from "@/features/categories/useCategories.ts";
import { cancelEnrollment, conflictMessage, enrollStudent, getCourseById, getCourseStudents, getCourses } from "@/features/courses/courseApi.ts";
import { useCourseMutations } from "@/features/courses/useCourseMutations.ts";
import { STATUS_TAG, fmtDate, toPayload } from "@/features/courses/classUi.ts";
import { DAY_LONG, DAY_SHORT, addDays, dmy, durText, isoDate, mondayOf, scheduleText, toMin } from "@/features/courses/scheduleUi.ts";
import { assignTeacherToCourse, getUsers } from "@/features/admin/adminApi.ts";
import { AVATAR, STATUS_META, initialOf } from "@/features/admin/userUi.ts";
import { getTeachers } from "@/features/teachers/teachersApi.ts";
import type { Course, CourseStudent } from "@/features/courses/types.ts";
import type { UserSummaryResponse } from "@/features/admin/types.ts";

const NO_COURSES: Course[] = [];
const NO_STUDENTS: CourseStudent[] = [];
const NO_USERS: UserSummaryResponse[] = [];

/** This week's sessions derived from the weekly pattern (days/time/room) clipped to the course date range. */
function weekSessions(c: Course) {
  if (!c.daysOfWeek?.length || !c.startTime || !c.endTime) return [];
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const today = isoDate(now);
  const mon = mondayOf(now);
  const s = toMin(c.startTime);
  const e = toMin(c.endTime);
  return [...c.daysOfWeek]
    .sort()
    .map((d) => ({ d, date: addDays(mon, d - 1) }))
    .filter(({ date }) => isoDate(date) >= c.startDate && isoDate(date) <= c.endDate)
    .map(({ d, date }) => {
      const iso = isoDate(date);
      const past = iso < today || (iso === today && e <= nowMin);
      const live = iso === today && s <= nowMin && e > nowMin;
      return { d, label: DAY_SHORT[d - 1], long: DAY_LONG[d - 1], date: dmy(date), time: `${c.startTime} – ${c.endTime}`, state: past ? "Đã học" : live ? "Đang học" : "Sắp tới" };
    });
}

const SESSION_STATE: Record<string, { bg: string; fg: string }> = {
  "Đã học": { bg: "#f1f5f9", fg: "#475569" },
  "Đang học": { bg: "#ecfeff", fg: "#155e75" },
  "Sắp tới": { bg: "#dbeafe", fg: "#1e40af" },
};

function AddStudentModal({ course, enrolledIds, onClose }: { course: Course; enrolledIds: Set<string>; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const users = data?.data ?? NO_USERS;

  const candidates = useMemo(() => {
    const s = q.trim().toLowerCase();
    return users
      .filter((u) => u.status === "ACTIVE" && u.roles?.includes("STUDENT") && !enrolledIds.has(u.id))
      .filter((u) => !s || `${u.fullName ?? ""} ${u.username} ${u.email ?? ""}`.toLowerCase().includes(s))
      .slice(0, 50);
  }, [users, q, enrolledIds]);

  const full = (course.enrolledCount ?? 0) >= course.maxStudent;
  const closed = course.status === "CLOSE";

  // A 409 "schedule conflict" keeps the row so admin can confirm and enroll anyway.
  const [clash, setClash] = useState<{ userId: string; text: string } | null>(null);
  const enroll = useMutation({
    mutationFn: ({ userId, force }: { userId: string; force?: boolean }) => enrollStudent(course.id, userId, force),
    onSuccess: (r) => {
      setClash(null);
      toast.success(`Đã thêm ${r.fullName ?? r.username} vào lớp`);
      void queryClient.invalidateQueries({ queryKey: ["course-students", course.id] });
      void queryClient.invalidateQueries({ queryKey: ["course", course.id] });
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e, v) => {
      const text = conflictMessage(e);
      if (text) setClash({ userId: v.userId, text });
      else toast.error(getApiErrorMessage(e, "Không thêm được học viên"));
    },
  });

  return (
    <Modal isOpen title="Thêm học viên vào lớp" onClose={onClose} widthClassName="max-w-lg">
      <div className="flex flex-col gap-3">
        {closed ? <p className="rounded-xl bg-amber-50 px-3 py-2 text-[13px] font-bold text-amber-800">Lớp đã đóng, không thể ghi danh thêm.</p> : null}
        {full && !closed ? <p className="rounded-xl bg-amber-50 px-3 py-2 text-[13px] font-bold text-amber-800">Lớp đã đủ {course.maxStudent} học viên. Tăng sĩ số tối đa trước khi thêm.</p> : null}
        {clash ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-[13px] font-bold text-rose-700">{clash.text}. Bấm “Vẫn thêm” để xác nhận.</p> : null}
        <SearchInput value={q} onChange={setQ} placeholder="Tìm học viên theo tên, username, email" className="max-w-none" />
        <ul className="max-h-[340px] overflow-y-auto">
          {isLoading ? (
            <li className="py-6 text-center text-sm text-slate-500">Đang tải…</li>
          ) : candidates.length === 0 ? (
            <li className="py-6 text-center text-sm text-slate-500">Không có học viên phù hợp (chỉ hiện tài khoản Học viên đang hoạt động, chưa ở trong lớp).</li>
          ) : (
            candidates.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 border-b border-dashed border-[#eef2f6] py-2.5 last:border-b-0">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-extrabold text-slate-950">{u.fullName || u.username}</span>
                  <span className="block truncate text-xs text-slate-500">
                    @{u.username} · {u.email ?? "—"}
                  </span>
                </span>
                <button type="button" className={primaryBtn} disabled={closed || full || enroll.isPending} onClick={() => enroll.mutate({ userId: u.id, force: clash?.userId === u.id })}>
                  {clash?.userId === u.id ? "Vẫn thêm" : "Thêm"}
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="flex justify-end">
          <button type="button" className={outlineBtn} onClick={onClose}>
            Xong
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function AdminClassDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { update, remove, submitting } = useCourseMutations();
  const { categoryById } = useCategories();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<CourseStudent | null>(null);
  const [pendingTeacher, setPendingTeacher] = useState<{ id: string; conflict: string } | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["course", id], queryFn: () => getCourseById(id), enabled: !!id });
  const course = data?.data ?? null;
  const { data: allRes } = useQuery({ queryKey: ["courses"], queryFn: getCourses });
  const allCourses = allRes?.data ?? NO_COURSES;
  const { data: studentsData } = useQuery({ queryKey: ["course-students", id], queryFn: () => getCourseStudents(id), enabled: !!id });
  const students = studentsData ?? NO_STUDENTS;
  const { data: teachersRes } = useQuery({ queryKey: ["teachers", "all"], queryFn: () => getTeachers(), enabled: !!course, staleTime: 30_000 });
  const { rows, page, setPage, total, pageSize } = usePaged(students);
  const enrolledIds = useMemo(() => new Set(students.map((s) => s.userId)), [students]);

  const refreshCourse = () => {
    void queryClient.invalidateQueries({ queryKey: ["course", id] });
    void queryClient.invalidateQueries({ queryKey: ["courses"] });
    void queryClient.invalidateQueries({ queryKey: ["course-schedule"] });
  };

  const assign = useMutation({
    mutationFn: ({ teacherId, force }: { teacherId: string; force?: boolean }) => assignTeacherToCourse(id, teacherId, force),
    onSuccess: () => {
      toast.success("Đã giao lớp cho giáo viên");
      setPendingTeacher(null);
      refreshCourse();
    },
    onError: (e, v) => {
      const c = conflictMessage(e);
      if (c) setPendingTeacher({ id: v.teacherId, conflict: c });
      else toast.error(getApiErrorMessage(e, "Không phân công được giáo viên"));
    },
  });

  const cancel = useMutation({
    mutationFn: (userId: string) => cancelEnrollment(id, userId),
    onSuccess: () => {
      toast.success("Đã gỡ học viên khỏi lớp");
      setRemoving(null);
      void queryClient.invalidateQueries({ queryKey: ["course-students", id] });
      refreshCourse();
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Không gỡ được học viên")),
  });

  if (isLoading) return <AdminLayout><div className={`${surfaceClass} px-6 py-8 text-slate-500`}>Đang tải…</div></AdminLayout>;
  if (!course) {
    return (
      <AdminLayout>
        <BackLink to="/admin/classes">Lớp học</BackLink>
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">Không tìm thấy lớp học.</div>
      </AdminLayout>
    );
  }

  const st = STATUS_TAG[course.status];
  const cat = categoryById(course.categoryId);
  const catCol = categoryColors(cat?.color ?? course.categoryColor);
  const catName = cat?.name ?? course.categoryName;
  const nextStatus = course.status === "OPEN" ? "ACTIVE" : "OPEN";
  const enrolled = students.length;
  const sched = scheduleText(course);

  const allTeachers = teachersRes?.data ?? [];
  const eligible = course.categoryId ? allTeachers.filter((t) => t.categoryIds.includes(course.categoryId!)) : allTeachers;
  const teacherOptions = course.teacher && !eligible.some((t) => t.id === course.teacher!.id) ? [...eligible, { id: course.teacher.id, fullName: course.teacher.fullName, categoryIds: [], roles: [] }] : eligible;

  const toggleStatus = async () => {
    try {
      // Only the status changes here, so an existing schedule clash must not block it.
      await update.mutateAsync({ id, payload: toPayload(course, { status: nextStatus, force: true }) });
      toast.success(nextStatus === "ACTIVE" ? "Lớp chuyển sang Đang học" : "Đã mở tuyển sinh lại");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Không đổi được trạng thái"));
    }
  };

  const saveEdit = async (payload: Parameters<typeof update.mutateAsync>[0]["payload"]) => {
    await update.mutateAsync({ id, payload });
    toast.success("Đã lưu khoá học");
    setEditOpen(false);
    refreshCourse();
  };

  const doDelete = async () => {
    try {
      await remove.mutateAsync(id);
      toast.success("Đã xoá khoá học");
      navigate("/admin/classes");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Không xoá được khoá học"));
      setConfirmDelete(false);
    }
  };

  const info: [string, string][] = [
    ["Mã lớp", course.code],
    ["Danh mục", catName ?? "Không phân loại"],
    ["Phòng", course.room || "—"],
    ["Lịch học", sched || "Chưa xếp lịch"],
    ["Thời lượng buổi", course.startTime && course.endTime ? durText(toMin(course.endTime) - toMin(course.startTime)) : "—"],
    ["Sĩ số", `${enrolled}/${course.maxStudent}`],
    ["Thời gian", `${fmtDate(course.startDate)} – ${fmtDate(course.endDate)}`],
    ["Độ tuổi tối thiểu", course.minimumAge != null ? String(course.minimumAge) : "—"],
    ["Trình độ đầu vào", course.requiredEntryLevel ?? "—"],
    ["Khoá tiên quyết", course.prerequisitesRequired ? "Có" : "Không"],
  ];
  const sessions = weekSessions(course);

  return (
    <AdminLayout>
      <div className="mb-3">
        <BackLink to="/admin/classes">Lớp học</BackLink>
      </div>
      <PageHeader
        crumb={
          <span className="flex flex-wrap items-center gap-2">
            <Tag bg={st.bg} fg={st.fg} width={124}>
              {st.label}
            </Tag>
            {catName ? (
              <Tag bg={catCol.bg} fg={catCol.fg}>
                {catName}
              </Tag>
            ) : null}
            <span>
              {course.code}
              {sched ? ` · ${sched}` : ""}
              {course.room ? ` · ${course.room}` : ""}
            </span>
          </span>
        }
        title={course.name}
        actions={
          <>
            {course.status !== "CLOSE" ? (
              <button type="button" className={outlineBtn} disabled={submitting} onClick={toggleStatus}>
                {course.status === "OPEN" ? "Chuyển sang Đang học" : "Mở tuyển sinh lại"}
              </button>
            ) : null}
            <button type="button" className={outlineBtn} onClick={() => navigate("/admin/schedule")}>
              Xem lịch giáo viên
            </button>
            <button type="button" className={primaryBtn} onClick={() => setEditOpen(true)}>
              Chỉnh sửa
            </button>
            <button type="button" className={`${outlineBtn} !border-rose-200 !text-rose-600`} onClick={() => setConfirmDelete(true)}>
              Xoá
            </button>
          </>
        }
      />

      <div className="grid items-start gap-5 min-[1100px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className={`${surfaceClass} overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eef2f6] px-5 py-3.5">
            <h2 className="text-base font-black">
              Học viên <span className="font-bold text-slate-400">· {enrolled}</span>
            </h2>
            <button type="button" className={primaryBtn} onClick={() => setAddOpen(true)} disabled={course.status === "CLOSE"} title={course.status === "CLOSE" ? "Lớp đã đóng" : undefined}>
              + Thêm học viên
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>Học viên</th>
                  <th className={thClass}>Liên hệ</th>
                  <th className={thClass}>Ngày ghi danh</th>
                  <th className={thClass}>Trạng thái</th>
                  <th className={thClass} />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className={`${tdClass} py-8 text-center text-slate-500`} colSpan={5}>
                      Lớp chưa có học viên. Nhấn “+ Thêm học viên” để ghi danh.
                    </td>
                  </tr>
                ) : (
                  rows.map((s) => {
                    const meta = STATUS_META[(s.userStatus as keyof typeof STATUS_META) ?? "ACTIVE"] ?? STATUS_META.ACTIVE;
                    return (
                      <tr key={s.enrollmentId} onClick={() => navigate(`/admin/users/${s.userId}`)} className={`${rowClass} cursor-pointer hover:bg-slate-50`}>
                        <td className={tdClass}>
                          <div className="flex items-center gap-3">
                            <span style={{ background: AVATAR.STUDENT.bg, color: AVATAR.STUDENT.fg }} className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-extrabold">
                              {initialOf(s.fullName || s.username)}
                            </span>
                            <span className="flex min-w-0 flex-col leading-snug">
                              <span className="truncate font-extrabold text-slate-950">{s.fullName || s.username}</span>
                              <span className="truncate text-xs text-slate-500">@{s.username}</span>
                            </span>
                          </div>
                        </td>
                        <td className={tdClass}>
                          <span className="block text-slate-800">{s.email ?? "—"}</span>
                          <span className="block text-xs text-slate-500">{s.phone ?? ""}</span>
                        </td>
                        <td className={`${tdClass} text-slate-600`}>{fmtDate(s.enrollDate)}</td>
                        <td className={tdClass}>
                          <StatusDot dot={meta.dot} fg={meta.fg} bg={meta.bg}>
                            {meta.label}
                          </StatusDot>
                        </td>
                        <td className={`${tdClass} text-right`}>
                          <button
                            type="button"
                            className={`${outlineBtn} !border-rose-200 !text-rose-600`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRemoving(s);
                            }}
                          >
                            Gỡ
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
        </section>

        <div className="flex flex-col gap-5">
          <section className={`${surfaceClass} p-5`}>
            <h2 className="mb-3 text-base font-black">Thông tin lớp</h2>
            <label className="mb-1 block text-xs font-bold text-slate-600">Giáo viên phụ trách{course.categoryId ? " (đúng chuyên môn danh mục)" : ""}</label>
            <select
              className={fieldClass}
              value={course.teacher?.id ?? ""}
              disabled={assign.isPending}
              onChange={(e) => e.target.value && assign.mutate({ teacherId: e.target.value })}
            >
              <option value="" disabled>
                Chưa phân công
              </option>
              {teacherOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName ?? `#${t.id}`}
                </option>
              ))}
            </select>
            {course.categoryId && teachersRes && eligible.length === 0 ? <p className="mt-1 text-xs font-semibold text-amber-700">Chưa có giáo viên nào có chuyên môn “{catName}”.</p> : null}
            <dl className="mt-3">
              {info.map(([l, v], i) => (
                <div key={l} className={`flex justify-between gap-3 py-2 text-sm ${i ? "border-t border-dashed border-[#eef2f6]" : ""}`}>
                  <dt className="text-slate-500">{l}</dt>
                  <dd className="text-right font-bold text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={`${surfaceClass} p-5`}>
            <h2 className="mb-3 text-base font-black">Buổi học tuần này</h2>
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-500">{sched ? "Không có buổi học nào trong tuần này." : "Lớp chưa xếp lịch học."}</p>
            ) : (
              <ul>
                {sessions.map((s, i) => (
                  <li key={s.d} className={`flex items-center justify-between gap-3 py-2 text-sm ${i ? "border-t border-dashed border-[#eef2f6]" : ""}`}>
                    <span className="min-w-0">
                      <span className="block font-bold text-slate-900">
                        {s.long}, {s.date}
                      </span>
                      <span className="text-xs text-slate-500">
                        {s.time} · {course.room || "—"}
                      </span>
                    </span>
                    <Tag bg={SESSION_STATE[s.state].bg} fg={SESSION_STATE[s.state].fg} width={84}>
                      {s.state}
                    </Tag>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <ClassFormModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={saveEdit}
        submitting={submitting}
        editing={course}
        codes={allCourses.filter((c) => c.id !== id).map((c) => c.code)}
        rooms={allCourses.map((c) => c.room ?? "").filter(Boolean)}
      />
      {addOpen ? <AddStudentModal course={{ ...course, enrolledCount: enrolled }} enrolledIds={enrolledIds} onClose={() => setAddOpen(false)} /> : null}
      <ConfirmDialog
        isOpen={removing !== null}
        title="Gỡ học viên"
        message={`Gỡ ${removing?.fullName || removing?.username || ""} khỏi lớp? Lịch sử ghi danh vẫn được giữ.`}
        confirmText="Gỡ"
        cancelText="Huỷ"
        isDangerous
        isLoading={cancel.isPending}
        onCancel={() => setRemoving(null)}
        onConfirm={() => removing && cancel.mutate(removing.userId)}
      />
      <ConfirmDialog
        isOpen={pendingTeacher !== null}
        title="Giáo viên bị trùng lịch"
        message={`${pendingTeacher?.conflict ?? ""}. Vẫn phân công giáo viên này?`}
        confirmText="Vẫn phân công"
        cancelText="Huỷ"
        isLoading={assign.isPending}
        onCancel={() => setPendingTeacher(null)}
        onConfirm={() => pendingTeacher && assign.mutate({ teacherId: pendingTeacher.id, force: true })}
      />
      <ConfirmDialog
        isOpen={confirmDelete}
        title="Xoá khoá học"
        message={`Xoá khoá "${course.name}"? Khoá sẽ bị ẩn khỏi hệ thống.`}
        confirmText="Xoá"
        cancelText="Huỷ"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={doDelete}
        isLoading={remove.isPending}
        isDangerous
      />
    </AdminLayout>
  );
}
