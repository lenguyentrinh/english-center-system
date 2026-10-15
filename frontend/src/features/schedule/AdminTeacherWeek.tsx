import { useEffect, useMemo, useState } from "react";
import { surfaceClass } from "@/shared/components/PageHeader.tsx";
import { categoryColors, useCategories } from "@/features/categories/useCategories.ts";
import { DAY_SHORT, addDays, dmy, durText, fmtMin, isoDate, isoWeek, toMin } from "@/features/courses/scheduleUi.ts";
import type { TeacherSchedule } from "@/features/courses/types.ts";

const H0 = 7 * 60;
const H1 = 22 * 60;
const PX = 56 / 60;

type Props = {
  teacher: TeacherSchedule;
  /** Monday of the shown week. */
  weekStart: Date;
  onPrev: () => void;
  onNext: () => void;
  onNow: () => void;
  onBack: () => void;
  isCurrentWeek: boolean;
};

type Ev = TeacherSchedule["occurrences"][number] & { s: number; e: number; lane: number; lanes: number };

/** Lay overlapping events side by side (greedy lanes inside each overlap cluster). */
function layout(list: Omit<Ev, "lane" | "lanes">[]): Ev[] {
  const sorted = [...list].sort((a, b) => a.s - b.s || b.e - a.e);
  const out: Ev[] = [];
  let cluster: Omit<Ev, "lane" | "lanes">[] = [];
  let end = -1;
  const flush = () => {
    const lanes: number[] = [];
    const laneOf = new Map<Omit<Ev, "lane" | "lanes">, number>();
    cluster.forEach((ev) => {
      let i = lanes.findIndex((x) => x <= ev.s);
      if (i < 0) {
        i = lanes.length;
        lanes.push(ev.e);
      } else lanes[i] = ev.e;
      laneOf.set(ev, i);
    });
    cluster.forEach((ev) => out.push({ ...ev, lane: laneOf.get(ev) ?? 0, lanes: lanes.length }));
    cluster = [];
  };
  sorted.forEach((ev) => {
    if (cluster.length && ev.s >= end) {
      flush();
      end = -1;
    }
    cluster.push(ev);
    end = Math.max(end, ev.e);
  });
  flush();
  return out;
}

/** Read-only hourly week grid (07:00-22:00, 56px/hour) of one teacher, for the admin. */
export default function AdminTeacherWeek({ teacher, weekStart, onPrev, onNext, onNow, onBack, isCurrentWeek }: Props) {
  const { categoryById } = useCategories();
  // Re-render every minute so the red "now" line and the hatched past area follow real time.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const todayIso = isoDate(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, d) => {
        const date = addDays(weekStart, d);
        const iso = isoDate(date);
        const evs = layout(
          teacher.occurrences
            .filter((o) => o.date === iso)
            .map((o) => ({ ...o, s: toMin(o.startTime), e: toMin(o.endTime) })),
        );
        return { d, date, iso, evs, total: evs.reduce((a, e) => a + e.e - e.s, 0) };
      }),
    [teacher, weekStart],
  );
  const weekMin = days.reduce((a, d) => a + d.total, 0);
  const rangeText = `${dmy(weekStart)} – ${dmy(addDays(weekStart, 6))}`;

  const navBtn = "h-[38px] rounded-full bg-white text-[17px] font-black text-slate-700 shadow-[0_0_0_1px_#e2e8f0] hover:bg-slate-100";

  return (
    <div className="flex flex-col gap-[18px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <button type="button" onClick={onBack} className="self-start text-[13px] font-bold text-slate-600 underline underline-offset-4 hover:opacity-70">
            ← Danh sách giáo viên
          </button>
          <h1 className="text-[clamp(26px,3.4vw,34px)] font-black leading-tight tracking-tight text-slate-950">Lịch · {teacher.teacherFullName ?? "Giáo viên"}</h1>
          <span className="text-[13px] font-semibold text-slate-500">
            Tuần {isoWeek(weekStart)} · {rangeText} · {weekMin ? durText(weekMin) : "0 phút"} dạy
          </span>
        </div>
        <div className="flex gap-1">
          <button type="button" aria-label="Tuần trước" onClick={onPrev} className={`${navBtn} w-[38px]`}>
            ‹
          </button>
          <button
            type="button"
            onClick={onNow}
            disabled={isCurrentWeek}
            className={`${navBtn} px-3.5 !text-[13px] !font-extrabold ${isCurrentWeek ? "!cursor-default !bg-slate-100 !text-slate-400" : ""}`}
          >
            Tuần này
          </button>
          <button type="button" aria-label="Tuần sau" onClick={onNext} className={`${navBtn} w-[38px]`}>
            ›
          </button>
        </div>
      </header>

      <section className={`${surfaceClass} overflow-hidden`}>
        <div className="max-h-[calc(100vh-170px)] overflow-auto">
          <div className="min-w-[700px]">
            <div className="sticky top-0 z-[6] grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-slate-200 bg-white">
              <span />
              {days.map((day) => {
                const isToday = day.iso === todayIso;
                const past = day.iso < todayIso;
                return (
                  <div key={day.d} className="flex flex-col items-center gap-1 border-l border-slate-100 py-2.5">
                    <span className="text-xs font-bold" style={{ color: isToday ? "#2563eb" : "#64748b" }}>
                      {DAY_SHORT[day.d]}
                    </span>
                    <span
                      className="grid size-8 place-items-center rounded-full text-[15px] font-black"
                      style={{ background: isToday ? "#2563eb" : "transparent", color: isToday ? "#fff" : past ? "#94a3b8" : "#020617" }}
                    >
                      {String(day.date.getDate()).padStart(2, "0")}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">{day.total ? durText(day.total) : "—"}</span>
                  </div>
                );
              })}
            </div>
            <div className="grid h-[840px] grid-cols-[56px_repeat(7,minmax(0,1fr))]">
              <div className="relative">
                {Array.from({ length: (H1 - H0) / 60 - 1 }, (_, i) => H0 + (i + 1) * 60).map((m) => (
                  <span key={m} className="absolute right-2 -translate-y-1/2 text-[11px] font-bold text-slate-400" style={{ top: (m - H0) * PX }}>
                    {fmtMin(m)}
                  </span>
                ))}
              </div>
              {days.map((day) => {
                const isToday = day.iso === todayIso;
                const past = day.iso < todayIso;
                const pastH = past ? "100%" : isToday ? Math.max(0, Math.min(H1, nowMin) - H0) * PX : 0;
                return (
                  <div
                    key={day.d}
                    className="relative border-l border-slate-100"
                    style={{ backgroundColor: past ? "#fcfcfd" : "#fff", backgroundImage: "linear-gradient(#f1f5f9 1px,transparent 1px)", backgroundSize: "100% 56px" }}
                  >
                    <span
                      className="pointer-events-none absolute inset-x-0 top-0"
                      style={{ height: pastH, background: "repeating-linear-gradient(135deg,rgba(148,163,184,.08) 0 6px,transparent 6px 12px)" }}
                    />
                    {day.evs.map((e) => {
                      const col = categoryColors(categoryById(e.categoryId)?.color);
                      const h = Math.max(22, (e.e - e.s) * PX - 3);
                      return (
                        <div
                          key={`${e.courseId}-${e.s}`}
                          title={`${e.courseName} · ${fmtMin(e.s)}–${fmtMin(e.e)}${e.room ? ` · ${e.room}` : ""}`}
                          className="absolute flex flex-col gap-px overflow-hidden rounded-[10px] px-2 py-[5px] text-slate-900"
                          style={{
                            top: (e.s - H0) * PX,
                            height: h,
                            left: `calc(${(e.lane / e.lanes) * 100}% + 3px)`,
                            width: `calc(${100 / e.lanes}% - 6px)`,
                            background: col.bg,
                            opacity: past ? 0.5 : 1,
                            boxShadow: e.conflict ? "0 0 0 1.5px #fda4af" : "none",
                          }}
                        >
                          <span className="flex min-w-0 items-center gap-[5px]">
                            <span className="size-1.5 shrink-0 rounded-full" style={{ background: col.solid }} />
                            <span className="truncate text-xs font-extrabold">{e.courseName}</span>
                          </span>
                          <span className="text-[11px] font-semibold opacity-85">
                            {fmtMin(e.s)}–{fmtMin(e.e)}
                            {e.room ? ` · ${e.room}` : ""}
                          </span>
                          {e.conflict ? <span className="mt-0.5 max-w-full self-start truncate rounded-full bg-rose-100 px-1.5 text-[10px] font-extrabold text-rose-700">Trùng</span> : null}
                        </div>
                      );
                    })}
                    {isToday && nowMin >= H0 && nowMin <= H1 ? (
                      <div className="absolute inset-x-0 z-[4] h-0.5 bg-rose-500" style={{ top: (nowMin - H0) * PX }}>
                        <span className="absolute -left-[5px] -top-1 size-2.5 rounded-full bg-rose-500" />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
