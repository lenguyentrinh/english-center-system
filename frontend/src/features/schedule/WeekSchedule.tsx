import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Drawer from "@/shared/components/Drawer";
import Modal from "@/shared/components/Modal";
import { Tag } from "@/shared/components/ui/Tag";
import { outlineBtn, primaryBtn, surfaceClass } from "@/shared/components/PageHeader";
import { useAuth } from "@/features/auth/useAuth";
import { useNowMinutes } from "@/shared/hooks/useNowMinutes";
import { useCategories, categoryColors, NEUTRAL_COLOR } from "@/features/categories/useCategories";
import { copySession, useClasses } from "@/features/classes/store";
import { roomSuggestions } from "@/features/classes/utils";
import { addEvents, removeEvent, updateEvent } from "./scheduleStore";
import { useScheduleEvents } from "./events";
import { visibleEvents } from "./selectors";
import type { ScheduleEvent, ScheduleRole } from "./types";
import {
  H0, H1, PXM, nowDay as getNowDay, TIMES, addIsoDays, conflictMap, dur, fmt, firstOpenDay, freeWindows, layoutDay, toWeekEvent,
  weekDaysOf, weekNoOf, weekRangeOf, type WeekEvent,
} from "./utils";

type DType = "makeup" | "tutor" | "meet" | "personal" | "self";
const DTYPES: Record<DType, { label: string; teaching: boolean }> = {
  makeup: { label: "Dạy bù", teaching: true },
  tutor: { label: "Kèm 1-1", teaching: true },
  meet: { label: "Họp", teaching: false },
  personal: { label: "Việc riêng", teaching: false },
  self: { label: "Tự học", teaching: false },
};
type Draft = { d: number; s: number; e: number; type: DType; title: string; touched: boolean; classId: string; room: string; link: string; repeat: boolean; tried: boolean };
type Drag = { d: number; a: number; b: number };

type Props = { role: ScheduleRole; teacherId?: string; teacherName?: string; onBack?: () => void };

const ONLINE_ROOM = "Online · Zoom";
const REPEAT_WEEKS = 8;
const field = "w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm font-bold text-slate-950 outline-none focus:border-blue-600 focus:shadow-[0_0_0_4px_#dbeafe]";
const labelCls = "text-xs font-bold text-slate-600";
let evSeq = 0;
const newEventId = () => `ev-${Date.now().toString(36)}-${++evSeq}`;
const genLink = () => `https://zoom.us/j/8${Math.floor(1e9 + Math.random() * 9e9)}`;
const isUrl = (v: string) => /^https?:\/\//.test(v.trim());
const dayShort = (w: number, d: number) => {
  const wd = weekDaysOf(w)[d];
  return `${wd.label}, ${wd.date.slice(8)}/${wd.date.slice(5, 7)}`;
};

export default function WeekSchedule({ role, teacherId: teacherIdProp, teacherName, onBack }: Props) {
  const { user } = useAuth();
  /** Teacher calendars belong to the signed-in teacher unless another teacher is passed in. */
  const teacherId = teacherIdProp ?? user?.id ?? "";
  const NOW_MIN = useNowMinutes();
  const NOW_DAY = getNowDay();
  const all = useScheduleEvents();
  const classes = useClasses();
  const { categoryById } = useCategories();
  const isStudent = role === "student";
  /** Admin only watches a teacher's calendar (read-only, same as design v5). */
  const isAdmin = role === "admin";

  const [week, setWeek] = useState(0);
  const weekDays = weekDaysOf(week);
  /** First weekday that is not in the past (7 = the whole week is past, 0 = nothing is past). */
  const ND = firstOpenDay(week);
  const isThisWeek = week === 0;

  const mine = useMemo(() => visibleEvents(all, role, teacherId).map(toWeekEvent), [all, role, teacherId]);
  const evs = useMemo(() => mine.filter((e) => e.w === week), [mine, week]);
  const conflicts = useMemo(() => conflictMap(evs), [evs]);

  const [selId, setSelId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [findDur, setFindDur] = useState(0);
  const [copyOpen, setCopyOpen] = useState(false);
  const dragRef = useRef<{ d: number; a: number; b: number; lo: number; moved: boolean; el: HTMLElement } | null>(null);
  const dragging = drag !== null;

  const myClasses = useMemo(() => classes.filter((c) => c.teacherId === teacherId && c.status !== "CLOSED"), [classes, teacherId]);
  const rooms = useMemo(() => roomSuggestions(classes), [classes]);

  const colorsOf = (ev: Pick<ScheduleEvent, "kind" | "category">) => {
    if (ev.kind === "personal") return { bg: "#f1f5f9", fg: "#334155", solid: NEUTRAL_COLOR };
    return categoryColors(categoryById(ev.category)?.color);
  };
  const categoryName = (ev: Pick<ScheduleEvent, "kind" | "category">) => (ev.kind === "personal" ? "Họp / việc riêng" : (categoryById(ev.category)?.name ?? "Chưa phân loại"));

  const newDraft = (d: number, s: number, e: number): Draft => ({
    d, s, e, type: isStudent ? "self" : "makeup", title: "", touched: false, classId: myClasses[0]?.id ?? "", room: rooms[0] ?? ONLINE_ROOM, link: "", repeat: false, tried: false,
  });
  const openDraft = (d: number, s: number, e: number) => {
    if (isAdmin || d < ND) return;
    setSelId(null);
    setDraft(newDraft(d, s, e));
  };

  const startDrag = (d: number, e: ReactMouseEvent<HTMLDivElement>) => {
    if (isAdmin || e.button !== 0 || d < ND) return;
    const el = e.currentTarget;
    const lo = d === NOW_DAY && isThisWeek ? Math.ceil(NOW_MIN / 15) * 15 : H0;
    const m = H0 + Math.floor((e.clientY - el.getBoundingClientRect().top) / PXM / 15) * 15;
    if (m < lo || m >= H1) return;
    e.preventDefault();
    dragRef.current = { d, a: m, b: m, lo, moved: false, el };
    setDrag({ d, a: m, b: m });
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent) => {
      const r = dragRef.current;
      if (!r) return;
      const raw = H0 + Math.floor((e.clientY - r.el.getBoundingClientRect().top) / PXM / 15) * 15;
      const m = Math.min(H1 - 15, Math.max(r.lo, raw));
      if (m !== r.a) r.moved = true;
      r.b = m;
      setDrag({ d: r.d, a: r.a, b: m });
    };
    const up = () => {
      const r = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!r) return;
      const [s, e] = r.moved ? [Math.min(r.a, r.b), Math.max(r.a, r.b) + 15] : [r.a, Math.min(H1, r.a + 60)];
      setSelId(null);
      setDraft(newDraft(r.d, s, e));
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    // newDraft only depends on inputs that are stable for the duration of a drag
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, isStudent, myClasses]);

  const changeWeek = (w: number) => {
    setWeek(w);
    setSelId(null);
    setDraft(null);
  };

  const cols = weekDays.map((_, d) => {
    const dayEvs = evs.filter((e) => e.d === d);
    return { dayEvs, lay: layoutDay(dayEvs) };
  });
  const dayMins = cols.map((c) => c.dayEvs.reduce((a, e) => a + e.e - e.s, 0));
  const totalMin = dayMins.reduce((a, b) => a + b, 0);

  const groupKey = (e: Pick<ScheduleEvent, "kind" | "category">) => (e.kind === "personal" ? "__personal" : e.category || "__none");
  // Distribution groups: one per category present this week, plus private blocks.
  const groups = useMemo(() => {
    const map = new Map<string, { key: string; name: string; colors: { bg: string; fg: string; solid: string }; min: number }>();
    evs.forEach((e) => {
      const key = groupKey(e);
      const g = map.get(key) ?? { key, name: categoryName(e), colors: colorsOf(e), min: 0 };
      g.min += e.e - e.s;
      map.set(key, g);
    });
    return [...map.values()];
    // colorsOf/categoryName only read the category lookup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evs, categoryById]);

  const found: { d: number; a: number; b: number }[] = [];
  if (findDur) weekDays.forEach((_, d) => freeWindows(evs, d, ND).forEach(([a, b]) => b - a >= findDur && found.push({ d, a, b })));

  const create = () => {
    if (ND >= 7) return;
    let pick: [number, number] | null = null;
    for (let d = Math.max(ND, 0); d < 7 && !pick; d++) {
      const w = freeWindows(evs, d, ND).find(([a, b]) => b - a >= 60 && a >= 480);
      if (w) pick = [d, w[0]];
    }
    const [pd, ps] = pick ?? [Math.min(6, Math.max(ND, 0)), 540];
    openDraft(pd, ps, Math.min(H1, ps + 90));
  };

  const sel = isAdmin ? null : (evs.find((e) => e.id === selId) ?? null);
  const title = role === "student" ? "Lịch học" : role === "admin" ? `Lịch · ${teacherName ?? ""}` : "Lịch tuần";

  const saveDraft = (autoTitle: string) => {
    if (!draft || draft.e <= draft.s) return;
    const tp = DTYPES[draft.type];
    if (!isStudent && draft.room === ONLINE_ROOM && !isUrl(draft.link)) {
      setDraft({ ...draft, tried: true });
      return;
    }
    const cls = tp.teaching ? myClasses.find((c) => c.id === draft.classId) : undefined;
    const baseId = newEventId();
    const weeksToMake = draft.repeat ? REPEAT_WEEKS : 1;
    const list: ScheduleEvent[] = Array.from({ length: weeksToMake }, (_, i) => ({
      id: `${baseId}-${i}`,
      date: addIsoDays(weekDays[draft.d].date, i * 7),
      start: fmt(draft.s),
      end: fmt(draft.e),
      title: (draft.touched && draft.title.trim()) || autoTitle,
      category: cls?.category ?? "",
      kind: tp.teaching ? "class" : "personal",
      meta: draft.room + (cls ? ` · ${cls.name}` : ""),
      link: !isStudent && draft.room === ONLINE_ROOM ? draft.link.trim() : undefined,
      classId: cls?.id,
      owner: isStudent ? "student" : "staff",
      teacherId: isStudent ? undefined : teacherId,
      custom: true,
    }));
    addEvents(list);
    setDraft(null);
    setSelId(list[0].id);
    toast.success(weeksToMake > 1 ? `Đã thêm lịch lặp lại ${weeksToMake} tuần` : "Đã lưu lịch");
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          {onBack ? (
            <button type="button" onClick={onBack} className="self-start text-[13px] font-bold text-slate-600 underline underline-offset-4 hover:opacity-70">
              ← Danh sách giáo viên
            </button>
          ) : null}
          <span className="text-[13px] font-semibold text-slate-500">
            Tuần {weekNoOf(week)} · {weekRangeOf(week)}
          </span>
          <h1 className="text-[clamp(26px,3.4vw,34px)] font-black leading-tight tracking-tight text-slate-950">{title}</h1>
          <div className="flex gap-1">
            <button type="button" onClick={() => changeWeek(week - 1)} aria-label="Tuần trước" className="size-[38px] rounded-full bg-white text-[17px] font-black text-slate-700 shadow-[0_0_0_1px_#e2e8f0] hover:bg-slate-100">
              ‹
            </button>
            <button
              type="button"
              onClick={() => changeWeek(0)}
              disabled={isThisWeek}
              className={`h-[38px] rounded-full px-3.5 text-[13px] font-extrabold shadow-[0_0_0_1px_#e2e8f0] ${isThisWeek ? "cursor-default bg-slate-100 text-slate-500" : "bg-white text-[#1f2937] hover:bg-slate-100"}`}
            >
              Tuần này
            </button>
            <button type="button" onClick={() => changeWeek(week + 1)} aria-label="Tuần sau" className="size-[38px] rounded-full bg-white text-[17px] font-black text-slate-700 shadow-[0_0_0_1px_#e2e8f0] hover:bg-slate-100">
              ›
            </button>
          </div>
        </div>
        {isAdmin ? null : (
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            {isStudent ? null : (
              <button type="button" onClick={() => setCopyOpen(true)} disabled={ND >= 7} className={outlineBtn}>
                <span className="sm:hidden">Sao chép tuần</span>
                <span className="hidden sm:inline">Sao chép từ tuần trước</span>
              </button>
            )}
            <button type="button" onClick={create} disabled={ND >= 7} className={primaryBtn}>
              {isStudent ? "+ Thêm giờ tự học" : "+ Tạo lịch"}
            </button>
          </div>
        )}
      </header>

      {mine.length === 0 && !isAdmin ? (
        <p className="rounded-2xl bg-white px-5 py-4 text-sm text-slate-600 shadow-[0_0_0_1px_#e6ebf3]">
          {isStudent ? "Bạn chưa có buổi học nào." : "Bạn chưa có lịch nào. Lịch lớp xuất hiện khi quản trị viên giao lớp cho bạn hoặc bạn tạo lớp ở mục Lớp học; bạn cũng có thể kéo trên lịch để thêm lịch dạy bù, họp hoặc việc riêng."}
        </p>
      ) : null}

      {groups.length ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] font-bold text-slate-700">
          {groups.map((g) => (
            <span key={g.key} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[3px]" style={{ background: g.colors.solid }} />
              {g.name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-start gap-5">
        <section className={`${surfaceClass} min-w-0 flex-[999_1_680px] overflow-hidden`}>
          <div className="max-h-[calc(100vh-230px)] overflow-auto">
            <div className="min-w-[720px]">
              <div className="sticky top-0 z-[6] grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b border-slate-200 bg-white">
                <div className="self-end py-3 text-center text-[10px] font-bold text-slate-400">GMT+7</div>
                {weekDays.map((day, d) => (
                  <div key={day.k} className="flex flex-col items-center gap-1 border-l border-slate-100 px-1.5 py-3">
                    <span className="text-xs font-bold" style={{ color: d === ND ? "#2563eb" : "#64748b" }}>
                      {day.k}
                    </span>
                    <span
                      className="grid size-8 place-items-center rounded-full text-[15px] font-extrabold"
                      style={{ background: d === ND ? "#2563eb" : "transparent", color: d === ND ? "#fff" : d < ND ? "#94a3b8" : "#020617" }}
                    >
                      {day.date.slice(8)}
                    </span>
                    <span className="text-[11px] font-semibold tabular-nums text-slate-400">{dayMins[d] ? dur(dayMins[d]) : "—"}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))]">
                <div className="relative h-[840px]">
                  {Array.from({ length: (H1 - H0) / 60 - 1 }, (_, i) => H0 + (i + 1) * 60).map((m) => (
                    <span key={m} className="absolute right-2.5 -translate-y-1/2 text-[11px] font-bold tabular-nums text-slate-400" style={{ top: (m - H0) * PXM }}>
                      {fmt(m)}
                    </span>
                  ))}
                </div>
                {cols.map(({ dayEvs, lay }, d) => {
                  const past = d < ND;
                  const today = d === ND;
                  const dr = drag && drag.d === d ? { a: drag.a, b: drag.b } : !drag && draft && draft.d === d ? { a: draft.s, b: draft.e - 15 } : null;
                  const gs = dr ? Math.min(dr.a, dr.b) : 0;
                  const ge = dr ? Math.max(dr.a, dr.b) + 15 : 0;
                  return (
                    <div
                      key={d}
                      onMouseDown={(e) => startDrag(d, e)}
                      className="relative h-[840px] select-none border-l border-slate-100"
                      style={{
                        backgroundImage: "linear-gradient(#f1f5f9 1px, transparent 1px)",
                        backgroundSize: "100% 56px",
                        backgroundColor: past ? "#fcfcfd" : "#fff",
                        cursor: past || isAdmin ? "default" : "crosshair",
                      }}
                    >
                      {past || today ? (
                        <div
                          className="pointer-events-none absolute inset-x-0 top-0"
                          style={{
                            height: past ? "100%" : (NOW_MIN - H0) * PXM,
                            background: "repeating-linear-gradient(135deg, rgba(148,163,184,.08) 0 6px, transparent 6px 12px)",
                          }}
                        />
                      ) : null}
                      {findDur
                        ? freeWindows(evs, d, ND)
                            .filter(([a, b]) => b - a >= findDur)
                            .map(([a, b]) => (
                              <div
                                key={a}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => openDraft(d, a, Math.min(H1, a + findDur))}
                                title="Bấm để giữ chỗ"
                                className="absolute inset-x-1 flex cursor-pointer items-start rounded-[10px] border-[1.5px] border-dashed border-emerald-500 bg-emerald-500/[.06] px-1.5 py-1 hover:bg-emerald-500/[.14]"
                                style={{ top: (a - H0) * PXM + 2, height: (b - a) * PXM - 4 }}
                              >
                                <span className="text-[11px] font-extrabold text-emerald-700">Trống {dur(b - a)}</span>
                              </div>
                            ))
                        : null}
                      {dayEvs.map((ev) => {
                        const L = lay[ev.id];
                        const c = colorsOf(ev);
                        const ended = past || (today && isThisWeek && ev.e <= NOW_MIN);
                        return (
                          <div
                            key={ev.id}
                            title={`${ev.title} · ${ev.meta ?? ""}`}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => setSelId(ev.id === selId ? null : ev.id)}
                            className={`absolute z-[2] flex flex-col gap-px overflow-hidden rounded-[10px] px-2 py-[5px] ${isAdmin ? "" : "cursor-pointer"}`}
                            style={{
                              top: (ev.s - H0) * PXM + 1,
                              height: Math.max(22, (ev.e - ev.s) * PXM - 3),
                              left: `calc(${(L.lane / L.n) * 100}% + 3px)`,
                              width: `calc(${100 / L.n}% - 6px)`,
                              background: c.bg,
                              color: "#0f172a",
                              opacity: ended ? 0.5 : 1,
                              boxShadow: selId === ev.id ? "0 0 0 2px #2563eb" : conflicts[ev.id] ? "0 0 0 1.5px #fda4af" : "0 0 0 1px rgba(255,255,255,.9)",
                            }}
                          >
                            <div className="flex min-w-0 items-center gap-[5px]">
                              <span className="size-1.5 shrink-0 rounded-full" style={{ background: c.solid }} />
                              <span className="truncate text-xs font-extrabold leading-tight">{ev.title}</span>
                            </div>
                            <span className="whitespace-nowrap text-[11px] font-semibold tabular-nums opacity-85">
                              {fmt(ev.s)} – {fmt(ev.e)}
                            </span>
                            {conflicts[ev.id] && ev.e - ev.s >= 60 ? (
                              <span className="mt-0.5 self-start rounded-full bg-rose-100 px-1.5 py-px text-[10px] font-extrabold text-rose-700">Trùng lịch</span>
                            ) : null}
                          </div>
                        );
                      })}
                      {dr ? (
                        <div
                          className="pointer-events-none absolute inset-x-1 z-[3] rounded-[10px] bg-slate-950/85 px-2 py-[5px] text-[11px] font-extrabold text-white"
                          style={{ top: (gs - H0) * PXM, height: Math.max(14, (ge - gs) * PXM) }}
                        >
                          {!drag && draft ? "Lịch mới · " : ""}
                          {fmt(gs)} – {fmt(ge)}
                        </div>
                      ) : null}
                      {today && isThisWeek ? (
                        <div className="pointer-events-none absolute -left-px right-0 z-[4] h-0.5 bg-rose-500" style={{ top: (NOW_MIN - H0) * PXM - 1 }}>
                          <span className="absolute -left-[5px] -top-1 size-2.5 rounded-full bg-rose-500" />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {isAdmin ? null : (
            <div className="flex flex-wrap gap-x-[18px] gap-y-1.5 border-t border-slate-200 px-5 py-3 text-[13px] text-slate-500">
              <span>
                <b className="text-slate-700">Kéo chuột</b> trên ô trống để chọn khung giờ (bước 15 phút), rồi điền chi tiết ở bảng bên phải
              </span>
              <span>
                <b className="text-slate-700">Bấm</b> vào lịch để xem chi tiết
              </span>
            </div>
          )}
        </section>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          {isAdmin ? null : (
            <div className={`${surfaceClass} flex flex-col gap-3 p-5`}>
              <div>
                <h3 className="text-base font-extrabold">Tìm khung trống</h3>
                <span className="text-[13px] text-slate-500">Từ bây giờ đến hết tuần, trong khung 07:00–22:00</span>
              </div>
              <div className="flex gap-1 rounded-xl bg-[#eef2f6] p-1">
                {(
                  [
                    [0, "Tắt"],
                    [30, "30p"],
                    [60, "1h"],
                    [90, "1h30"],
                    [120, "2h"],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFindDur(v)}
                    className={`flex-1 rounded-[9px] px-1 py-[7px] text-[13px] font-bold ${findDur === v ? "bg-white text-slate-950 shadow-[0_1px_2px_rgba(15,23,42,.12)]" : "text-slate-500"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {findDur ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-500">
                    {found.length} khung đủ {dur(findDur)} · hiện trên lịch bằng viền xanh
                  </span>
                  {found.slice(0, 6).map((w) => (
                    <div key={`${w.d}-${w.a}`} className="flex items-center gap-2.5 rounded-xl bg-slate-50 py-2 pl-3 pr-2">
                      <div className="flex min-w-0 flex-1 flex-col leading-snug">
                        <span className="text-[13px] font-extrabold text-slate-950">{dayShort(week, w.d)}</span>
                        <span className="text-xs tabular-nums text-slate-500">
                          {fmt(w.a)} – {fmt(w.b)} · trống {dur(w.b - w.a)}
                        </span>
                      </div>
                      <button type="button" onClick={() => openDraft(w.d, w.a, Math.min(H1, w.a + findDur))} className={`${primaryBtn} !px-3 !py-1.5 !text-xs`}>
                        Giữ chỗ
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          <div className={`${surfaceClass} flex flex-col gap-3.5 p-5`}>
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-extrabold">Phân bổ tuần</h3>
              <span className="text-[13px] font-bold text-slate-700">{dur(totalMin)} / tuần</span>
            </div>
            <div className="flex flex-col gap-[9px]">
              {weekDays.map((day, d) => (
                <div key={day.k} className="grid grid-cols-[28px_minmax(0,1fr)_44px] items-center gap-2.5">
                  <span className="text-xs font-extrabold text-slate-700">{day.k}</span>
                  <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-slate-100">
                    {groups.map((g) => {
                      const m = cols[d].dayEvs.filter((e) => groupKey(e) === g.key).reduce((a, e) => a + e.e - e.s, 0);
                      return m ? <div key={g.key} className="h-full" style={{ width: `${(m / (H1 - H0)) * 100}%`, background: g.colors.solid }} /> : null;
                    })}
                  </div>
                  <span className="text-right text-xs font-bold tabular-nums text-slate-500">{dayMins[d] ? dur(dayMins[d]) : "—"}</span>
                </div>
              ))}
            </div>
            {groups.length ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {groups.map((g) => (
                  <div key={g.key} className="rounded-[14px] px-3 py-2.5" style={{ background: g.colors.bg, color: g.colors.fg }}>
                    <div className="text-lg font-black tabular-nums">{dur(g.min)}</div>
                    <div className="truncate text-xs font-bold">{g.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Tuần này chưa có lịch.</p>
            )}
          </div>
        </aside>
      </div>

      {draft ? (
        <DraftDrawer draft={draft} setDraft={setDraft} evs={evs} weekDays={weekDays} nowDay={ND} isStudent={isStudent} classes={myClasses} rooms={rooms} onSave={saveDraft} />
      ) : null}

      {sel && !draft ? (
        <Drawer title="Chi tiết lịch" onClose={() => setSelId(null)}>
          <div className="flex flex-col gap-3">
            <Tag bg={colorsOf(sel).bg} fg={colorsOf(sel).fg} className="self-start">
              {categoryName(sel)}
            </Tag>
            {sel.kind === "personal" || sel.custom ? (
              <input
                value={sel.title}
                onChange={(e) => updateEvent(sel.id, { title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-lg font-extrabold text-slate-950 outline-none focus:border-blue-600 focus:shadow-[0_0_0_4px_#dbeafe]"
              />
            ) : (
              <span className="text-lg font-extrabold text-slate-950">{sel.title}</span>
            )}
            <div className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1.5 text-sm">
              <span className="text-slate-500">Ngày</span>
              <span className="font-bold">{dayShort(week, sel.d)}</span>
              <span className="text-slate-500">Giờ</span>
              <span className="font-bold tabular-nums">
                {fmt(sel.s)} – {fmt(sel.e)} · {dur(sel.e - sel.s)}
              </span>
              <span className="text-slate-500">Chi tiết</span>
              <span className="font-bold">{sel.meta || "—"}</span>
            </div>
            {sel.link ? (
              <a href={sel.link} target="_blank" rel="noreferrer" className={`${primaryBtn} self-start`}>
                Vào Zoom
              </a>
            ) : null}
            {conflicts[sel.id] ? <div className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13px] font-bold text-rose-700">Trùng với: {conflicts[sel.id].join(", ")}</div> : null}
            {sel.kind === "personal" || sel.custom ? (
              <button
                type="button"
                onClick={() => {
                  removeEvent(sel.id);
                  setSelId(null);
                }}
                className="self-start rounded-full border border-rose-200 bg-white px-3.5 py-[7px] text-[13px] font-bold text-rose-600 hover:bg-rose-50"
              >
                Xoá lịch này
              </button>
            ) : (
              <span className="text-xs text-slate-400">
                {isStudent ? (
                  "Lịch học của lớp, đồng bộ từ trung tâm."
                ) : (
                  <>
                    Lịch dạy đồng bộ từ khoá học, chỉnh trong{" "}
                    <Link to={sel.classId ? `/teacher/classes/${sel.classId}?tab=sessions` : "/teacher/classes"} className="font-bold text-slate-600 underline underline-offset-4">
                      Lớp học
                    </Link>
                    .
                  </>
                )}
              </span>
            )}
          </div>
        </Drawer>
      ) : null}

      {copyOpen ? <CopyModal targetWeek={week} nowDay={ND} mine={mine} onClose={() => setCopyOpen(false)} teacherId={teacherId} colorsOf={colorsOf} /> : null}
    </div>
  );
}

/* ---------------- create drawer ---------------- */
type DrawerProps = {
  draft: Draft;
  setDraft: (fn: (d: Draft | null) => Draft | null) => void;
  evs: WeekEvent[];
  weekDays: ReturnType<typeof weekDaysOf>;
  nowDay: number;
  isStudent: boolean;
  classes: { id: string; name: string }[];
  rooms: string[];
  onSave: (autoTitle: string) => void;
};

function DraftDrawer({ draft, setDraft, evs, weekDays, nowDay, isStudent, classes, rooms, onSave }: DrawerProps) {
  const upd = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const tp = DTYPES[draft.type];
  const cname = classes.find((c) => c.id === draft.classId)?.name ?? "";
  const short = cname.split(" ").slice(0, 2).join(" ");
  const autoTitle = { makeup: `Dạy bù · ${cname}`, tutor: `Kèm 1-1 · ${short}`, meet: "Họp chuyên môn", personal: "Việc riêng", self: "Tự học" }[draft.type];
  const conf = evs.filter((x) => x.d === draft.d && x.s < draft.e && draft.s < x.e).map((x) => `${x.title} (${fmt(x.s)}–${fmt(x.e)})`);
  const types: DType[] = isStudent ? ["self"] : ["makeup", "tutor", "meet", "personal"];
  const online = !isStudent && draft.room === ONLINE_ROOM;
  const linkBad = online && draft.tried && !isUrl(draft.link);
  const noClass = tp.teaching && classes.length === 0;

  return (
    <Drawer title={isStudent ? "Thêm giờ tự học" : "Tạo lịch mới"} accent onClose={() => setDraft(() => null)}>
      <div className="flex flex-col gap-3.5">
        {isStudent ? null : (
          <div className="flex flex-wrap gap-1.5">
            {types.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => upd({ type: k })}
                className={`rounded-full border px-3 py-1.5 text-[13px] font-extrabold ${draft.type === k ? "border-[#1f2937] bg-[#1f2937] text-white" : "border-slate-200 bg-white text-slate-700"}`}
              >
                {DTYPES[k].label}
              </button>
            ))}
          </div>
        )}
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Tiêu đề</span>
          <input value={draft.touched ? draft.title : autoTitle} onChange={(e) => upd({ title: e.target.value, touched: true })} className={`${field} text-[15px] font-extrabold`} />
        </label>
        {tp.teaching ? (
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Lớp học</span>
            <select value={draft.classId} onChange={(e) => upd({ classId: e.target.value })} className={field}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {noClass ? <span className="text-xs font-semibold text-rose-600">Bạn chưa có lớp nào đang hoạt động.</span> : null}
          </label>
        ) : null}
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Ngày</span>
          <select value={draft.d} onChange={(e) => upd({ d: +e.target.value })} className={field}>
            {weekDays.map((wd, i) => (i >= nowDay ? <option key={i} value={i}>{`${wd.label}, ${wd.date.slice(8)}/${wd.date.slice(5, 7)}`}</option> : null))}
          </select>
        </label>
        <div className="grid grid-cols-2 items-end gap-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Bắt đầu</span>
            <select value={draft.s} onChange={(e) => upd({ s: +e.target.value, e: Math.min(H1, +e.target.value + Math.max(15, draft.e - draft.s)) })} className={field}>
              {TIMES.filter((m) => m < H1).map((m) => (
                <option key={m} value={m}>
                  {fmt(m)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Kết thúc · {dur(draft.e - draft.s)}</span>
            <select value={draft.e} onChange={(e) => upd({ e: +e.target.value })} className={field}>
              {TIMES.filter((m) => m > draft.s).map((m) => (
                <option key={m} value={m}>
                  {fmt(m)} ({dur(m - draft.s)})
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Địa điểm</span>
          <input
            list="schedule-rooms"
            value={draft.room}
            onChange={(e) => upd({ room: e.target.value, link: e.target.value === ONLINE_ROOM ? draft.link || genLink() : "" })}
            placeholder="vd. P.201 hoặc Online · Zoom"
            className={field}
          />
          <datalist id="schedule-rooms">
            {rooms.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </label>
        {online ? (
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Link Zoom</span>
            <div className="flex gap-2">
              <input value={draft.link} onChange={(e) => upd({ link: e.target.value })} placeholder="https://zoom.us/j/…" className={`${field} ${linkBad ? "!border-rose-300" : ""}`} />
              <button type="button" onClick={() => upd({ link: genLink() })} className={`${outlineBtn} shrink-0 !px-3 !text-xs`}>
                Tạo link
              </button>
            </div>
            {linkBad ? <span className="text-xs font-semibold text-rose-600">Nhập link bắt đầu bằng http(s)://</span> : null}
          </label>
        ) : null}
        <button type="button" onClick={() => upd({ repeat: !draft.repeat })} className="flex items-center gap-2.5 text-left text-sm font-bold text-slate-700">
          <span
            className="grid size-5 place-items-center rounded-md border-2 text-xs font-black text-white"
            style={{ background: draft.repeat ? "#2563eb" : "#fff", borderColor: draft.repeat ? "#2563eb" : "#cbd5e1" }}
          >
            {draft.repeat ? "✓" : ""}
          </span>
          Lặp lại hàng tuần ({REPEAT_WEEKS} tuần)
        </button>
        {conf.length ? <div className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13px] font-bold leading-snug text-rose-700">Trùng với: {conf.join(", ")}</div> : null}
        <div className="flex gap-2">
          <button type="button" disabled={noClass} onClick={() => onSave(autoTitle)} className={`${primaryBtn} flex-1 !rounded-xl !py-[11px]`}>
            {conf.length ? "Vẫn lưu" : "Lưu lịch"}
          </button>
          <button type="button" onClick={() => setDraft(() => null)} className={`${outlineBtn} !rounded-xl !px-4 !py-[11px]`}>
            Huỷ
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ---------------- copy a previous week ---------------- */
type CopyProps = {
  targetWeek: number;
  nowDay: number;
  mine: WeekEvent[];
  teacherId: string;
  onClose: () => void;
  colorsOf: (e: Pick<ScheduleEvent, "kind" | "category">) => { bg: string; fg: string; solid: string };
};

function CopyModal({ targetWeek, nowDay, mine, teacherId, onClose, colorsOf }: CopyProps) {
  const [from, setFrom] = useState(targetWeek - 1);
  const [off, setOff] = useState<Record<string, boolean>>({});
  const weekCount = (w: number) => mine.filter((e) => e.w === w).length;

  const target = mine.filter((e) => e.w === targetWeek);
  const items = mine
    .filter((e) => e.w === from)
    .sort((a, b) => a.d - b.d || a.s - b.s)
    .map((e) => {
      const dup = target.some((o) => o.title === e.title && o.d === e.d && o.s === e.s);
      const past = e.d < nowDay;
      const clash = !dup && !past && target.some((o) => o.d === e.d && o.s < e.e && e.s < o.e);
      return { e, dup, past, clash, on: !dup && !past && !off[e.id] };
    });
  const avail = items.filter((x) => !x.dup && !x.past);
  const selected = items.filter((x) => x.on);
  const targetDate = (d: number) => weekDaysOf(targetWeek)[d].date;

  const save = () => {
    if (!selected.length) return;
    const personal: ScheduleEvent[] = [];
    selected.forEach(({ e }, i) => {
      const date = targetDate(e.d);
      // Class sessions are copied through the classes store so the class and the calendar stay in sync.
      if (e.sessionId && e.classId && copySession(e.classId, e.sessionId, date)) return;
      personal.push({
        id: `${newEventId()}-${i}`,
        date,
        start: e.start,
        end: e.end,
        title: e.title,
        category: e.category,
        kind: e.kind,
        meta: e.meta,
        link: e.link,
        classId: e.classId,
        owner: "staff",
        teacherId,
        custom: true,
      });
    });
    if (personal.length) addEvents(personal);
    toast.success(`Đã sao chép ${selected.length} lịch vào tuần ${weekNoOf(targetWeek)}`);
    onClose();
  };

  return (
    <Modal
      isOpen
      title="Sao chép lịch từ tuần trước"
      onClose={onClose}
      widthClassName="max-w-xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Đã chọn {selected.length}/{avail.length} lịch{items.length > avail.length ? ` · ${items.length - avail.length} lịch đã có hoặc đã qua` : ""}
          </span>
          <div className="flex gap-2">
            <button type="button" className={outlineBtn} onClick={onClose}>
              Huỷ
            </button>
            <button type="button" className={primaryBtn} disabled={!selected.length} onClick={save}>
              {selected.length ? `Sao chép ${selected.length} lịch` : "Chưa chọn lịch nào"}
            </button>
          </div>
        </div>
      }
    >
      <p className="mb-3 text-[13px] text-slate-500">
        Vào tuần {weekNoOf(targetWeek)} ({weekRangeOf(targetWeek)}). Lịch trùng giờ vẫn được sao chép nhưng được đánh dấu.
      </p>
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => {
          const w = targetWeek - i;
          const on = from === w;
          return (
            <button
              key={w}
              type="button"
              onClick={() => {
                setFrom(w);
                setOff({});
              }}
              className={`rounded-xl px-2 py-2 text-left ${on ? "bg-slate-100 ring-2 ring-[#1f2937]" : "bg-white ring-1 ring-slate-200 hover:bg-slate-50"}`}
            >
              <span className="block text-[13px] font-extrabold text-slate-950">{i === 1 ? "Tuần trước" : `${i} tuần trước`}</span>
              <span className="block text-[11px] text-slate-500">
                {weekRangeOf(w)} · {weekCount(w)} lịch
              </span>
            </button>
          );
        })}
      </div>
      <div className="mb-1 flex justify-end">
        <button
          type="button"
          className="text-[13px] font-bold text-slate-600 underline underline-offset-4 hover:opacity-70"
          onClick={() => setOff(selected.length === avail.length ? Object.fromEntries(avail.map((x) => [x.e.id, true])) : {})}
        >
          {selected.length === avail.length && avail.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Tuần này không có lịch để sao chép.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200">
          {items.map((x, i) => {
            const c = colorsOf(x.e);
            const disabled = x.dup || x.past;
            const tag = x.dup
              ? ["Đã có", "#f1f5f9", "#64748b"]
              : x.past
                ? ["Đã qua", "#f1f5f9", "#64748b"]
                : x.clash
                  ? ["Trùng lịch", "#ffe4e6", "#be123c"]
                  : x.e.kind === "class"
                    ? ["Buổi học", "#eff6ff", "#1e40af"]
                    : ["Lịch riêng", "#f1f5f9", "#334155"];
            return (
              <button
                key={x.e.id}
                type="button"
                disabled={disabled}
                onClick={() => setOff((o) => ({ ...o, [x.e.id]: x.on }))}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${i ? "border-t border-slate-100" : ""} ${disabled ? "opacity-50" : "hover:bg-slate-50"}`}
              >
                <span className="grid size-5 shrink-0 place-items-center rounded-md border-2 text-xs font-black text-white" style={{ background: x.on ? "#1f2937" : "#fff", borderColor: x.on ? "#1f2937" : "#cbd5e1" }}>
                  {x.on ? "✓" : ""}
                </span>
                <span className="w-[72px] shrink-0 text-xs font-extrabold text-slate-700">
                  {weekDaysOf(targetWeek)[x.e.d].k} {targetDate(x.e.d).slice(8)}/{targetDate(x.e.d).slice(5, 7)}
                </span>
                <span className="size-2 shrink-0 rounded-full" style={{ background: c.solid }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-extrabold text-slate-950">{x.e.title}</span>
                  <span className="block truncate text-xs tabular-nums text-slate-500">
                    {fmt(x.e.s)}–{fmt(x.e.e)} · {x.e.meta}
                  </span>
                </span>
                <Tag bg={tag[1]} fg={tag[2]} width={84}>
                  {tag[0]}
                </Tag>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
