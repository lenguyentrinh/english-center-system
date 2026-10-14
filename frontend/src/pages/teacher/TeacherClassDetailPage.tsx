import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import TeacherLayout from "@/shared/components/layout/TeacherLayout";
import PageHeader, { outlineBtn, primaryBtn } from "@/shared/components/PageHeader";
import { useScheduleEvents } from "@/features/schedule/scheduleStore";
import { useClass } from "@/features/classes";
import { addDoc, addSession, avgAttendance } from "@/features/classes/store";
import { DocsTable, SessionsTable, StatStrip, StudentsTable, Tabs } from "@/features/classes/ClassParts";
import type { ClassItem, DocDraft, DocType, SessionDraft } from "@/features/classes/types";
import { DOC_STYLE, PERIODS, ROOMS, TEACHER_NAMES, dayLabel, fmtDM, fmtDuration, formatBytes, maxPeriods, periodRange, toMin, weekDates } from "@/features/classes/utils";

type Tab = "students" | "sessions" | "docs";

const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200";
const label = "mb-1 block text-xs font-bold text-slate-600";

export default function TeacherClassDetailPage() {
  const { id } = useParams();
  const cls = useClass(id);
  const [params, setParams] = useSearchParams();
  const rawTab = params.get("tab");
  const tab: Tab = rawTab === "sessions" || rawTab === "docs" ? rawTab : "students";

  return (
    <TeacherLayout>
      {!cls ? (
        <div>
          <Link to="/teacher/classes" className="text-[13px] font-semibold text-blue-600 hover:underline">
            ← Lớp học của tôi
          </Link>
          <p className="mt-6 text-sm text-slate-600">Không tìm thấy lớp học.</p>
        </div>
      ) : (
        <>
          <PageHeader
            crumb={
              <Link to="/teacher/classes" className="text-blue-600 hover:underline">
                ← Lớp học của tôi
              </Link>
            }
            title={cls.name}
          />
          <p className="-mt-3 mb-5 text-sm text-slate-600">
            {cls.code} · {TEACHER_NAMES[cls.teacherId] ?? "—"} · {cls.room} · {cls.scheduleText}
          </p>
          <Tabs
            tabs={[
              ["students", "Học viên"],
              ["sessions", "Buổi học"],
              ["docs", "Tài liệu"],
            ]}
            value={tab}
            onChange={(t) => setParams({ tab: t }, { replace: true })}
          />
          <StatStrip
            items={[
              ["Học viên", cls.students.length],
              ["Chuyên cần TB", avgAttendance(cls.students) === null ? "—" : `${String(avgAttendance(cls.students)).replace(".", ",")}%`],
              ["Tài liệu", cls.docs.length],
              ["Thời gian khoá", <span key="r" className="text-lg">{fmtDM(cls.startDate)} – {fmtDM(cls.endDate)}</span>],
            ]}
          />
          {tab === "students" ? <StudentsTable students={cls.students} resetKey={cls.id} /> : null}
          {tab === "sessions" ? <SessionsTab cls={cls} /> : null}
          {tab === "docs" ? <DocsTab cls={cls} /> : null}
        </>
      )}
    </TeacherLayout>
  );
}

function SessionsTab({ cls }: { cls: ClassItem }) {
  const [open, setOpen] = useState(false);
  const events = useScheduleEvents();
  const draft0: SessionDraft = { date: weekDates()[3], startPeriod: 11, periods: 3, room: cls.room, topic: "", docIds: [] };
  const [draft, setDraft] = useState<SessionDraft>(draft0);

  const set = <K extends keyof SessionDraft>(k: K, v: SessionDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const r = periodRange(draft.startPeriod, draft.periods);
  const conflicts = events.filter(
    (e) => e.teacherId === cls.teacherId && e.date === draft.date && toMin(e.start) < toMin(r.end) && toMin(r.start) < toMin(e.end),
  );
  const inWeek = cls.sessions.length;

  const toggleDoc = (docId: string) => set("docIds", draft.docIds.includes(docId) ? draft.docIds.filter((d) => d !== docId) : [...draft.docIds, docId]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSession(cls.id, draft);
    toast.success("Đã thêm buổi học và đẩy lên lịch");
    setOpen(false);
    setDraft(draft0);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">{inWeek} buổi trong tuần · tự hiện trên lịch</p>
        <button type="button" className={primaryBtn} onClick={() => setOpen((v) => !v)}>
          {open ? "Đóng form" : "+ Thêm buổi học"}
        </button>
      </div>

      {open ? (
        <form onSubmit={onSubmit} className="mb-5 rounded-3xl border border-slate-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className={label}>Ngày</label>
              <select className={input} value={draft.date} onChange={(e) => set("date", e.target.value)}>
                {weekDates().map((d) => (
                  <option key={d} value={d}>
                    {dayLabel(d)}
                  </option>
                ))}
              </select>
            </div>
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
              <label className={label}>Số tiết</label>
              <select className={input} value={draft.periods} onChange={(e) => set("periods", Number(e.target.value))}>
                {Array.from({ length: maxPeriods(draft.startPeriod) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} tiết
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Phòng</label>
              <select className={input} value={draft.room} onChange={(e) => set("room", e.target.value)}>
                {ROOMS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className={label}>Nội dung</label>
            <input className={input} value={draft.topic} onChange={(e) => set("topic", e.target.value)} placeholder="VD: Unit 7 · Reading" />
          </div>
          <div className="mt-4">
            <label className={label}>Tài liệu cần cho buổi này</label>
            {cls.docs.length === 0 ? (
              <p className="text-xs text-slate-500">Lớp chưa có tài liệu. Thêm ở tab Tài liệu.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {cls.docs.map((d) => {
                  const on = draft.docIds.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDoc(d.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${on ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                    >
                      {on ? "✓ " : ""}
                      {d.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            {dayLabel(draft.date)} · Tiết {draft.startPeriod}–{r.lastPeriod} · {r.start}–{r.end} · {fmtDuration(r.minutes)} · {draft.room}
          </p>
          {conflicts.length > 0 ? (
            <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              Trùng với: {conflicts.map((c) => `${c.title} ${c.start}–${c.end}`).join(", ")}
            </p>
          ) : null}
          <div className="mt-4 flex gap-2">
            <button type="submit" className={primaryBtn}>
              {conflicts.length > 0 ? "Vẫn thêm buổi" : "Thêm buổi"}
            </button>
            <button type="button" className={outlineBtn} onClick={() => setOpen(false)}>
              Huỷ
            </button>
          </div>
        </form>
      ) : null}

      <SessionsTable cls={cls} editable />
    </div>
  );
}

function DocsTab({ cls }: { cls: ClassItem }) {
  const [open, setOpen] = useState(false);
  const draft0: DocDraft = { type: "PDF", name: "", link: "", note: "", file: "", size: "" };
  const [draft, setDraft] = useState<DocDraft>(draft0);
  const [errors, setErrors] = useState<{ name?: string; src?: string }>({});
  const set = <K extends keyof DocDraft>(k: K, v: DocDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!draft.name.trim()) next.name = "Vui lòng nhập tên tài liệu";
    if (draft.type === "LINK") {
      if (!draft.link.trim()) next.src = "Vui lòng nhập đường dẫn";
    } else if (!draft.file) next.src = "Vui lòng chọn tệp";
    setErrors(next);
    if (Object.keys(next).length) return;
    addDoc(cls.id, draft);
    toast.success("Đã thêm tài liệu");
    setOpen(false);
    setDraft(draft0);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button type="button" className={primaryBtn} onClick={() => setOpen((v) => !v)}>
          {open ? "Đóng form" : "+ Thêm tài liệu"}
        </button>
      </div>

      {open ? (
        <form onSubmit={onSubmit} noValidate className="mb-5 rounded-3xl border border-slate-200 bg-white p-5">
          <label className={label}>Loại</label>
          <div className="mb-4 inline-flex rounded-full bg-slate-100 p-1">
            {(Object.keys(DOC_STYLE) as DocType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setDraft((d) => ({ ...d, type: t, file: "", size: "", link: "" }));
                  setErrors({});
                }}
                className={`rounded-full px-4 py-1 text-[13px] font-bold ${draft.type === t ? "bg-slate-950 text-white" : "text-slate-600"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={label}>Tên tài liệu</label>
              <input className={input} value={draft.name} onChange={(e) => set("name", e.target.value)} />
              {errors.name ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors.name}</p> : null}
            </div>
            <div>
              {draft.type === "LINK" ? (
                <>
                  <label className={label}>Đường dẫn</label>
                  <input className={input} value={draft.link} onChange={(e) => set("link", e.target.value)} placeholder="https://" />
                </>
              ) : (
                <>
                  <label className={label}>Tệp</label>
                  <input
                    type="file"
                    className={`${input} file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-xs file:font-bold`}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setDraft((d) => ({ ...d, file: f?.name ?? "", size: f ? formatBytes(f.size) : "", name: d.name || (f ? f.name.replace(/\.[^.]+$/, "") : "") }));
                    }}
                  />
                  {draft.file ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {draft.file} · {draft.size}
                    </p>
                  ) : null}
                </>
              )}
              {errors.src ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors.src}</p> : null}
            </div>
          </div>
          <div className="mt-4">
            <label className={label}>Ghi chú cho học viên</label>
            <input className={input} value={draft.note} onChange={(e) => set("note", e.target.value)} />
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className={primaryBtn}>
              Lưu tài liệu
            </button>
            <button type="button" className={outlineBtn} onClick={() => setOpen(false)}>
              Huỷ
            </button>
          </div>
        </form>
      ) : null}

      <DocsTable cls={cls} editable />
    </div>
  );
}
