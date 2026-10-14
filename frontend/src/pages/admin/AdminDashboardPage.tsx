import { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/shared/components/layout/AdminLayout";
import { TableFrame, outlineBtn, tdClass, thClass } from "@/shared/components/PageHeader";
import Pagination from "@/shared/components/Pagination";
import { usePaged } from "@/shared/hooks/usePaged";
import { CATEGORY_STYLE } from "@/features/mock/common";
import { useScheduleEvents } from "@/features/schedule/scheduleStore";
import { NOW_DAY, NOW_MIN, dur, fmt, freeWindows, toMinEvent } from "@/features/schedule/utils";

const IE = [91, 93, 90, 94, 92, 95, 93, 96, 94, 95, 97, 96];
const TO = [84, 86, 83, 88, 85, 87, 89, 86, 90, 88, 91, 92];
const X = (i: number) => i * 100 + 50;
const Y = (v: number) => ((100 - v) / 20) * 200;
const linePath = (a: number[]) => a.map((v, i) => `${i ? "L" : "M"}${X(i)} ${Y(v).toFixed(1)}`).join(" ");

const spark = (arr: number[]) => {
  const mn = Math.min(...arr);
  const mx = Math.max(...arr);
  return arr.map((v, i) => `${((i / (arr.length - 1)) * 100).toFixed(1)},${(27 - ((v - mn) / (mx - mn || 1)) * 24).toFixed(1)}`).join(" ");
};

const ST = { OPEN: ["#d1fae5", "#065f46"], ACTIVE: ["#dbeafe", "#1e40af"], CLOSED: ["#e2e8f0", "#334155"] } as const;
type CourseRow = { code: string; name: string; teacher: string; n: number; max: number; att: number; next: string; st: keyof typeof ST };
const COURSES: CourseRow[] = [
  { code: "IELTS7A", name: "IELTS 7.0 Intensive", teacher: "Nguyễn Hà", n: 12, max: 15, att: 96, next: "T4 14/10 · 18:30", st: "ACTIVE" },
  { code: "TOE650B", name: "TOEIC 650 Booster", teacher: "Trần Minh", n: 16, max: 20, att: 91, next: "T5 15/10 · 09:30", st: "ACTIVE" },
  { code: "IELTS65", name: "IELTS 6.5 Foundation", teacher: "Phạm Lan", n: 14, max: 14, att: 88, next: "Hôm nay · 17:45", st: "ACTIVE" },
  { code: "COM-B1", name: "Giao tiếp cơ bản", teacher: "Lê Trinh", n: 10, max: 18, att: 97, next: "T6 16/10 · 14:00", st: "OPEN" },
  { code: "TOE750", name: "TOEIC 750 Online", teacher: "Đỗ Quân", n: 20, max: 25, att: 82, next: "T5 15/10 · 16:30", st: "OPEN" },
  { code: "IELTS8", name: "IELTS 8.0 Mastery", teacher: "Nguyễn Hà", n: 8, max: 8, att: 100, next: "Đã kết thúc", st: "CLOSED" },
];
const ST_LABEL = { OPEN: "OPEN", ACTIVE: "ACTIVE", CLOSED: "CLOSED" };

export default function AdminDashboardPage() {
  const all = useScheduleEvents();
  const [hov, setHov] = useState(11);
  const paged = usePaged(COURSES);

  const evs = all.filter((e) => e.owner === "staff").map(toMinEvent).filter((e) => e.d >= 0);
  const today = evs.filter((e) => e.d === NOW_DAY).sort((a, b) => a.s - b.s);
  const leftClasses = today.filter((e) => e.category !== "Cá nhân" && e.e > NOW_MIN).length;
  const freeMin = freeWindows(evs, NOW_DAY)
    .filter(([a, b]) => b - a >= 30 && a < 1260)
    .reduce((acc, [a, b]) => acc + Math.min(b, 1260) - a, 0);
  const teachMin = evs.filter((e) => e.category !== "Cá nhân").reduce((a, e) => a + e.e - e.s, 0);

  const agenda: ({ now: true } | { now: false; ev: (typeof today)[number] })[] = [];
  let placed = false;
  today.forEach((ev) => {
    if (!placed && ev.s > NOW_MIN) {
      agenda.push({ now: true });
      placed = true;
    }
    agenda.push({ now: false, ev });
    if (!placed && ev.s <= NOW_MIN && ev.e > NOW_MIN) {
      agenda.push({ now: true });
      placed = true;
    }
  });
  if (!placed) agenda.push({ now: true });

  const stats = [
    { label: "Học viên đang học", value: "248", delta: "+12 so với tháng 9", good: true, color: "#020617", data: [210, 214, 219, 224, 228, 231, 236, 240, 248] },
    { label: "Chuyên cần tuần này", value: "94,6%", delta: "+1,2 điểm", good: true, color: "#2563eb", data: [91, 92, 90, 93, 92, 94, 93, 95, 94.6] },
    { label: "Giờ dạy tuần này", value: dur(teachMin), delta: "trên lịch tuần 42", good: null, color: "#0891b2", data: [18, 20, 19, 22, 21, 23, 22, 24, teachMin / 60] },
    { label: "Bài chờ chấm", value: "14", delta: "5 bài quá hạn 2 ngày", good: false, color: "#e11d48", data: [6, 8, 7, 9, 11, 10, 12, 13, 14] },
  ];
  const deltaColor = (g: boolean | null) => (g === null ? "#64748b" : g ? "#059669" : "#e11d48");

  const area = `${linePath(IE)} L ${X(11)} 200 L ${X(0)} 200 Z`;
  const hovLeft = `${((hov + 0.5) / 12) * 100}%`;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-4 pb-1">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-slate-500">Thứ Ba, 13 tháng 10 · 14:20</span>
            <h1 className="max-w-[30ch] text-[30px] font-extrabold leading-tight">
              Hôm nay còn <span className="text-blue-600">{leftClasses}</span> buổi dạy và <span className="text-emerald-600">{dur(freeMin)}</span> trống.
            </h1>
          </div>
          <Link to="/admin/schedule" className={outlineBtn}>
            Mở lịch tuần
          </Link>
        </header>

        <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] overflow-hidden rounded-3xl border border-slate-200 bg-white">
          {stats.map((k) => (
            <div key={k.label} className="flex flex-col gap-2.5 border-b border-r border-slate-100 px-[22px] py-5">
              <span className="text-[13px] font-semibold text-slate-500">{k.label}</span>
              <div className="flex items-end justify-between gap-3">
                <span className="text-[30px] font-extrabold leading-none tracking-[-0.02em] tabular-nums text-slate-950">{k.value}</span>
                <svg width="96" height="30" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden>
                  <polyline points={spark(k.data)} fill="none" stroke={k.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
              <span className="text-xs font-bold" style={{ color: deltaColor(k.good) }}>
                {k.delta}
              </span>
            </div>
          ))}
        </section>

        <section className="flex flex-wrap items-stretch gap-5">
          <article className="flex min-w-0 flex-[999_1_520px] flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-[22px]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-[17px] font-extrabold">Chuyên cần 12 tuần</h3>
                <span className="text-[13px] text-slate-500">% học viên có mặt, theo chương trình</span>
              </div>
              <div className="flex gap-3.5 text-[13px] font-bold">
                <span className="flex items-center gap-1.5 text-blue-800">
                  <span className="h-[3px] w-3.5 rounded-sm bg-blue-600" />
                  IELTS
                </span>
                <span className="flex items-center gap-1.5 text-cyan-800">
                  <span className="h-[3px] w-3.5 rounded-sm bg-cyan-500" />
                  TOEIC
                </span>
              </div>
            </div>
            <div className="grid grid-cols-[30px_minmax(0,1fr)] gap-2">
              <div className="relative h-[200px] text-[11px] font-semibold text-slate-400">
                {[100, 95, 90, 85, 80].map((v, i) => (
                  <span key={v} className="absolute right-0 -translate-y-1/2" style={{ top: `${i * 25}%` }}>
                    {v}
                  </span>
                ))}
              </div>
              <div className="relative h-[200px]">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-px" style={{ background: i === 4 ? "#e2e8f0" : "#f1f5f9" }} />
                  ))}
                </div>
                <div className="absolute inset-y-0 w-px bg-slate-300" style={{ left: hovLeft }} />
                <svg width="100%" height="200" viewBox="0 0 1200 200" preserveAspectRatio="none" className="absolute inset-0 overflow-visible">
                  <path d={area} fill="rgba(37,99,235,.07)" />
                  <path d={linePath(TO)} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  <path d={linePath(IE)} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </svg>
                <span className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-blue-600 bg-white" style={{ left: hovLeft, top: `${(Y(IE[hov]) / 200) * 100}%` }} />
                <span className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-cyan-500 bg-white" style={{ left: hovLeft, top: `${(Y(TO[hov]) / 200) * 100}%` }} />
                <div
                  className="pointer-events-none absolute -top-1.5 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs leading-normal text-white shadow-[0_8px_24px_-8px_rgba(2,6,23,.4)]"
                  style={{ left: hovLeft, transform: `translateX(${hov > 8 ? "calc(-100% - 12px)" : "12px"})` }}
                >
                  <div className="font-extrabold">Tuần {31 + hov}</div>
                  <div className="text-blue-300">IELTS {IE[hov]}%</div>
                  <div className="text-cyan-300">TOEIC {TO[hov]}%</div>
                </div>
                <div className="absolute inset-0 flex">
                  {IE.map((_, i) => (
                    <div key={i} onMouseEnter={() => setHov(i)} className="h-full flex-1 cursor-crosshair" />
                  ))}
                </div>
              </div>
              <div />
              <div className="flex">
                {IE.map((_, i) => (
                  <span key={i} className="flex-1 text-center text-[11px] font-bold" style={{ color: i === hov ? "#020617" : "#94a3b8" }}>
                    T{31 + i}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <article className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 rounded-3xl border border-slate-200 bg-white px-6 py-[22px]">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[17px] font-extrabold">Hôm nay</h3>
              <Link to="/admin/schedule" className="text-[13px] font-bold text-blue-600">
                Xem cả tuần
              </Link>
            </div>
            <div className="flex flex-col">
              {agenda.map((a, i) => {
                if (a.now) {
                  return (
                    <div key={`now-${i}`} className="flex items-center gap-2 py-1.5">
                      <span className="w-12 text-xs font-extrabold text-rose-600">{MOCK_TIME}</span>
                      <span className="size-2 rounded-full bg-rose-500" />
                      <span className="h-0.5 flex-1 rounded-sm bg-rose-500" />
                    </div>
                  );
                }
                const { ev } = a;
                const c = CATEGORY_STYLE[ev.category];
                const running = ev.s <= NOW_MIN && ev.e > NOW_MIN;
                const status = ev.e <= NOW_MIN ? "Đã xong" : running ? "Đang diễn ra" : `Sau ${dur(ev.s - NOW_MIN)}`;
                return (
                  <div key={ev.id} className="flex gap-3 py-2.5" style={{ opacity: ev.e <= NOW_MIN ? 0.55 : 1 }}>
                    <div className="flex w-12 flex-col text-xs font-bold leading-snug tabular-nums text-slate-700">
                      <span>{fmt(ev.s)}</span>
                      <span className="text-slate-400">{fmt(ev.e)}</span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-[14px] px-3 py-2.5" style={{ background: c.bg }}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold" style={{ color: c.text }}>
                          {ev.title}
                        </span>
                        <span className="whitespace-nowrap text-[11px] font-extrabold" style={{ color: running ? "#e11d48" : "#64748b" }}>
                          {status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-600">{ev.meta}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        <TableFrame>
          <div className="flex items-baseline justify-between px-6 pb-2 pt-[22px]">
            <h3 className="text-[17px] font-extrabold">Khoá học của trung tâm</h3>
            <span className="text-[13px] text-slate-500">6 khoá · 3 trạng thái</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className={thClass}>Khoá học</th>
                  <th className={thClass}>Giáo viên</th>
                  <th className={thClass}>Sĩ số</th>
                  <th className={thClass}>Chuyên cần</th>
                  <th className={thClass}>Buổi tới</th>
                  <th className={thClass}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {paged.rows.map((c) => (
                  <tr key={c.code} className="border-b border-slate-100">
                    <td className={tdClass}>
                      <div className="flex flex-col leading-snug">
                        <span className="font-extrabold text-slate-950">{c.name}</span>
                        <span className="text-xs font-bold text-slate-400">{c.code}</span>
                      </div>
                    </td>
                    <td className={`${tdClass} text-slate-600`}>{c.teacher}</td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.round((c.n / c.max) * 100)}%` }} />
                        </div>
                        <span className="text-[13px] font-bold tabular-nums text-slate-700">
                          {c.n}/{c.max}
                        </span>
                      </div>
                    </td>
                    <td className={`${tdClass} font-extrabold tabular-nums`} style={{ color: c.att < 85 ? "#e11d48" : "#020617" }}>
                      {c.att}%
                    </td>
                    <td className={`${tdClass} text-slate-600`}>{c.next}</td>
                    <td className={tdClass}>
                      <span className="rounded-full px-3 py-[3px] text-xs font-bold" style={{ background: ST[c.st][0], color: ST[c.st][1] }}>
                        {ST_LABEL[c.st]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={paged.page} total={paged.total} onChange={paged.setPage} />
        </TableFrame>
      </div>
    </AdminLayout>
  );
}

const MOCK_TIME = fmt(NOW_MIN);
