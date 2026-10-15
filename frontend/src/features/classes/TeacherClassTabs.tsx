import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import Drawer from "@/shared/components/Drawer";
import Pagination from "@/shared/components/Pagination";
import { TableFrame, fieldClass, fieldErrClass, labelClass, outlineBtn, primaryBtn, rowClass, surfaceClass, tdClass, thClass } from "@/shared/components/PageHeader";
import Segmented from "@/shared/components/ui/Segmented";
import { Tag } from "@/shared/components/ui/Tag";
import { usePaged } from "@/shared/hooks/usePaged";
import { useAuth } from "@/features/auth/useAuth";
import { nowDate, nowTime, weekStartIso } from "@/shared/utils/now";
import { useDecks } from "@/features/flashcards/store";
import { useWordRushSets } from "@/features/wordRush/store";
import {
  addDoc, addHomework, addSession, attachDoc, detachDoc, findConflicts, removeDoc, removeHomework, removeSession,
  setAttendance, updateSessionTopic, useClasses,
} from "./store";
import { Avatar, DocActionButton, DocTypeChip } from "./ClassParts";
import type { ClassDoc, ClassItem, ClassSession, DocDraft, DocType, SessionDraft } from "./types";
import {
  DOC_STYLE, PERIODS, SESSION_STATE_LABEL, isOnlineRoom, roomSuggestions, addDays, attendanceOf, fmtDM, fmtDuration, formatBytes, maxPeriods, periodLabel, periodRange, sessionState,
  studentFlag, toMin, wasPresent, weekdayIndex,
} from "./utils";

const genLink = () => `https://zoom.us/j/8${Math.floor(1e9 + Math.random() * 9e9)}`;
const isUrl = (v: string) => /^https?:\/\//.test(v.trim());
const dayName = (iso: string) => {
  const i = weekdayIndex(iso);
  return `${["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"][i]} ${fmtDM(iso)}`;
};
const sortSessions = (list: ClassSession[]) => [...list].sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));

function ZoomLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-extrabold text-cyan-800 hover:opacity-70"
    >
      Vào Zoom
    </a>
  );
}

/* ============================== Học viên ============================== */
const FLAG_TAG = {
  "low-att": { label: "Vắng nhiều", bg: "#fff1f2", fg: "#be123c" },
  "low-fc": { label: "Chưa ôn bài", bg: "#fffbeb", fg: "#92400e" },
  ok: { label: "Ổn định", bg: "#ecfdf5", fg: "#065f46" },
} as const;
const DOT = { present: ["#10b981", "Có mặt"], absent: ["#f43f5e", "Vắng"], later: ["#e2e8f0", "Buổi tới"] } as const;

export function StudentsTab({ cls }: { cls: ClassItem }) {
  const [filter, setFilter] = useState<"all" | "warn">("all");

  const rows = useMemo(() => {
    const list = cls.students.map((s) => {
      const att = attendanceOf(cls, s);
      return { s, att, flag: studentFlag(att.pct, s.fc) };
    });
    return list.sort((a, b) => Number(!!b.flag) - Number(!!a.flag) || (a.att.pct ?? 101) - (b.att.pct ?? 101));
  }, [cls]);
  const warn = rows.filter((r) => r.flag).length;
  const shown = filter === "warn" ? rows.filter((r) => r.flag) : rows;
  const paged = usePaged(shown, `${cls.id}|${filter}`);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { key: "all", label: "Tất cả", count: rows.length },
              { key: "warn", label: "Cần chú ý", count: warn },
            ]}
          />
          <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
            {(["present", "absent", "later"] as const).map((k) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-[3px]" style={{ background: DOT[k][0] }} />
                {k === "later" ? "Chưa học" : DOT[k][1]}
              </span>
            ))}
          </div>
        </div>
        <span className="max-w-sm text-right text-xs font-semibold text-slate-500">Quản trị viên ghi danh học viên vào lớp (Admin → Lớp học).</span>
      </div>

      <TableFrame>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Học viên</th>
                <th className={thClass}>6 buổi gần nhất</th>
                <th className={thClass}>Chuyên cần</th>
                <th className={thClass}>Thuộc từ vựng</th>
                <th className={thClass}>Word Rush</th>
                <th className={thClass}>Tình trạng</th>
              </tr>
            </thead>
            <tbody>
              {paged.rows.map(({ s, att, flag }) => {
                const tag = FLAG_TAG[flag ?? "ok"];
                return (
                  <tr key={s.id} className={rowClass}>
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} />
                        <div className="flex min-w-0 flex-col leading-snug">
                          <span className="truncate font-extrabold text-slate-950">{s.name}</span>
                          <span className="text-xs text-slate-500">{s.last}</span>
                        </div>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <div className="flex gap-1">
                        {att.dots.map((d, i) => (
                          <span key={i} title={DOT[d][1]} className="size-4 rounded-[5px]" style={{ background: DOT[d][0] }} />
                        ))}
                        {att.dots.length === 0 ? <span className="text-xs text-slate-400">Chưa có buổi</span> : null}
                      </div>
                    </td>
                    <td className={`${tdClass} tabular-nums`}>
                      {att.pct === null ? (
                        <span className="text-xs text-slate-400">Chưa điểm danh</span>
                      ) : (
                        <>
                          <span className={`font-extrabold ${att.pct < 85 ? "text-rose-600" : "text-slate-950"}`}>{att.pct}%</span>
                          <span className="text-xs text-slate-500">
                            {" "}
                            · {att.present}/{att.total} buổi
                          </span>
                        </>
                      )}
                    </td>
                    <td className={tdClass}>
                      {s.fc === null ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-[70px] rounded-full bg-slate-100">
                            <div className="h-full rounded-full" style={{ width: `${s.fc}%`, background: s.fc < 55 ? "#f59e0b" : "#2563eb" }} />
                          </div>
                          <span className="text-[13px] font-bold tabular-nums text-slate-700">{s.fc}%</span>
                        </div>
                      )}
                    </td>
                    <td className={`${tdClass} tabular-nums`}>{s.rush === null ? "—" : s.rush.toLocaleString("vi-VN")}</td>
                    <td className={tdClass}>
                      <Tag bg={tag.bg} fg={tag.fg} width={108}>
                        {tag.label}
                      </Tag>
                    </td>
                  </tr>
                );
              })}
              {paged.rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    {filter === "warn" ? "Không có học viên nào cần chú ý." : "Lớp chưa có học viên. Quản trị viên sẽ ghi danh học viên vào lớp."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination page={paged.page} total={paged.total} pageSize={paged.pageSize} onChange={paged.setPage} />
      </TableFrame>

    </div>
  );
}

/* ============================== Buổi học ============================== */
export function SessionsTab({ cls }: { cls: ClassItem }) {
  const sorted = useMemo(() => sortSessions(cls.sessions), [cls.sessions]);
  const firstUpcoming = Math.max(0, sorted.findIndex((s) => sessionState(s) !== "done"));
  const [page, setPage] = useState(Math.floor(firstUpcoming / 10) + 1);
  const [selId, setSelId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const pages = Math.max(1, Math.ceil(sorted.length / 10));
  const current = Math.min(page, pages);
  const rows = sorted.slice((current - 1) * 10, current * 10);
  const weeks = new Set(sorted.map((s) => Math.floor((Date.parse(`${s.date}T00:00:00Z`) - Date.parse(`${weekStartIso(0)}T00:00:00Z`)) / (7 * 864e5)))).size;
  const sel = sorted.find((s) => s.id === selId) ?? null;
  const { decks, sets } = useHomeworkSources(cls.id);

  const hwText = (s: ClassSession) => {
    const n = (s.homework ?? []).length;
    return n ? `${n} bài` : "Chưa giao";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-600">
          {sorted.length} buổi · {weeks} tuần · tự hiện trên lịch dạy
        </span>
        <button type="button" className={primaryBtn} onClick={() => setAddOpen(true)}>
          + Thêm buổi học
        </button>
      </div>

      <TableFrame>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Buổi</th>
                <th className={thClass}>Thời gian</th>
                <th className={thClass}>Nội dung</th>
                <th className={thClass}>Điểm danh</th>
                <th className={thClass}>Tài liệu</th>
                <th className={thClass}>Bài tập</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const st = SESSION_STATE_LABEL[sessionState(s)];
                const started = sessionState(s) !== "upcoming";
                const present = started ? cls.students.filter((u) => wasPresent(s, u)).length : 0;
                return (
                  <tr key={s.id} onClick={() => setSelId(s.id)} className={`${rowClass} cursor-pointer hover:bg-slate-50 ${sessionState(s) === "done" ? "opacity-75" : ""}`}>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full" style={{ background: sessionState(s) === "done" ? "#cbd5e1" : sessionState(s) === "live" ? "#22d3ee" : "#3b82f6" }} />
                        <span className="font-extrabold text-slate-950">Buổi {s.no}</span>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <div className="flex flex-col gap-0.5 leading-snug">
                        <span className="font-bold text-slate-950">{dayName(s.date)}</span>
                        <span className="text-xs tabular-nums text-slate-500">
                          {s.start}–{s.end} · {s.room}
                        </span>
                        {s.link ? (
                          <span>
                            <ZoomLink href={s.link} />
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className={`${tdClass} max-w-[240px] truncate`}>{s.topic || <span className="text-slate-400">Chưa có nội dung</span>}</td>
                    <td className={tdClass}>
                      <span className={`text-[13px] font-bold tabular-nums ${!started ? "text-slate-400" : present / Math.max(1, cls.students.length) < 0.85 ? "text-rose-600" : "text-emerald-600"}`}>
                        {started && cls.students.length ? `${present}/${cls.students.length}` : "—"}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <Tag bg={s.docIds.length ? "#eff6ff" : "#f1f5f9"} fg={s.docIds.length ? "#1e40af" : "#94a3b8"}>
                        {s.docIds.length} tài liệu
                      </Tag>
                    </td>
                    <td className={tdClass}>
                      <Tag bg={(s.homework ?? []).length ? "#ecfeff" : "#f1f5f9"} fg={(s.homework ?? []).length ? "#155e75" : "#94a3b8"}>
                        {hwText(s)}
                      </Tag>
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-right`}>
                      <span className="mr-3 align-middle">
                        <Tag bg={st.bg} fg={st.text} width={84}>
                          {st.label}
                        </Tag>
                      </span>
                      <span className="font-extrabold text-slate-950 underline underline-offset-4">Chi tiết</span>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                    Chưa có buổi học nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination page={current} total={sorted.length} pageSize={10} onChange={setPage} />
      </TableFrame>

      {sel ? <SessionDetail key={sel.id} cls={cls} session={sel} decks={decks} sets={sets} onClose={() => setSelId(null)} /> : null}
      {addOpen ? <AddSessionDrawer cls={cls} onClose={() => setAddOpen(false)} /> : null}
    </div>
  );
}

type HwSource = { id: string; title: string; meta: string; done: number; total: number };

/** Decks and Word Rush sets of this class that can be given as homework. */
function useHomeworkSources(classId: string): { decks: HwSource[]; sets: HwSource[] } {
  const deckViews = useDecks();
  const setViews = useWordRushSets();
  return useMemo(
    () => ({
      decks: deckViews
        .filter((d) => d.classId === classId && d.source !== "SYSTEM")
        .map((d) => ({ id: d.id, title: d.title, meta: `Flashcard · ${d.cards.length} thẻ`, done: d.studentsDone, total: d.studentsTotal })),
      sets: setViews
        .filter((s) => s.classId === classId)
        .map((s) => ({ id: s.id, title: s.title, meta: `Word Rush · ${s.questions.length} câu`, done: s.studentsDone, total: s.studentsTotal })),
    }),
    [deckViews, setViews, classId],
  );
}

function SessionDetail({ cls, session: s, decks, sets, onClose }: { cls: ClassItem; session: ClassSession; decks: HwSource[]; sets: HwSource[]; onClose: () => void }) {
  const state = sessionState(s);
  const st = SESSION_STATE_LABEL[state];
  const started = state !== "upcoming";
  const [topic, setTopic] = useState(s.topic);
  const [confirmDel, setConfirmDel] = useState(false);

  const roll = cls.students.map((u) => ({ u, present: wasPresent(s, u) }));
  const presentN = roll.filter((r) => r.present).length;
  const docs = s.docIds.map((id) => cls.docs.find((d) => d.id === id)).filter((d): d is ClassDoc => !!d);
  const availableDocs = cls.docs.filter((d) => !s.docIds.includes(d.id));
  const hw = s.homework ?? [];
  const hwOptions = [
    ...decks.filter((d) => !hw.some((h) => h.kind === "deck" && h.id === d.id)).map((d) => ({ value: `deck:${d.id}`, label: `Flashcard · ${d.title}` })),
    ...sets.filter((d) => !hw.some((h) => h.kind === "set" && h.id === d.id)).map((d) => ({ value: `set:${d.id}`, label: `Word Rush · ${d.title}` })),
  ];

  return (
    <Drawer title={`Buổi ${s.no} · ${dayName(s.date)}`} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onBlur={() => topic !== s.topic && updateSessionTopic(cls.id, s.id, topic.trim() || s.topic)}
              aria-label="Nội dung buổi"
              className="min-w-0 flex-1 rounded-xl border border-transparent px-2 py-1 text-lg font-extrabold text-slate-950 outline-none hover:border-slate-200 focus:border-blue-600 focus:shadow-[0_0_0_4px_#dbeafe]"
            />
            <Tag bg={st.bg} fg={st.text} width={84}>
              {st.label}
            </Tag>
          </div>
          <span className="px-2 text-[13px] tabular-nums text-slate-500">
            {periodLabel(s.start, s.end)} · {s.start}–{s.end} · {s.room}
          </span>
          {s.link ? (
            <div className="px-2">
              <a href={s.link} target="_blank" rel="noreferrer" className={`${primaryBtn} !px-3 !py-1.5 !text-xs`}>
                Vào Zoom
              </a>
            </div>
          ) : null}
        </div>

        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h4 className="text-sm font-black">Điểm danh</h4>
            <span className="text-xs font-bold text-slate-500">{started ? `${presentN}/${roll.length} có mặt · ${roll.length - presentN} vắng` : "Chưa diễn ra"}</span>
          </div>
          {started ? (
            roll.length ? (
              <>
                <span className="text-xs text-slate-500">Bấm vào tên để đổi Có mặt / Vắng.</span>
                <div className="flex flex-wrap gap-1.5">
                  {roll.map(({ u, present }) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setAttendance(cls.id, s.id, u.id, !present)}
                      className="rounded-full px-2.5 py-1 text-xs font-bold"
                      style={{ background: present ? "#ecfdf5" : "#fff1f2", color: present ? "#065f46" : "#be123c" }}
                    >
                      {present ? "✓" : "✕"} {u.name.split(" ").slice(-2).join(" ")}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <span className="text-xs text-slate-500">Lớp chưa có học viên.</span>
            )
          ) : (
            <span className="text-xs text-slate-500">Điểm danh mở khi buổi học bắt đầu.</span>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <div>
            <h4 className="text-sm font-black">1 · Tài liệu trên lớp</h4>
            <span className="text-xs text-slate-500">Học viên mở được trước và trong buổi</span>
          </div>
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <DocTypeChip type={d.type} />
              <span className="min-w-0 flex-1 truncate text-[13px] font-bold">{d.name}</span>
              <button type="button" title="Bỏ" aria-label="Bỏ tài liệu" className="text-slate-400 hover:text-rose-600" onClick={() => detachDoc(cls.id, s.id, d.id)}>
                ×
              </button>
            </div>
          ))}
          {docs.length === 0 ? <span className="text-xs text-slate-400">Chưa có tài liệu</span> : null}
          {availableDocs.length ? (
            <select
              value=""
              aria-label="Thêm tài liệu của lớp"
              onChange={(e) => e.target.value && attachDoc(cls.id, s.id, e.target.value)}
              className={`${fieldClass} !text-[13px]`}
            >
              <option value="">+ Thêm tài liệu của lớp</option>
              {availableDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          ) : null}
        </section>

        <section className="flex flex-col gap-2">
          <div>
            <h4 className="text-sm font-black">2 · Bài tập sau buổi</h4>
            <span className="text-xs text-slate-500">{state === "done" ? "Theo dõi học viên đã làm" : "Tự mở cho học viên khi buổi kết thúc"}</span>
          </div>
          {hw.map((h) => {
            const src = (h.kind === "deck" ? decks : sets).find((x) => x.id === h.id);
            if (!src) return null;
            const pct = state === "done" && src.total ? Math.round((src.done / src.total) * 100) : 0;
            return (
              <div key={`${h.kind}:${h.id}`} className="flex flex-col gap-1.5 rounded-xl bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold">{src.title}</span>
                    <span className="block text-xs text-slate-500">{src.meta}</span>
                  </span>
                  <button type="button" title="Bỏ" aria-label="Bỏ bài tập" className="text-slate-400 hover:text-rose-600" onClick={() => removeHomework(cls.id, s.id, h)}>
                    ×
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-cyan-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums text-slate-500">{state === "done" ? `${src.done}/${src.total} đã làm` : "Mở sau buổi"}</span>
                </div>
              </div>
            );
          })}
          {hw.length === 0 ? <span className="text-xs text-slate-400">Chưa giao bài tập</span> : null}
          {hwOptions.length ? (
            <select
              value=""
              aria-label="Giao Flashcard hoặc Word Rush"
              onChange={(e) => {
                const [kind, id] = e.target.value.split(":");
                if (!id) return;
                addHomework(cls.id, s.id, { kind: kind as "deck" | "set", id });
                toast.success(`Đã giao bài tập cho ${cls.name}`);
              }}
              className={`${fieldClass} !text-[13px]`}
            >
              <option value="">+ Giao Flashcard / Word Rush</option>
              {hwOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-slate-400">Lớp chưa có bộ thẻ / bộ câu hỏi nào để giao.</span>
          )}
        </section>

        <button
          type="button"
          disabled={state === "done"}
          title={state === "done" ? "Buổi đã học không thể xoá" : undefined}
          onClick={() => setConfirmDel(true)}
          className="self-start rounded-full border border-rose-200 bg-white px-3.5 py-[7px] text-[13px] font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-40"
        >
          Xoá buổi học
        </button>
      </div>
      <ConfirmDialog
        isOpen={confirmDel}
        title={`Xoá Buổi ${s.no}?`}
        message="Sự kiện trên lịch dạy cũng bị xoá."
        confirmText="Xoá"
        cancelText="Huỷ"
        isDangerous
        onCancel={() => setConfirmDel(false)}
        onConfirm={() => {
          removeSession(cls.id, s.id);
          toast.success(`Đã xoá Buổi ${s.no}`);
          setConfirmDel(false);
          onClose();
        }}
      />
    </Drawer>
  );
}

function AddSessionDrawer({ cls, onClose }: { cls: ClassItem; onClose: () => void }) {
  const [draft, setDraft] = useState<SessionDraft>({ date: addDays(nowDate(), 1), startPeriod: cls.sessions[0]?.startPeriod ?? 11, periods: cls.sessions[0]?.periods ?? 3, room: cls.room, topic: "", docIds: [], link: cls.sessions.find((s) => s.link)?.link ?? "" });
  const [tried, setTried] = useState(false);
  const set = <K extends keyof SessionDraft>(k: K, v: SessionDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const r = periodRange(draft.startPeriod, draft.periods);
  const online = isOnlineRoom(draft.room);
  const rooms = roomSuggestions(useClasses());
  const nowHm = nowTime();
  const past = draft.date < nowDate() || (draft.date === nowDate() && toMin(r.start) <= toMin(nowHm));
  const clashes = findConflicts(cls.teacherId, [{ date: draft.date, start: r.start, end: r.end }]);
  const linkBad = online && !isUrl(draft.link);
  const outside = draft.date > cls.endDate && cls.status !== "OPEN";
  const err = past ? "Buổi học phải bắt đầu sau thời điểm hiện tại." : linkBad ? "Nhập link Zoom bắt đầu bằng http(s)://" : outside ? "Ngày học nằm sau ngày kết thúc khoá." : "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (err) return;
    addSession(cls.id, draft);
    toast.success("Đã thêm buổi học và đẩy lên lịch");
    onClose();
  };

  return (
    <Drawer title="Thêm buổi học" onClose={onClose} accent>
      <form onSubmit={submit} noValidate className="flex flex-col gap-3.5">
        <p className="-mt-2 text-[13px] text-slate-500">{cls.name}</p>
        <label className="block">
          <span className={labelClass}>Nội dung buổi</span>
          <input className={fieldClass} value={draft.topic} onChange={(e) => set("topic", e.target.value)} placeholder="vd. Unit 7 · Speaking Part 2" />
        </label>
        <label className="block">
          <span className={labelClass}>Ngày</span>
          <input type="date" className={fieldClass} min={nowDate()} value={draft.date} onChange={(e) => set("date", e.target.value || draft.date)} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Tiết bắt đầu</span>
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
          </label>
          <label className="block">
            <span className={labelClass}>Số tiết</span>
            <select className={fieldClass} value={draft.periods} onChange={(e) => set("periods", Number(e.target.value))}>
              {Array.from({ length: maxPeriods(draft.startPeriod) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} tiết
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className={labelClass}>Phòng</span>
          <input
            list="session-rooms"
            className={fieldClass}
            value={draft.room}
            placeholder="vd. P.201 hoặc Online · Zoom"
            onChange={(e) => setDraft((d) => ({ ...d, room: e.target.value, link: isOnlineRoom(e.target.value) ? d.link || genLink() : "" }))}
          />
          <datalist id="session-rooms">
            {rooms.map((x) => (
              <option key={x} value={x} />
            ))}
          </datalist>
        </label>
        {online ? (
          <div>
            <span className={labelClass}>Link Zoom</span>
            <div className="flex gap-2">
              <input className={`${fieldClass} ${tried && linkBad ? fieldErrClass : ""}`} value={draft.link} onChange={(e) => set("link", e.target.value)} placeholder="https://zoom.us/j/…" aria-label="Link Zoom" />
              <button type="button" className={`${outlineBtn} shrink-0 !px-3 !text-xs`} onClick={() => set("link", genLink())}>
                Tạo link
              </button>
            </div>
          </div>
        ) : null}
        {cls.docs.length ? (
          <div>
            <span className={labelClass}>Tài liệu cần cho buổi này</span>
            <div className="flex flex-wrap gap-1.5">
              {cls.docs.map((d) => {
                const on = draft.docIds.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => set("docIds", on ? draft.docIds.filter((x) => x !== d.id) : [...draft.docIds, d.id])}
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${on ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}
                  >
                    {on ? "✓ " : ""}
                    {d.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-[13px] font-semibold text-slate-700">
          {dayName(draft.date)} · Tiết {draft.startPeriod}–{r.lastPeriod} · {r.start}–{r.end} · {fmtDuration(r.minutes)} · {draft.room}
        </p>
        {clashes.length ? <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13px] font-bold text-rose-700">Trùng với: {clashes.join(", ")}</p> : null}
        {tried && err ? <p className="text-xs font-semibold text-rose-600">{err}</p> : null}
        <div className="flex gap-2 pt-1">
          <button type="submit" className={`${primaryBtn} flex-1 !rounded-xl !py-[11px]`}>
            {clashes.length ? "Vẫn thêm buổi" : "Thêm buổi"}
          </button>
          <button type="button" className={`${outlineBtn} !rounded-xl !px-4 !py-[11px]`} onClick={onClose}>
            Huỷ
          </button>
        </div>
      </form>
    </Drawer>
  );
}

/* ============================== Tài liệu ============================== */
export function DocsTab({ cls }: { cls: ClassItem }) {
  const { user } = useAuth();
  const draft0: DocDraft = { type: "PDF", name: "", link: "", note: "", file: "", size: "" };
  const [draft, setDraft] = useState<DocDraft>(draft0);
  const [errors, setErrors] = useState<{ name?: string; src?: string }>({});
  const [toDelete, setToDelete] = useState<ClassDoc | null>(null);
  const paged = usePaged(cls.docs, cls.id);
  const set = <K extends keyof DocDraft>(k: K, v: DocDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!draft.name.trim()) next.name = "Nhập tên tài liệu.";
    if (draft.type === "LINK") {
      if (!isUrl(draft.link)) next.src = "Nhập đường dẫn bắt đầu bằng http(s)://";
    } else if (!draft.file) next.src = "Chọn tệp để tải lên.";
    setErrors(next);
    if (Object.keys(next).length) return;
    addDoc(cls.id, draft, user?.fullName || user?.username || "Giáo viên");
    toast.success("Đã thêm tài liệu");
    setDraft(draft0);
  };

  const usedIn = (d: ClassDoc) => sortSessions(cls.sessions.filter((s) => s.docIds.includes(d.id)));

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} noValidate className={`${surfaceClass} flex flex-col gap-3 p-4`}>
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            value={draft.type}
            onChange={(t: DocType) => {
              setDraft((d) => ({ ...d, type: t, file: "", size: "", link: "" }));
              setErrors({});
            }}
            options={(Object.keys(DOC_STYLE) as DocType[]).map((t) => ({ key: t, label: t }))}
          />
          <input
            className={`${fieldClass} min-w-[220px] flex-1 ${errors.name ? fieldErrClass : ""}`}
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Tên tài liệu, vd. Unit 7 · Vocabulary"
            aria-label="Tên tài liệu"
          />
        </div>
        <div className="flex flex-wrap items-start gap-3">
          {draft.type === "LINK" ? (
            <input className={`${fieldClass} min-w-[220px] flex-1 ${errors.src ? fieldErrClass : ""}`} value={draft.link} onChange={(e) => set("link", e.target.value)} placeholder="https://" aria-label="Đường dẫn" />
          ) : (
            <div className="min-w-[220px] flex-1">
              <input
                type="file"
                className={`${fieldClass} file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-xs file:font-bold`}
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
            </div>
          )}
          <input className={`${fieldClass} min-w-[220px] flex-1`} value={draft.note} onChange={(e) => set("note", e.target.value)} placeholder="Ghi chú cho học viên (tuỳ chọn)" aria-label="Ghi chú" />
          <button type="submit" className={primaryBtn}>
            Thêm tài liệu
          </button>
        </div>
        {errors.name || errors.src ? <p className="text-xs font-semibold text-rose-600">{errors.name ?? errors.src}</p> : null}
      </form>

      <TableFrame>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Tài liệu</th>
                <th className={thClass}>Loại</th>
                <th className={thClass}>Dùng ở buổi</th>
                <th className={thClass}>Ngày đăng</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {paged.rows.map((d) => {
                const used = usedIn(d);
                return (
                  <tr key={d.id} className={rowClass}>
                    <td className={tdClass}>
                      <p className="font-extrabold text-slate-950">{d.name}</p>
                      {d.note ? <p className="text-xs text-slate-500">{d.note}</p> : null}
                    </td>
                    <td className={tdClass}>
                      <DocTypeChip type={d.type} />
                    </td>
                    <td className={tdClass}>
                      <div className="flex max-w-[260px] flex-wrap gap-1">
                        {used.slice(0, 4).map((s) => (
                          <span key={s.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                            Buổi {s.no}
                          </span>
                        ))}
                        {used.length > 4 ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">+{used.length - 4}</span> : null}
                        {used.length === 0 ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800">Chưa gắn</span> : null}
                      </div>
                    </td>
                    <td className={`${tdClass} tabular-nums text-slate-600`}>
                      {d.date} · {d.by}
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-right`}>
                      <span className="mr-2">
                        <DocActionButton doc={d} />
                      </span>
                      <button type="button" className="text-[13px] font-bold text-rose-600 hover:underline" onClick={() => setToDelete(d)}>
                        Xoá
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paged.rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                    Chưa có tài liệu nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination page={paged.page} total={paged.total} pageSize={paged.pageSize} onChange={paged.setPage} />
      </TableFrame>

      <ConfirmDialog
        isOpen={!!toDelete}
        title="Xoá tài liệu?"
        message={toDelete ? `“${toDelete.name}” cũng sẽ được gỡ khỏi các buổi đang dùng.` : ""}
        confirmText="Xoá"
        cancelText="Huỷ"
        isDangerous
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) removeDoc(cls.id, toDelete.id);
          toast.success("Đã xoá tài liệu");
          setToDelete(null);
        }}
      />
    </div>
  );
}
