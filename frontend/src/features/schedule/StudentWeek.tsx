import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader, { surfaceClass } from "@/shared/components/PageHeader.tsx";
import { categoryColors, useCategories } from "@/features/categories/useCategories.ts";
import { useNowMinutes } from "@/shared/hooks/useNowMinutes.ts";
import { nowDate } from "@/shared/utils/now.ts";
import { useScheduleEvents } from "./events.ts";
import { visibleEvents } from "./selectors.ts";
import { H0, PXM, nowDay as getNowDay, dur, fmt, firstOpenDay, layoutDay, toWeekEvent, weekDaysOf, weekNoOf, weekRangeOf, type WeekEvent } from "./utils.ts";
import type { ScheduleEvent } from "./types.ts";

const NONE = { name: "Chưa phân loại", ...categoryColors(null) };
const SELF = { name: "Tự học", ...categoryColors("#94a3b8") };

type Look = { name: string; bg: string; fg: string; solid: string };
type Item = WeekEvent & { look: Look; clash: boolean; past: boolean };

/** Student calendar: read-only week grid (agenda below 900px) of the sessions of the student's own classes. */
export default function StudentWeek() {
  const navigate = useNavigate();
  const NOW_MIN = useNowMinutes();
  const NOW_DAY = getNowDay();
  const all = useScheduleEvents();
  const { categories, categoryById } = useCategories();
  const [week, setWeek] = useState(0);
  const [day, setDay] = useState(NOW_DAY);
  const [selId, setSelId] = useState<string | null>(null);

  const base = useMemo(() => visibleEvents(all, "student", "").map(toWeekEvent), [all]);

  /** Sessions of the student's classes are dated, so each week simply shows the events that fall inside it. */
  const events = useMemo<WeekEvent[]>(() => base.filter((e) => e.w === week), [base, week]);

  const lookOf = (e: ScheduleEvent): Look => {
    if (e.kind === "personal") return SELF;
    const c = categoryById(e.category);
    return c ? { name: c.name, ...categoryColors(c.color) } : NONE;
  };

  const days = weekDaysOf(week);
  const todayDay = week === 0 ? NOW_DAY : -1;
  const pastBefore = week < 0 ? 7 : week > 0 ? -1 : NOW_DAY; // days before this index are over
  const isPast = (e: { d: number; e: number }) => e.d < pastBefore || (week === 0 && e.d === NOW_DAY && e.e <= NOW_MIN);

  const items = useMemo<Item[]>(
    () =>
      events.map((e) => ({
        ...e,
        look: lookOf(e),
        clash: events.some((o) => o.id !== e.id && o.d === e.d && o.s < e.e && e.s < o.e),
        past: isPast(e),
      })),
    // lookOf/isPast only depend on the values listed here
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, categories, week],
  );

  const sel = items.find((e) => e.id === selId) ?? null;
  const statusOf = (e: Item): [string, string, string] => {
    if (e.past) return ["Đã học", "#f1f5f9", "#475569"];
    if (week === 0 && e.d === NOW_DAY && e.s <= NOW_MIN) return ["Đang diễn ra", "#ecfeff", "#155e75"];
    if (week === 0 && e.d === NOW_DAY) return [`Còn ${dur(e.s - NOW_MIN)}`, "#dbeafe", "#1e40af"];
    return ["Sắp tới", "#f1f5f9", "#334155"];
  };

  const next = useMemo(() => {
    const upcoming = base
      .filter((e) => e.kind === "class" && (e.w > 0 || (e.w === 0 && (e.d > NOW_DAY || (e.d === NOW_DAY && e.s > NOW_MIN)))))
      .sort((a, b) => a.w - b.w || a.d - b.d || a.s - b.s)[0];
    return upcoming ?? null;
  }, [base, NOW_DAY, NOW_MIN]);

  const perDay = days.map((_, d) => items.filter((e) => e.d === d));
  const totalOf = (list: Item[]) => list.reduce((a, e) => a + e.e - e.s, 0);

  const legend = useMemo(() => {
    const map = new Map<string, { look: Look; min: number }>();
    items.forEach((e) => {
      const cur = map.get(e.look.name) ?? { look: e.look, min: 0 };
      map.set(e.look.name, { look: cur.look, min: cur.min + e.e - e.s });
    });
    return [...map.values()];
  }, [items]);

  const goWeek = (w: number) => {
    setWeek(w);
    setDay(firstOpenDay(w) === 7 ? 0 : firstOpenDay(w));
    setSelId(null);
  };

  const hours = Array.from({ length: (1320 - H0) / 60 - 1 }, (_, i) => H0 + (i + 1) * 60);
  const dayItems = [...(perDay[day] ?? [])].sort((a, b) => a.s - b.s);
  const dateOf = (i: number) => days[i].date.slice(8);
  const weekBtn = "h-[38px] rounded-full bg-white text-slate-700 shadow-[0_0_0_1px_#e2e8f0] hover:bg-slate-100 hover:shadow-[0_0_0_1px_#94a3b8]";

  return (
    <div className="flex flex-col gap-[22px]">
      <PageHeader
        crumb={`Tuần ${weekNoOf(week)} · ${weekRangeOf(week)}${week === 0 ? ` · hôm nay ${nowDate().slice(8)}/${nowDate().slice(5, 7)}` : ""}`}
        title="Lịch học"
        actions={
          <div className="flex gap-1">
            <button type="button" aria-label="Tuần trước" className={`${weekBtn} w-[38px] text-[17px] font-black`} onClick={() => goWeek(week - 1)}>
              ‹
            </button>
            <button type="button" disabled={week === 0} className={`${weekBtn} px-3.5 text-[13px] font-extrabold disabled:opacity-40`} onClick={() => goWeek(0)}>
              Tuần này
            </button>
            <button type="button" aria-label="Tuần sau" className={`${weekBtn} w-[38px] text-[17px] font-black`} onClick={() => goWeek(week + 1)}>
              ›
            </button>
          </div>
        }
      />

      {base.length === 0 ? (
        <p className="rounded-2xl bg-white px-5 py-4 text-sm text-slate-600 shadow-[0_0_0_1px_#e6ebf3]">
          Bạn chưa có buổi học nào. Lịch hiện ra khi trung tâm ghi danh bạn vào lớp.
        </p>
      ) : null}

      <div className="-mt-2 flex flex-wrap gap-3">
        {legend.length === 0 ? <span className="text-xs font-bold text-slate-400">Tuần này chưa có lịch.</span> : null}
        {legend.map((l) => (
          <span key={l.look.name} className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <span className="size-2.5 rounded-[3px]" style={{ background: l.look.solid }} />
            {l.look.name} · {dur(l.min)}
          </span>
        ))}
      </div>

      {/* Desktop: hourly grid */}
      <div className="hidden flex-wrap items-start gap-5 min-[900px]:flex">
        <section className={`${surfaceClass} min-w-0 flex-[999_1_640px] overflow-hidden`}>
          <div className="max-h-[calc(100vh-170px)] overflow-auto">
            <div className="min-w-[680px]">
              <div className="sticky top-0 z-[6] grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-slate-200 bg-white">
                <span />
                {days.map((dd, d) => (
                  <div key={dd.date} className="flex flex-col items-center gap-1 border-l border-slate-100 py-2.5">
                    <span className="text-xs font-bold" style={{ color: d === todayDay ? "#2563eb" : "#64748b" }}>
                      {dd.k}
                    </span>
                    <span
                      className="grid size-8 place-items-center rounded-full text-[15px] font-black"
                      style={{ background: d === todayDay ? "#2563eb" : "transparent", color: d === todayDay ? "#fff" : d < pastBefore ? "#94a3b8" : "#020617" }}
                    >
                      {dateOf(d)}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">{totalOf(perDay[d]) ? dur(totalOf(perDay[d])) : "—"}</span>
                  </div>
                ))}
              </div>
              <div className="grid h-[840px] grid-cols-[56px_repeat(7,minmax(0,1fr))]">
                <div className="relative">
                  {hours.map((m) => (
                    <span key={m} className="absolute right-2 -translate-y-1/2 text-[11px] font-bold text-slate-400" style={{ top: (m - H0) * PXM }}>
                      {fmt(m)}
                    </span>
                  ))}
                </div>
                {days.map((dd, d) => {
                  const lay = layoutDay(perDay[d]);
                  return (
                    <div
                      key={dd.date}
                      className="relative border-l border-slate-100"
                      style={{ backgroundColor: d < pastBefore ? "#fcfcfd" : "#fff", backgroundImage: "linear-gradient(#f1f5f9 1px, transparent 1px)", backgroundSize: "100% 56px" }}
                    >
                      <span
                        className="pointer-events-none absolute inset-x-0 top-0"
                        style={{
                          height: d < pastBefore ? "100%" : d === todayDay ? (NOW_MIN - H0) * PXM : 0,
                          background: "repeating-linear-gradient(135deg, rgba(148,163,184,.08) 0 6px, transparent 6px 12px)",
                        }}
                      />
                      {perDay[d].map((e) => {
                        const l = lay[e.id] ?? { lane: 0, n: 1 };
                        return (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => setSelId(selId === e.id ? null : e.id)}
                            title={`${e.title}${e.meta ? ` · ${e.meta}` : ""}`}
                            className="absolute flex flex-col gap-px overflow-hidden rounded-[10px] px-2 py-[5px] text-left text-slate-900 hover:brightness-95"
                            style={{
                              left: `calc(${(l.lane / l.n) * 100}% + 3px)`,
                              width: `calc(${100 / l.n}% - 6px)`,
                              top: (e.s - H0) * PXM,
                              height: Math.max(22, (e.e - e.s) * PXM - 3),
                              background: e.look.bg,
                              opacity: e.past ? 0.5 : 1,
                              boxShadow: selId === e.id ? "0 0 0 2px #2563eb" : e.clash ? "0 0 0 1.5px #fda4af" : "none",
                            }}
                          >
                            <span className="flex min-w-0 items-center gap-[5px]">
                              <span className="size-1.5 shrink-0 rounded-full" style={{ background: e.look.solid }} />
                              <span className="truncate text-xs font-extrabold">{e.title}</span>
                            </span>
                            <span className="text-[11px] font-semibold opacity-85">
                              {fmt(e.s)} – {fmt(e.e)}
                            </span>
                            {e.clash ? <span className="max-w-full self-start truncate rounded-full bg-rose-100 px-1.5 text-[10px] font-extrabold text-rose-700">Trùng</span> : null}
                          </button>
                        );
                      })}
                      {d === todayDay ? (
                        <div className="absolute inset-x-0 z-[4] h-0.5 bg-rose-500" style={{ top: (NOW_MIN - H0) * PXM }}>
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

        <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-[18px]">
          <div className={`${surfaceClass} flex flex-col gap-2.5 p-[18px]`}>
            {sel ? (
              <>
                <span className="self-start rounded-full px-2.5 py-1 text-xs font-extrabold" style={{ background: sel.look.bg, color: sel.look.fg }}>
                  {sel.look.name}
                </span>
                <span className="text-lg font-black text-slate-950">{sel.title}</span>
                <div className="flex flex-col gap-1.5 text-[13px] text-slate-600">
                  <span>
                    <b className="text-slate-950">
                      {days[sel.d].label}, {dateOf(sel.d)}/{days[sel.d].date.slice(5, 7)} · {fmt(sel.s)} – {fmt(sel.e)}
                    </b>{" "}
                    · {dur(sel.e - sel.s)}
                  </span>
                  {sel.meta ? <span>{sel.meta}</span> : null}
                  {sel.link ? (
                    <a href={sel.link} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline underline-offset-4 hover:opacity-70">
                      Vào lớp online
                    </a>
                  ) : null}
                </div>
                {(() => {
                  const [t, bg, fg] = statusOf(sel);
                  return (
                    <span className="self-start rounded-full px-2.5 py-1 text-xs font-extrabold" style={{ background: bg, color: fg }}>
                      {t}
                    </span>
                  );
                })()}
              </>
            ) : (
              <>
                <span className="text-[15px] font-extrabold text-slate-950">Buổi tiếp theo</span>
                <span className="text-lg font-black text-slate-950">{next ? next.title : "Chưa có buổi học sắp tới"}</span>
                {next ? (
                  <span className="text-[13px] text-slate-600">
                    {next.w === 0 && next.d === NOW_DAY ? "Hôm nay" : `${weekDaysOf(next.w)[next.d].label}, ${next.date.slice(8)}/${next.date.slice(5, 7)}`} · {fmt(next.s)} – {fmt(next.e)}
                    {next.meta ? ` · ${next.meta}` : ""}
                  </span>
                ) : null}
                <span className="text-xs text-slate-400">Bấm vào một buổi trên lịch để xem chi tiết.</span>
              </>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_#d1fae5]" />
              <h2 className="text-[17px] font-extrabold">Phân bổ tuần</h2>
            </div>
            {days.map((dd, d) => (
              <div key={dd.date} className="grid grid-cols-[28px_minmax(0,1fr)_44px] items-center gap-2.5">
                <span className="text-xs font-extrabold" style={{ color: d === todayDay ? "#2563eb" : "#64748b" }}>
                  {dd.k}
                </span>
                <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                  {perDay[d].map((e) => (
                    <span key={e.id} className="h-full" style={{ width: `${((e.e - e.s) / 600) * 100}%`, background: e.look.solid }} />
                  ))}
                </div>
                <span className="text-right text-xs font-extrabold text-slate-700">{totalOf(perDay[d]) ? dur(totalOf(perDay[d])) : "—"}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Mobile: day strip + agenda */}
      <div className="flex flex-col gap-[22px] min-[900px]:hidden">
        <div className={`${surfaceClass} grid grid-cols-7 gap-1.5 p-1.5`}>
          {days.map((dd, d) => {
            const on = d === day;
            return (
              <button
                key={dd.date}
                type="button"
                onClick={() => setDay(d)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 ${on ? "bg-blue-600 text-white" : d === todayDay ? "text-blue-600 hover:bg-slate-100" : "text-slate-950 hover:bg-slate-100"}`}
                style={{ opacity: d < pastBefore && !on ? 0.45 : 1 }}
              >
                <span className="text-xs font-extrabold opacity-75">{dd.k}</span>
                <span className="text-[22px] font-black leading-none">{dateOf(d)}</span>
                <span className="flex h-1.5 gap-[3px]">
                  {perDay[d].slice(0, 3).map((e) => (
                    <span key={e.id} className="size-1.5 rounded-full" style={{ background: on ? "#bfdbfe" : e.look.solid }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-extrabold">
            {d0(week, day) ? "Hôm nay" : days[day].label}, {dateOf(day)}/{days[day].date.slice(5, 7)} · {dayItems.length ? `${dayItems.length} lịch` : "trống"}
          </h2>
          <span className="text-[13px] font-bold text-slate-500">{dayItems.length ? dur(totalOf(dayItems)) : ""}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {dayItems.map((e) => {
            const [t, bg, fg] = statusOf(e);
            return (
              <div key={e.id} className="grid grid-cols-[62px_minmax(0,1fr)] gap-3.5" style={{ opacity: e.past ? 0.6 : 1 }}>
                <div className="flex flex-col pt-4 leading-snug tabular-nums">
                  <span className="text-[15px] font-black text-slate-950">{fmt(e.s)}</span>
                  <span className="text-xs font-bold text-slate-400">{fmt(e.e)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-[20px] px-[18px] py-4" style={{ background: e.look.bg }}>
                  <span className="w-1 self-stretch rounded-full" style={{ background: e.look.solid }} />
                  <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-[3px]">
                    <span className="text-base font-black text-slate-950">{e.title}</span>
                    {e.meta ? <span className="text-[13px] text-slate-600">{e.meta}</span> : null}
                    <span className="text-xs font-bold text-slate-500">{e.look.name}</span>
                  </div>
                  <span className="min-w-[124px] rounded-full px-3 py-[5px] text-center text-xs font-extrabold" style={{ background: bg === "#f1f5f9" ? "#fff" : bg, color: fg }}>
                    {t}
                  </span>
                </div>
              </div>
            );
          })}
          {dayItems.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-3xl border-[1.5px] border-dashed border-slate-200 px-5 py-9 text-center">
              <span className="text-base font-extrabold text-slate-950">Ngày này trống lịch</span>
              <span className="text-sm text-slate-500">Dành 10 phút ôn thẻ để giữ chuỗi ngày học nhé.</span>
              <button type="button" className="mt-1.5 h-10 rounded-full bg-[#1f2937] px-[18px] text-sm font-extrabold text-white hover:bg-[#0b1220]" onClick={() => navigate("/student/flashcards")}>
                Ôn thẻ
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const d0 = (week: number, day: number) => week === 0 && day === getNowDay();
