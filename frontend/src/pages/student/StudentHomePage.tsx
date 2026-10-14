import { useMemo } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "@/shared/components/layout/StudentLayout.tsx";
import { useAuth } from "@/features/auth/useAuth.ts";
import { useStudentDecks } from "@/features/flashcards/store.ts";
import { useWRState, fmtDeadline } from "@/features/wordRush/store.ts";
import { useScheduleEvents } from "@/features/schedule/scheduleStore.ts";
import { STUDENT_CLASS_IDS } from "@/features/schedule/mock.ts";
import { visibleEvents } from "@/features/schedule/selectors.ts";
import { WEEK_DAYS, toMin, dur } from "@/features/schedule/utils.ts";
import { useClasses } from "@/features/classes";
import { avgAttendance } from "@/features/classes/store.ts";
import { CATEGORY_STYLE, MOCK_NOW, MOCK_STUDENT } from "@/features/mock/common.ts";
import { fmtPin } from "@/features/wordRush/constants.ts";

// Learning streak is not tracked by any API yet: mock the last 7 days (T2..CN), today = T3.
const STREAK = 12;
const STREAK_DAYS = [true, true, false, false, false, false, false];
const TODAY_IDX = 1;

type Task = {
  key: string;
  title: string;
  meta: string;
  chip: string;
  done: boolean;
  to: string;
  cta: string;
};

export default function StudentHomePage() {
  const { user } = useAuth();
  const firstName = (user?.fullName || MOCK_STUDENT.name).trim().split(/\s+/).pop() ?? MOCK_STUDENT.name;

  const wr = useWRState();
  const studentDecks = useStudentDecks();
  const events = useScheduleEvents();
  const classes = useClasses();

  const nowMin = toMin(MOCK_NOW.time);
  const myEvents = useMemo(() => visibleEvents(events, "student", ""), [events]);
  const myClasses = useMemo(() => classes.filter((c) => STUDENT_CLASS_IDS.includes(c.id)), [classes]);

  const tasks = useMemo<Task[]>(() => {
    const list: Task[] = [];
    if (wr.room) {
      list.push({
        key: "room",
        title: "Vào phòng Word Rush",
        meta: `${wr.room.teacherName} đang mở phòng · ${wr.room.title}`,
        chip: `PIN ${fmtPin(wr.room.pin)}`,
        done: false,
        to: "/student/word-rush",
        cta: "Vào phòng",
      });
    }
    const due = studentDecks.reduce((a, { progress }) => (progress.studiedToday ? a : a + progress.fresh + progress.learning + progress.review), 0);
    const allStudied = studentDecks.length > 0 && due === 0;
    if (studentDecks.length > 0) {
      list.push({
        key: "cards",
        title: allStudied ? "Ôn thẻ" : `Ôn ${due} thẻ đến hạn`,
        meta: `${studentDecks.length} bộ thẻ được giao`,
        chip: allStudied ? "Đã xong" : `~${Math.max(1, Math.round(due * 0.5))} phút`,
        done: allStudied,
        to: "/student/flashcards",
        cta: "Ôn thẻ",
      });
    }
    wr.sets
      .filter((s) => s.selfPaced && STUDENT_CLASS_IDS.includes(s.classId))
      .forEach((s) => {
        const res = wr.results[s.id];
        list.push({
          key: `wr-${s.id}`,
          title: s.title,
          meta: `${s.mode === "test" ? `Kiểm tra · ${s.testMin} phút` : "Kiểu game"} · ${s.questions.length} câu · hạn ${fmtDeadline(s.deadline)}`,
          chip: res ? `${res.correct}/${res.total} đúng` : s.mode === "test" ? `${s.testMin} phút` : "~5 phút",
          done: Boolean(res),
          to: "/student/word-rush",
          cta: res ? "Luyện lại" : s.mode === "test" ? "Làm bài" : "Bắt đầu",
        });
      });
    const todays = myEvents
      .filter((e) => e.date === MOCK_NOW.date && e.owner === "staff")
      .sort((a, b) => toMin(a.start) - toMin(b.start));
    todays.forEach((e) => {
      const ended = toMin(e.end) <= nowMin;
      const startsIn = toMin(e.start) - nowMin;
      list.push({
        key: `ev-${e.id}`,
        title: `Lên lớp · ${e.title}`,
        meta: `${e.start} – ${e.end}${e.meta ? ` · ${e.meta}` : ""}`,
        chip: ended ? "Đã xong" : startsIn > 0 ? `Sau ${dur(startsIn)}` : "Đang diễn ra",
        done: ended,
        to: "/student/schedule",
        cta: "Xem lịch",
      });
    });
    return list;
  }, [wr, studentDecks, myEvents, nowMin]);

  const doneCount = tasks.filter((t) => t.done).length;
  const remaining = tasks.length - doneCount;
  const minutes = remaining * 10;

  const cardsReviewed = studentDecks.reduce((a, { deck, progress }) => a + (progress.studiedToday ? deck.cards.length : deck.cards.length - progress.fresh), 0);
  const att = useMemo(() => {
    const vals = myClasses.map((c) => avgAttendance(c.students)).filter((v): v is number => v !== null);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  }, [myClasses]);
  const selfStudyMin = myEvents.filter((e) => e.owner === "student").reduce((a, e) => a + toMin(e.end) - toMin(e.start), 0);

  const className = myClasses[0]?.name ?? "";
  const stats = [
    { label: "Thẻ đã ôn", value: String(cardsReviewed) },
    { label: "Kỷ lục Word Rush", value: wr.best.score.toLocaleString("vi-VN") },
    { label: "Chuyên cần", value: att === null ? "—" : `${att}%` },
    { label: "Tự học tuần này", value: dur(selfStudyMin) },
  ];

  return (
    <StudentLayout>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-[13px] font-semibold text-slate-500">
            Thứ Ba, 13 tháng 10{className ? ` · ${className}` : ""}
          </p>
          <h1 className="text-[40px] font-black leading-tight">Chào {firstName}</h1>
          <p className="text-sm text-slate-600">
            Hôm nay còn <b>{remaining} việc</b> · khoảng {minutes} phút
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[40px] font-black tabular-nums text-cyan-600">{STREAK}</span>
            <span className="text-sm font-semibold text-slate-500">ngày học liên tiếp</span>
          </div>
          <div className="flex gap-1">
            {STREAK_DAYS.map((on, i) => (
              <span
                key={i}
                className="size-[22px] rounded-[7px]"
                style={{
                  background: on ? "#0891b2" : "#e2e8f0",
                  boxShadow: i === TODAY_IDX ? "0 0 0 2px #fff, 0 0 0 3.5px #06b6d4" : undefined,
                }}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-x-10 gap-y-8">
        <section className="min-w-0 flex-[999_1_480px]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[18px] font-extrabold">Kế hoạch hôm nay</h3>
            <span className="text-[13px] font-bold text-slate-500">
              {doneCount}/{tasks.length} đã xong
            </span>
          </div>
          <div className="mb-2 h-1 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-slate-950" style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }} />
          </div>
          <ul className="divide-y divide-slate-200">
            {tasks.length === 0 ? <li className="py-6 text-sm text-slate-500">Hôm nay chưa có việc nào.</li> : null}
            {tasks.map((t, i) => (
              <li key={t.key} className="grid grid-cols-[36px_1fr_auto] items-center gap-4 py-4">
                <span
                  className={`grid size-8 place-items-center rounded-full text-sm font-extrabold ${t.done ? "bg-emerald-100 text-slate-400" : "bg-slate-950 text-white"}`}
                >
                  {t.done ? "✓" : i + 1}
                </span>
                <div className={`min-w-0 ${t.done ? "opacity-60" : ""}`}>
                  <p className="truncate text-base font-extrabold">{t.title}</p>
                  <p className="truncate text-[13px] text-slate-500">{t.meta}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{t.chip}</span>
                  <Link to={t.to} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
                    {t.cta}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="min-w-0 flex-[1_1_300px]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[18px] font-extrabold">Tuần này</h3>
            <Link to="/student/schedule" className="text-[13px] font-bold text-blue-600 hover:underline">
              Mở lịch →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {WEEK_DAYS.map((d, i) => {
              const evs = myEvents.filter((e) => e.date === d.date).sort((a, b) => toMin(a.start) - toMin(b.start));
              return (
                <li key={d.date} className={`flex gap-3 py-2 ${i < TODAY_IDX ? "opacity-50" : ""}`}>
                  <div className="w-12 shrink-0">
                    <p className={`text-xs font-bold ${i === TODAY_IDX ? "text-blue-600" : "text-slate-500"}`}>{d.k}</p>
                    <p className="text-[11px] text-slate-400">{d.date.slice(8)}/10</p>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    {evs.length === 0 ? <p className="text-xs text-slate-300">—</p> : null}
                    {evs.map((e) => (
                      <p key={e.id} className="flex items-center gap-2 truncate text-[13px]">
                        <span className="size-1.5 shrink-0 rounded-full" style={{ background: CATEGORY_STYLE[e.category].solid }} />
                        <span className="font-bold tabular-nums text-slate-600">{e.start}</span>
                        <span className="truncate text-slate-800">{e.title}</span>
                      </p>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>

      <div className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border-t-2 border-slate-950 pt-3">
            <p className="text-[13px] font-semibold text-slate-500">{s.label}</p>
            <p className="text-[30px] font-extrabold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>
    </StudentLayout>
  );
}
