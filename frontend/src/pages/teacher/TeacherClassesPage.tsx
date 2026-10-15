import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TeacherLayout from "@/shared/components/layout/TeacherLayout";
import Drawer from "@/shared/components/Drawer";
import PageHeader, { TableFrame, fieldClass, fieldErrClass, labelClass, outlineBtn, primaryBtn, rowClass, tdClass, thClass } from "@/shared/components/PageHeader";
import Pagination from "@/shared/components/Pagination";
import { usePaged } from "@/shared/hooks/usePaged";
import { useAuth } from "@/features/auth/useAuth";
import { nowDate } from "@/shared/utils/now";
import { categoryColors, useCategories } from "@/features/categories/useCategories";
import { useClasses } from "@/features/classes";
import { classAttendance, createClass, findConflicts, planSessionDates } from "@/features/classes/store";
import { AttBar, StatusPill } from "@/features/classes/ClassParts";
import type { ClassDraft } from "@/features/classes/types";
import { PERIODS, WEEKDAY_LABELS, fmtDM, fmtDuration, isOnlineRoom, maxPeriods, periodRange, roomSuggestions, scheduleText } from "@/features/classes/utils";

const WEEK_OPTIONS = [4, 6, 8, 10, 12, 16, 20, 24];
const genLink = () => `https://zoom.us/j/8${Math.floor(1e9 + Math.random() * 9e9)}`;

const draft0 = (): ClassDraft => ({
  name: "",
  room: "",
  startDate: nowDate(),
  days: [0, 2],
  startPeriod: 11,
  periods: 3,
  weeks: 12,
  category: "",
  link: "",
});

export default function TeacherClassesPage() {
  const navigate = useNavigate();
  const { categoryById } = useCategories();
  const { user } = useAuth();
  // useClasses() already returns only the signed-in teacher's classes.
  const mine = useClasses().filter((c) => c.teacherId === user?.id);
  const paged = usePaged(mine);
  const [open, setOpen] = useState(false);

  return (
    <TeacherLayout>
      <PageHeader
        crumb={`Giảng dạy · ${mine.length} lớp`}
        title="Lớp học của tôi"
        actions={
          <button type="button" className={primaryBtn} onClick={() => setOpen(true)}>
            + Tạo lớp học
          </button>
        }
      />

      <TableFrame>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Lớp</th>
                <th className={thClass}>Lịch học</th>
                <th className={thClass}>Phòng</th>
                <th className={thClass}>Sĩ số</th>
                <th className={thClass}>Chuyên cần</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {paged.rows.map((c) => {
                const col = categoryColors(categoryById(c.category)?.color);
                return (
                  <tr key={c.id} onClick={() => navigate(`/teacher/classes/${c.id}`)} className={`${rowClass} cursor-pointer hover:bg-slate-50`}>
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: col.solid }} />
                        <div className="flex min-w-0 flex-col leading-snug">
                          <span className="truncate font-extrabold text-slate-950">{c.name}</span>
                          <span className="text-xs text-slate-500">
                            {c.code} · {fmtDM(c.startDate)} – {fmtDM(c.endDate)}
                          </span>
                        </div>
                        {c.status === "CLOSED" ? <StatusPill status={c.status} /> : null}
                      </div>
                    </td>
                    <td className={`${tdClass} tabular-nums text-slate-700`}>{c.scheduleText}</td>
                    <td className={tdClass}>{c.room}</td>
                    <td className={`${tdClass} tabular-nums`}>
                      {c.enrolled ?? c.students.length}/{c.capacity}
                    </td>
                    <td className={tdClass}>
                      <AttBar value={classAttendance(c)} />
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-right font-extrabold text-slate-950 underline underline-offset-4`}>Vào lớp</td>
                  </tr>
                );
              })}
              {paged.rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                    <p className="font-bold text-slate-700">Bạn chưa có lớp nào.</p>
                    <p className="mt-1">Lớp do quản trị viên giao sẽ hiện ở đây, hoặc bạn có thể tự tạo lớp.</p>
                    <button type="button" className={`${primaryBtn} mt-4`} onClick={() => setOpen(true)}>
                      + Tạo lớp học
                    </button>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination page={paged.page} total={paged.total} pageSize={paged.pageSize} onChange={paged.setPage} />
      </TableFrame>

      {open ? (
        <CreateClassDrawer
          onClose={() => setOpen(false)}
          onCreated={(id) => {
            setOpen(false);
            navigate(`/teacher/classes/${id}?tab=sessions`);
          }}
        />
      ) : null}
    </TeacherLayout>
  );
}

function CreateClassDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const { categories } = useCategories();
  const { user } = useAuth();
  const rooms = roomSuggestions(useClasses());
  const [draft, setDraft] = useState<ClassDraft>(draft0);
  const [tried, setTried] = useState(false);
  const set = <K extends keyof ClassDraft>(k: K, v: ClassDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const range = periodRange(draft.startPeriod, draft.periods);
  const dates = useMemo(() => planSessionDates(draft.startDate, draft.days, draft.weeks), [draft.startDate, draft.days, draft.weeks]);
  const clashes = useMemo(
    () => findConflicts(user?.id ?? "", dates.map((date) => ({ date, start: range.start, end: range.end }))),
    [dates, range.start, range.end, user?.id],
  );
  const online = isOnlineRoom(draft.room);

  const errors = {
    name: !draft.name.trim() ? "Nhập tên lớp." : "",
    room: !draft.room.trim() ? "Nhập phòng học." : "",
    days: draft.days.length === 0 ? "Chọn ít nhất một ngày học." : "",
    date: !draft.startDate || draft.startDate < nowDate() ? "Ngày bắt đầu phải từ hôm nay trở đi." : "",
    link: online && !/^https?:\/\//.test(draft.link.trim()) ? "Nhập link Zoom bắt đầu bằng http(s)://" : "",
  };
  const firstError = errors.name || errors.room || errors.days || errors.date || errors.link;

  const toggleDay = (i: number) => set("days", draft.days.includes(i) ? draft.days.filter((d) => d !== i) : [...draft.days, i].sort((a, b) => a - b));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (firstError) return;
    const id = createClass(draft, { id: user?.id ?? "", name: user?.fullName || user?.username || "Giáo viên" });
    toast.success(`Đã tạo lớp · ${dates.length} buổi từ ${fmtDM(dates[0])}`);
    onCreated(id);
  };

  return (
    <Drawer title="Tạo lớp học" onClose={onClose} accent>
      <form onSubmit={submit} noValidate className="flex flex-col gap-3.5">
        <p className="-mt-2 text-[13px] text-slate-500">Tự xếp các buổi từ ngày bắt đầu theo số tuần đã chọn.</p>
        <div>
          <label className={labelClass}>Tên lớp</label>
          <input className={`${fieldClass} ${tried && errors.name ? fieldErrClass : ""}`} value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="vd. IELTS 6.0 Starter" />
        </div>
        <div>
          <label className={labelClass}>Danh mục</label>
          <select className={fieldClass} value={draft.category} onChange={(e) => set("category", e.target.value)}>
            <option value="">Chưa phân loại</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Ngày học trong tuần</label>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAY_LABELS.map((l, i) => {
              const on = draft.days.includes(i);
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`h-9 min-w-11 rounded-full border px-3 text-sm font-bold ${on ? "border-[#2563eb] bg-[#2563eb] text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Ngày bắt đầu</label>
            <input type="date" className={`${fieldClass} ${tried && errors.date ? fieldErrClass : ""}`} min={nowDate()} value={draft.startDate} onChange={(e) => set("startDate", e.target.value || draft.startDate)} />
          </div>
          <div>
            <label className={labelClass}>Thời lượng khoá</label>
            <select className={fieldClass} value={draft.weeks} onChange={(e) => set("weeks", Number(e.target.value))}>
              {WEEK_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} tuần
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Tiết bắt đầu</label>
            <select
              className={fieldClass}
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
            <label className={labelClass}>Số tiết</label>
            <select className={fieldClass} value={draft.periods} onChange={(e) => set("periods", Number(e.target.value))}>
              {Array.from({ length: maxPeriods(draft.startPeriod) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} tiết
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Phòng</label>
          <input
            list="class-rooms"
            className={`${fieldClass} ${tried && errors.room ? fieldErrClass : ""}`}
            value={draft.room}
            placeholder="vd. P.201 hoặc Online · Zoom"
            onChange={(e) => setDraft((d) => ({ ...d, room: e.target.value, link: isOnlineRoom(e.target.value) ? d.link || genLink() : "" }))}
          />
          <datalist id="class-rooms">
            {rooms.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>
        {online ? (
          <div>
            <label className={labelClass}>Link Zoom</label>
            <div className="flex gap-2">
              <input className={`${fieldClass} ${tried && errors.link ? fieldErrClass : ""}`} value={draft.link} onChange={(e) => set("link", e.target.value)} placeholder="https://zoom.us/j/…" />
              <button type="button" className={`${outlineBtn} shrink-0 !px-3 !text-xs`} onClick={() => set("link", genLink())}>
                Tạo link
              </button>
            </div>
          </div>
        ) : null}

        <p className="rounded-xl bg-slate-50 px-3 py-2 text-[13px] font-semibold text-slate-700">
          {draft.days.length ? scheduleText(draft.days, draft.startPeriod, draft.periods) : "Chưa chọn ngày học"} · {fmtDuration(range.minutes)} mỗi buổi · {dates.length} buổi
          {dates[0] ? `, bắt đầu ${fmtDM(dates[0])}` : ""}
        </p>
        {clashes.length ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13px] font-bold leading-snug text-rose-700">
            Trùng lịch của bạn: {clashes.slice(0, 3).join(", ")}
            {clashes.length > 3 ? ` và ${clashes.length - 3} lịch khác` : ""}
          </p>
        ) : null}
        {tried && firstError ? <p className="text-xs font-semibold text-rose-600">{firstError}</p> : null}

        <div className="flex gap-2 pt-1">
          <button type="submit" className={`${primaryBtn} flex-1 !rounded-xl !py-[11px]`}>
            {clashes.length ? "Vẫn tạo lớp" : "Tạo lớp & xếp lịch"}
          </button>
          <button type="button" className={`${outlineBtn} !rounded-xl !px-4 !py-[11px]`} onClick={onClose}>
            Huỷ
          </button>
        </div>
      </form>
    </Drawer>
  );
}
