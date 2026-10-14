import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TeacherLayout from "@/shared/components/layout/TeacherLayout";
import PageHeader, { TableFrame, outlineBtn, primaryBtn, tdClass, thClass } from "@/shared/components/PageHeader";
import Pagination from "@/shared/components/Pagination";
import { usePaged } from "@/shared/hooks/usePaged";
import { MOCK_NOW, MOCK_TEACHER } from "@/features/mock/common";
import { useClasses } from "@/features/classes";
import { createClass, avgAttendance } from "@/features/classes/store";
import { AttBar, StatusPill } from "@/features/classes/ClassParts";
import type { ClassDraft } from "@/features/classes/types";
import { PERIODS, ROOMS, WEEKDAY_LABELS, fmtDM, fmtDuration, maxPeriods, periodRange, scheduleText } from "@/features/classes/utils";

const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200";
const label = "mb-1 block text-xs font-bold text-slate-600";

const DRAFT0: ClassDraft = {
  name: "",
  code: "",
  room: "P.201",
  startDate: MOCK_NOW.date,
  endDate: "2026-12-31",
  days: [0, 2],
  startPeriod: 11,
  periods: 3,
};

export default function TeacherClassesPage() {
  const navigate = useNavigate();
  const all = useClasses();
  const mine = all.filter((c) => c.teacherId === MOCK_TEACHER.id);
  const paged = usePaged(mine);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ClassDraft>(DRAFT0);
  const [errors, setErrors] = useState<{ name?: string; days?: string; dates?: string }>({});

  const set = <K extends keyof ClassDraft>(k: K, v: ClassDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const range = periodRange(draft.startPeriod, draft.periods);

  const toggleDay = (i: number) => set("days", draft.days.includes(i) ? draft.days.filter((d) => d !== i) : [...draft.days, i]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!draft.name.trim()) next.name = "Vui lòng nhập tên lớp";
    if (draft.days.length === 0) next.days = "Chọn ít nhất 1 ngày học";
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) next.dates = "Ngày kết thúc phải sau ngày bắt đầu";
    setErrors(next);
    if (Object.keys(next).length) return;
    const id = createClass(draft);
    toast.success("Đã tạo lớp và xếp lịch");
    setOpen(false);
    setDraft(DRAFT0);
    navigate(`/teacher/classes/${id}?tab=sessions`);
  };

  return (
    <TeacherLayout>
      <PageHeader
        crumb={`Giáo viên · ${MOCK_TEACHER.name} · ${mine.length} lớp`}
        title="Lớp học của tôi"
        actions={
          <button type="button" className={primaryBtn} onClick={() => setOpen((v) => !v)}>
            {open ? "Đóng form" : "+ Tạo lớp học"}
          </button>
        }
      />

      {open ? (
        <form onSubmit={onSubmit} noValidate className="mb-6 rounded-3xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-[17px] font-extrabold">Tạo lớp học mới</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label className={label}>Tên lớp</label>
              <input className={input} value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="VD: IELTS 6.5 Foundation" />
              {errors.name ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors.name}</p> : null}
            </div>
            <div>
              <label className={label}>Mã lớp</label>
              <input className={input} value={draft.code} onChange={(e) => set("code", e.target.value)} placeholder="IELTS65" />
            </div>
            <div>
              <label className={label}>Phòng</label>
              <select className={input} value={draft.room} onChange={(e) => set("room", e.target.value)}>
                {ROOMS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3 md:col-span-2 lg:col-span-1 lg:grid-cols-1">
              <div>
                <label className={label}>Ngày bắt đầu</label>
                <input type="date" className={input} value={draft.startDate} onChange={(e) => set("startDate", e.target.value)} />
              </div>
              <div>
                <label className={label}>Ngày kết thúc</label>
                <input type="date" className={input} value={draft.endDate} onChange={(e) => set("endDate", e.target.value)} />
              </div>
            </div>
          </div>
          {errors.dates ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors.dates}</p> : null}

          <div className="mt-4">
            <label className={label}>Ngày học trong tuần</label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_LABELS.map((l, i) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`h-9 min-w-11 rounded-full border px-3 text-sm font-bold ${draft.days.includes(i) ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  {l}
                </button>
              ))}
            </div>
            {errors.days ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors.days}</p> : null}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className={label}>Tiết bắt đầu</label>
              <select
                className={input}
                value={draft.startPeriod}
                onChange={(e) => {
                  const p = Number(e.target.value);
                  setDraft((d) => ({ ...d, startPeriod: p, periods: Math.min(d.periods, maxPeriods(p)) }));
                }}
              >
                {PERIODS.map(([n, s]) => (
                  <option key={n} value={n}>
                    Tiết {n} · {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Số tiết mỗi buổi</label>
              <select className={input} value={draft.periods} onChange={(e) => set("periods", Number(e.target.value))}>
                {Array.from({ length: maxPeriods(draft.startPeriod) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} tiết
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            {draft.days.length ? scheduleText(draft.days, draft.startPeriod, draft.periods) : "Chưa chọn ngày học"} · {fmtDuration(range.minutes)} mỗi buổi
          </p>

          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-[13px] font-bold text-slate-500">Bảng tiết học (45 phút)</summary>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-[13px] tabular-nums text-slate-600 sm:grid-cols-4">
              {PERIODS.map(([n, s, e]) => (
                <span key={n}>
                  <b className="text-slate-950">Tiết {n}</b> {s}–{e}
                </span>
              ))}
            </div>
          </details>

          <div className="mt-5 flex gap-2">
            <button type="submit" className={primaryBtn}>
              Tạo lớp &amp; xếp lịch
            </button>
            <button type="button" className={outlineBtn} onClick={() => setOpen(false)}>
              Huỷ
            </button>
          </div>
        </form>
      ) : null}

      <TableFrame>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className={thClass}>Lớp</th>
                <th className={thClass}>Lịch học</th>
                <th className={thClass}>Phòng</th>
                <th className={thClass}>Sĩ số</th>
                <th className={thClass}>Chuyên cần TB</th>
                <th className={thClass}>Trạng thái</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {paged.rows.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0">
                  <td className={tdClass}>
                    <p className="font-extrabold text-slate-950">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {c.code} · {fmtDM(c.startDate)} – {fmtDM(c.endDate)}
                    </p>
                  </td>
                  <td className={`${tdClass} tabular-nums`}>{c.scheduleText}</td>
                  <td className={tdClass}>{c.room}</td>
                  <td className={`${tdClass} tabular-nums`}>{c.students.length}</td>
                  <td className={tdClass}>
                    <AttBar value={avgAttendance(c.students)} />
                  </td>
                  <td className={tdClass}>
                    <StatusPill status={c.status} />
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <Link to={`/teacher/classes/${c.id}`} className="text-[13px] font-bold text-blue-600 hover:underline">
                      Vào lớp →
                    </Link>
                  </td>
                </tr>
              ))}
              {paged.rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                    Bạn chưa có lớp nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination page={paged.page} total={paged.total} pageSize={paged.pageSize} onChange={paged.setPage} />
      </TableFrame>
    </TeacherLayout>
  );
}
