import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import Drawer from "@/shared/components/Drawer";
import { CATEGORY_STYLE, MOCK_TEACHER } from "@/features/mock/common";
import { COURSE_OPTIONS, STUDENT_ROOMS, TEACHER_ROOMS } from "./mock";
import { addEvents, removeEvent, resetEvents, updateEvent, useScheduleEvents } from "./scheduleStore";
import { visibleEvents } from "./selectors";
import type { ScheduleEvent, ScheduleRole } from "./types";
import { H0, H1, NOW_DAY, NOW_MIN, PXM, TIMES, WEEK_DAYS, conflictMap, dayLabel, dur, fmt, freeWindows, layoutDay, toMinEvent } from "./utils";

type DType = "makeup" | "tutor" | "meet" | "personal" | "self";
const DTYPES: Record<DType, { label: string; teaching: boolean }> = {
  makeup: { label: "Dạy bù", teaching: true },
  tutor: { label: "Kèm 1-1", teaching: true },
  meet: { label: "Họp", teaching: false },
  personal: { label: "Việc riêng", teaching: false },
  self: { label: "Tự học", teaching: false },
};
type Draft = { d: number; s: number; e: number; type: DType; title: string; touched: boolean; course: string; room: string; repeat: boolean };
type Drag = { d: number; a: number; b: number };

type Props = { role: ScheduleRole; teacherId?: string; teacherName?: string; onBack?: () => void };

const CATS = Object.keys(CATEGORY_STYLE) as ScheduleEvent["category"][];
const field = "w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm font-bold text-slate-950";
const labelCls = "text-xs font-bold text-slate-600";

export default function WeekSchedule({ role, teacherId = MOCK_TEACHER.id, teacherName, onBack }: Props) {
  const all = useScheduleEvents();
  const isStudent = role === "student";
  const evs = useMemo(() => visibleEvents(all, role, teacherId).map(toMinEvent).filter((e) => e.d >= 0), [all, role, teacherId]);
  const conflicts = useMemo(() => conflictMap(evs), [evs]);

  const [selId, setSelId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [findDur, setFindDur] = useState(0);
  const dragRef = useRef<{ d: number; a: number; b: number; lo: number; moved: boolean; el: HTMLElement } | null>(null);
  const dragging = drag !== null;

  const newDraft = (d: number, s: number, e: number): Draft => ({
    d, s, e, type: isStudent ? "self" : "makeup", title: "", touched: false, course: COURSE_OPTIONS[0].name, room: isStudent ? STUDENT_ROOMS[0] : TEACHER_ROOMS[2], repeat: false,
  });
  const openDraft = (d: number, s: number, e: number) => {
    setSelId(null);
    setDraft(newDraft(d, s, e));
  };

  const startDrag = (d: number, e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || d < NOW_DAY) return;
    const el = e.currentTarget;
    const lo = d === NOW_DAY ? Math.ceil(NOW_MIN / 15) * 15 : H0;
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
      setDraft({
        d: r.d, s, e, type: isStudent ? "self" : "makeup", title: "", touched: false, course: COURSE_OPTIONS[0].name, room: isStudent ? STUDENT_ROOMS[0] : TEACHER_ROOMS[2], repeat: false,
      });
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [dragging, isStudent]);

  const cols = WEEK_DAYS.map((_, d) => {
    const dayEvs = evs.filter((e) => e.d === d);
    return { dayEvs, lay: layoutDay(dayEvs) };
  });
  const dayMins = cols.map((c) => c.dayEvs.reduce((a, e) => a + e.e - e.s, 0));
  const catMin: Record<string, number> = { IELTS: 0, TOEIC: 0, "Giao tiếp": 0, "Cá nhân": 0 };
  evs.forEach((e) => (catMin[e.category] += e.e - e.s));
  const totalMin = Object.values(catMin).reduce((a, b) => a + b, 0);

  const found: { d: number; a: number; b: number }[] = [];
  if (findDur) WEEK_DAYS.forEach((_, d) => freeWindows(evs, d).forEach(([a, b]) => b - a >= findDur && found.push({ d, a, b })));

  const create = () => {
    let pick: [number, number] | null = null;
    for (let d = NOW_DAY; d < 7 && !pick; d++) {
      const w = freeWindows(evs, d).find(([a, b]) => b - a >= 60 && a >= 480);
      if (w) pick = [d, w[0]];
    }
    const [pd, ps] = pick ?? [NOW_DAY + 1, 540];
    openDraft(pd, ps, Math.min(H1, ps + 90));
  };

  const sel = evs.find((e) => e.id === selId) ?? null;
  const title = role === "student" ? "Lịch học" : role === "admin" ? `Lịch · ${teacherName ?? ""}` : "Lịch tuần";

  const saveDraft = (autoTitle: string) => {
    if (!draft || draft.e <= draft.s) return;
    const teach = DTYPES[draft.type].teaching;
    const category = teach ? COURSE_OPTIONS.find((c) => c.name === draft.course)?.category ?? "Giao tiếp" : "Cá nhân";
    const id = `ev-${Date.now()}`;
    addEvents([
      {
        id,
        date: WEEK_DAYS[draft.d].date,
        start: fmt(draft.s),
        end: fmt(draft.e),
        title: (draft.touched && draft.title.trim()) || autoTitle,
        category,
        meta: draft.room + (teach ? ` · ${draft.course}` : "") + (draft.repeat ? " · lặp hàng tuần" : ""),
        owner: isStudent ? "student" : "staff",
        teacherId: isStudent ? undefined : teacherId,
        custom: true,
      },
    ]);
    setDraft(null);
    setSelId(id);
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          {onBack ? (
            <button type="button" onClick={onBack} className="self-start text-[13px] font-extrabold text-blue-600">
              ← Danh sách giáo viên
            </button>
          ) : null}
          <span className="text-[13px] font-semibold text-slate-500">Tuần 42 · 12 – 18 tháng 10, 2026</span>
          <h1 className="text-[30px] font-extrabold leading-tight">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3.5 text-[13px] font-bold text-slate-700">
          {CATS.map((c) => (
            <span key={c} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[3px]" style={{ background: CATEGORY_STYLE[c].solid }} />
              {c}
            </span>
          ))}
          <button type="button" onClick={create} className="rounded-full bg-slate-950 px-4 py-2 text-[13px] font-extrabold text-white hover:bg-slate-800">
            {isStudent ? "+ Thêm giờ tự học" : "+ Tạo lịch"}
          </button>
          <button
            type="button"
            onClick={() => {
              resetEvents();
              setSelId(null);
            }}
            className="rounded-full border border-slate-300 bg-white px-3.5 py-[7px] text-[13px] font-bold text-slate-700 hover:border-slate-400 hover:text-slate-950"
          >
            Khôi phục
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-start gap-5">
        <section className="min-w-0 flex-[999_1_680px] overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="max-h-[calc(100vh-230px)] overflow-auto">
            <div className="min-w-[720px]">
              <div className="sticky top-0 z-[6] grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b border-slate-200 bg-white">
                <div className="self-end py-3 text-center text-[10px] font-bold text-slate-400">GMT+7</div>
                {WEEK_DAYS.map((day, d) => (
                  <div key={day.k} className="flex flex-col items-center gap-1 border-l border-slate-100 px-1.5 py-3">
                    <span className="text-xs font-bold" style={{ color: d === NOW_DAY ? "#2563eb" : "#64748b" }}>
                      {day.k}
                    </span>
                    <span
                      className="grid size-8 place-items-center rounded-full text-[15px] font-extrabold"
                      style={{ background: d === NOW_DAY ? "#2563eb" : "transparent", color: d === NOW_DAY ? "#fff" : d < NOW_DAY ? "#94a3b8" : "#020617" }}
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
                  const past = d < NOW_DAY;
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
                        cursor: past ? "default" : "crosshair",
                      }}
                    >
                      {past || d === NOW_DAY ? (
                        <div
                          className="pointer-events-none absolute inset-x-0 top-0"
                          style={{
                            height: past ? "100%" : (NOW_MIN - H0) * PXM,
                            background: "repeating-linear-gradient(135deg, rgba(148,163,184,.08) 0 6px, transparent 6px 12px)",
                          }}
                        />
                      ) : null}
                      {findDur
                        ? freeWindows(evs, d)
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
                        const c = CATEGORY_STYLE[ev.category];
                        const ended = past || (d === NOW_DAY && ev.e <= NOW_MIN);
                        return (
                          <div
                            key={ev.id}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => setSelId(ev.id)}
                            className="absolute z-[2] flex cursor-pointer flex-col gap-px overflow-hidden rounded-[10px] px-2 py-[5px]"
                            style={{
                              top: (ev.s - H0) * PXM + 1,
                              height: Math.max(22, (ev.e - ev.s) * PXM - 3),
                              left: `calc(${(L.lane / L.n) * 100}% + 3px)`,
                              width: `calc(${100 / L.n}% - 6px)`,
                              background: c.bg,
                              color: c.text,
                              opacity: ended ? 0.5 : 1,
                              boxShadow: selId === ev.id ? "0 0 0 2px #020617" : "0 0 0 1px rgba(255,255,255,.9)",
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
                      {d === NOW_DAY ? (
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
          <div className="flex flex-wrap gap-x-[18px] gap-y-1.5 border-t border-slate-200 px-5 py-3 text-[13px] text-slate-500">
            <span>
              <b className="text-slate-700">Kéo chuột</b> trên ô trống để chọn khung giờ (bước 15 phút), rồi điền chi tiết ở bảng bên phải
            </span>
            <span>
              <b className="text-slate-700">Bấm</b> vào lịch để xem chi tiết
            </span>
          </div>
        </section>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5">
            <div>
              <h3 className="text-base font-extrabold">Tìm khung trống</h3>
              <span className="text-[13px] text-slate-500">Từ bây giờ đến hết tuần, trong khung 07:00–22:00</span>
            </div>
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
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
                      <span className="text-[13px] font-extrabold text-slate-950">{dayLabel(w.d).replace(", ", " ")}</span>
                      <span className="text-xs tabular-nums text-slate-500">
                        {fmt(w.a)} – {fmt(w.b)} · trống {dur(w.b - w.a)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openDraft(w.d, w.a, Math.min(H1, w.a + findDur))}
                      className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      Giữ chỗ
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3.5 rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-extrabold">Phân bổ tuần</h3>
              <span className="text-[13px] font-bold text-slate-700">{dur(totalMin)} / tuần</span>
            </div>
            <div className="flex flex-col gap-[9px]">
              {WEEK_DAYS.map((day, d) => {
                const m: Record<string, number> = { IELTS: 0, TOEIC: 0, "Giao tiếp": 0, "Cá nhân": 0 };
                cols[d].dayEvs.forEach((e) => (m[e.category] += e.e - e.s));
                return (
                  <div key={day.k} className="grid grid-cols-[28px_minmax(0,1fr)_44px] items-center gap-2.5">
                    <span className="text-xs font-extrabold text-slate-700">{day.k}</span>
                    <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-slate-100">
                      {CATS.filter((c) => m[c]).map((c) => (
                        <div key={c} className="h-full" style={{ width: `${(m[c] / (H1 - H0)) * 100}%`, background: CATEGORY_STYLE[c].solid }} />
                      ))}
                    </div>
                    <span className="text-right text-xs font-bold tabular-nums text-slate-500">{dayMins[d] ? dur(dayMins[d]) : "—"}</span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {CATS.map((c) => (
                <div key={c} className="rounded-[14px] px-3 py-2.5" style={{ background: CATEGORY_STYLE[c].bg, color: CATEGORY_STYLE[c].text }}>
                  <div className="text-lg font-black tabular-nums">{catMin[c] ? dur(catMin[c]) : "0"}</div>
                  <div className="text-xs font-bold">{c}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {draft ? <DraftDrawer draft={draft} setDraft={setDraft} evs={evs} isStudent={isStudent} onSave={saveDraft} /> : null}

      {sel && !draft ? (
        <Drawer title="Chi tiết lịch" onClose={() => setSelId(null)}>
          <div className="flex flex-col gap-3">
            <span className="self-start rounded-full px-2.5 py-[3px] text-xs font-extrabold" style={{ background: CATEGORY_STYLE[sel.category].bg, color: CATEGORY_STYLE[sel.category].text }}>
              {sel.category}
            </span>
            {sel.category === "Cá nhân" || sel.custom ? (
              <input
                value={sel.title}
                onChange={(e) => updateEvent(sel.id, { title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-lg font-extrabold text-slate-950"
              />
            ) : (
              <span className="text-lg font-extrabold text-slate-950">{sel.title}</span>
            )}
            <div className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1.5 text-sm">
              <span className="text-slate-500">Ngày</span>
              <span className="font-bold">{dayLabel(sel.d)}</span>
              <span className="text-slate-500">Giờ</span>
              <span className="font-bold tabular-nums">
                {fmt(sel.s)} – {fmt(sel.e)} · {dur(sel.e - sel.s)}
              </span>
              <span className="text-slate-500">Chi tiết</span>
              <span className="font-bold">{sel.meta || "—"}</span>
            </div>
            {conflicts[sel.id] ? <div className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13px] font-bold text-rose-700">Trùng với: {conflicts[sel.id].join(", ")}</div> : null}
            {sel.category === "Cá nhân" || sel.custom ? (
              <button
                type="button"
                onClick={() => {
                  removeEvent(sel.id);
                  setSelId(null);
                }}
                className="self-start rounded-full border border-rose-200 bg-white px-3.5 py-[7px] text-[13px] font-bold text-rose-600 hover:bg-rose-50"
              >
                Xoá lịch bận
              </button>
            ) : (
              <span className="text-xs text-slate-400">
                {isStudent ? "Lịch học của lớp, đồng bộ từ trung tâm." : "Lịch dạy đồng bộ từ khoá học, chỉnh trong Manage Course."}
              </span>
            )}
          </div>
        </Drawer>
      ) : null}
    </div>
  );
}

type DrawerProps = {
  draft: Draft;
  setDraft: (fn: (d: Draft | null) => Draft | null) => void;
  evs: ReturnType<typeof toMinEvent>[];
  isStudent: boolean;
  onSave: (autoTitle: string) => void;
};

function DraftDrawer({ draft, setDraft, evs, isStudent, onSave }: DrawerProps) {
  const upd = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const tp = DTYPES[draft.type];
  const short = draft.course.split(" ").slice(0, 2).join(" ");
  const autoTitle = { makeup: `Dạy bù · ${draft.course}`, tutor: `Kèm 1-1 · ${short}`, meet: "Họp chuyên môn", personal: "Việc riêng", self: "Tự học" }[draft.type];
  const conf = evs.filter((x) => x.d === draft.d && x.s < draft.e && draft.s < x.e).map((x) => `${x.title} (${fmt(x.s)}–${fmt(x.e)})`);
  const types: DType[] = isStudent ? ["self"] : ["makeup", "tutor", "meet", "personal"];
  const rooms = isStudent ? STUDENT_ROOMS : TEACHER_ROOMS;

  return (
    <Drawer title={isStudent ? "Thêm giờ tự học" : "Tạo lịch mới"} accent onClose={() => setDraft(() => null)}>
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-wrap gap-1.5">
          {types.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => upd({ type: k })}
              className={`rounded-full border px-3 py-1.5 text-[13px] font-extrabold ${draft.type === k ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"}`}
            >
              {DTYPES[k].label}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Tiêu đề</span>
          <input value={draft.touched ? draft.title : autoTitle} onChange={(e) => upd({ title: e.target.value, touched: true })} className={`${field} text-[15px] font-extrabold`} />
        </label>
        {tp.teaching ? (
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Khoá học</span>
            <select value={draft.course} onChange={(e) => upd({ course: e.target.value })} className={field}>
              {COURSE_OPTIONS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Ngày</span>
          <select value={draft.d} onChange={(e) => upd({ d: +e.target.value })} className={field}>
            {WEEK_DAYS.map((_, i) => (i >= NOW_DAY ? <option key={i} value={i}>{dayLabel(i)}</option> : null))}
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
          <select value={draft.room} onChange={(e) => upd({ room: e.target.value })} className={field}>
            {rooms.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => upd({ repeat: !draft.repeat })} className="flex items-center gap-2.5 text-left text-sm font-bold text-slate-700">
          <span
            className="grid size-5 place-items-center rounded-md border-2 text-xs font-black text-white"
            style={{ background: draft.repeat ? "#2563eb" : "#fff", borderColor: draft.repeat ? "#2563eb" : "#cbd5e1" }}
          >
            {draft.repeat ? "✓" : ""}
          </span>
          Lặp lại hàng tuần
        </button>
        {conf.length ? <div className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13px] font-bold leading-snug text-rose-700">Trùng với: {conf.join(", ")}</div> : null}
        <div className="flex gap-2">
          <button type="button" onClick={() => onSave(autoTitle)} className="flex-1 rounded-xl bg-slate-950 py-[11px] text-sm font-extrabold text-white hover:bg-slate-800">
            {conf.length ? "Vẫn lưu" : "Lưu lịch"}
          </button>
          <button type="button" onClick={() => setDraft(() => null)} className="rounded-xl border border-slate-200 bg-white px-4 py-[11px] text-sm font-extrabold text-slate-600">
            Huỷ
          </button>
        </div>
      </div>
    </Drawer>
  );
}
