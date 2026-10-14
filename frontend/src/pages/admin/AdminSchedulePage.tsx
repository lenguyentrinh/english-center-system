import { useState } from "react";
import AdminLayout from "@/shared/components/layout/AdminLayout";
import PageHeader, { TableFrame, tdClass, thClass } from "@/shared/components/PageHeader";
import Pagination from "@/shared/components/Pagination";
import { usePaged } from "@/shared/hooks/usePaged";
import WeekSchedule from "@/features/schedule/WeekSchedule";
import { TEACHERS } from "@/features/schedule/mock";
import { useScheduleEvents } from "@/features/schedule/scheduleStore";
import { H0, H1, NOW_DAY, conflictMap, dur, fmt, toMinEvent } from "@/features/schedule/utils";

export default function AdminSchedulePage() {
  const all = useScheduleEvents();
  const [teacherId, setTeacherId] = useState<string | null>(null);

  const staff = all.filter((e) => e.owner === "staff").map(toMinEvent).filter((e) => e.d >= 0);
  const rows = TEACHERS.map((t) => {
    const es = staff.filter((e) => e.teacherId === t.id);
    const cls = es.filter((e) => e.category !== "Cá nhân");
    const teachMin = cls.reduce((a, e) => a + e.e - e.s, 0);
    const allMin = es.reduce((a, e) => a + e.e - e.s, 0);
    const conf = Object.keys(conflictMap(es)).length;
    const today = cls.filter((e) => e.d === NOW_DAY).sort((a, b) => a.s - b.s);
    return {
      ...t,
      classes: [...new Set(cls.map((e) => e.title))].join(", ") || "—",
      teach: teachMin ? dur(teachMin) : "—",
      today: today.length ? `${today.length} buổi · ${today.map((e) => fmt(e.s)).join(", ")}` : "Không có buổi",
      load: Math.round((allMin / (7 * (H1 - H0))) * 100),
      conf: Math.floor(conf / 2) || conf,
    };
  });
  const paged = usePaged(rows);

  const picked = TEACHERS.find((t) => t.id === teacherId);
  if (picked) {
    return (
      <AdminLayout wide>
        <WeekSchedule role="admin" teacherId={picked.id} teacherName={picked.name} onBack={() => setTeacherId(null)} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageHeader crumb={`Tuần 42 · 12 – 18 tháng 10 · ${rows.length} giáo viên`} title="Lịch giáo viên" />
      <TableFrame>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
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
              {paged.rows.map((r) => (
                <tr key={r.id} onClick={() => setTeacherId(r.id)} className="cursor-pointer border-b border-slate-100 hover:bg-slate-50">
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-800">{r.name.split(" ").pop()?.[0]}</span>
                      <div className="flex flex-col leading-snug">
                        <span className="font-extrabold text-slate-950">{r.name}</span>
                        <span className="text-xs text-slate-400">{r.roleCode}</span>
                      </div>
                    </div>
                  </td>
                  <td className={`${tdClass} max-w-[280px] text-slate-600`}>{r.classes}</td>
                  <td className={`${tdClass} font-extrabold tabular-nums text-slate-950`}>{r.teach}</td>
                  <td className={`${tdClass} text-slate-600`}>{r.today}</td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-[90px] overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-slate-900" style={{ width: `${r.load}%` }} />
                      </div>
                      <span className="text-[13px] font-bold tabular-nums text-slate-700">{r.load}%</span>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <span className={`rounded-full px-2.5 py-[3px] text-xs font-extrabold ${r.conf ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
                      {r.conf ? `${r.conf} trùng` : "Không"}
                    </span>
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-right font-extrabold text-blue-600`}>Xem lịch →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={paged.page} total={paged.total} onChange={paged.setPage} />
      </TableFrame>
    </AdminLayout>
  );
}
