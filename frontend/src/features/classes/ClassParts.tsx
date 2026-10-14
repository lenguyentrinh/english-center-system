import type { ReactNode } from "react";
import { toast } from "react-toastify";
import Pagination from "@/shared/components/Pagination";
import { TableFrame, outlineBtn, tdClass, thClass } from "@/shared/components/PageHeader";
import { usePaged } from "@/shared/hooks/usePaged";
import { MOCK_STUDENT } from "@/features/mock/common";
import { attachDoc, detachDoc, removeDoc, removeSession } from "./store";
import type { ClassDoc, ClassItem, ClassSession, ClassStatus, ClassStudent, DocType } from "./types";
import { DOC_STYLE, SESSION_STATE_LABEL, STATUS_STYLE, TEACHER_NAMES, dayLabel, initials, sessionState } from "./utils";

export function StatusPill({ status }: { status: ClassStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: s.bg, color: s.text }}>
      {status}
    </span>
  );
}

export function DocTypeChip({ type }: { type: DocType }) {
  const s = DOC_STYLE[type];
  return (
    <span className="rounded-full px-2.5 py-1 text-[11px] font-extrabold" style={{ background: s.bg, color: s.text }}>
      {type}
    </span>
  );
}

export function AttBar({ value, width = 70 }: { value: number | null; width?: number }) {
  if (value === null) return <span className="text-slate-400">—</span>;
  const low = value < 85;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 rounded-full bg-slate-100" style={{ width }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: low ? "#f43f5e" : "#10b981" }} />
      </div>
      <span className={`text-[13px] font-bold tabular-nums ${low ? "text-rose-600" : "text-slate-700"}`}>{String(value).replace(".", ",")}%</span>
    </div>
  );
}

export function Avatar({ name, tone = "cyan" }: { name: string; tone?: "cyan" | "blue" }) {
  const style = tone === "cyan" ? { background: "#ecfeff", color: "#155e75" } : { background: "#dbeafe", color: "#1e40af" };
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold" style={style}>
      {initials(name)}
    </span>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: Array<[T, string]>; value: T; onChange: (v: T) => void }) {
  return (
    <div className="mb-5 inline-flex rounded-full bg-slate-100 p-1">
      {tabs.map(([k, label]) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          className={`rounded-full px-4 py-1.5 text-sm font-bold ${value === k ? "bg-slate-950 text-white" : "text-slate-600 hover:text-slate-950"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function StatStrip({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="border-t-2 border-slate-950 pt-3">
          <p className="text-[13px] font-semibold text-slate-500">{label}</p>
          <p className="text-[26px] font-black tabular-nums leading-tight text-slate-950">{value}</p>
        </div>
      ))}
    </div>
  );
}

export function DocActionButton({ doc }: { doc: ClassDoc }) {
  const label = DOC_STYLE[doc.type].action;
  if (doc.type === "LINK" && doc.url) {
    return (
      <a href={doc.url} target="_blank" rel="noreferrer" className={`${outlineBtn} !px-3 !py-1 !text-xs`}>
        {label}
      </a>
    );
  }
  return (
    <button type="button" className={`${outlineBtn} !px-3 !py-1 !text-xs`} onClick={() => toast.info(`${label}: ${doc.name} (bản demo)`)}>
      {label}
    </button>
  );
}

/** Sessions table. `editable` (teacher) adds attach/detach docs and delete. */
export function SessionsTable({ cls, editable }: { cls: ClassItem; editable: boolean }) {
  const sorted = [...cls.sessions].sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
  const paged = usePaged(sorted, cls.id);
  const docById = (id: string) => cls.docs.find((d) => d.id === id);

  const onDelete = (s: ClassSession) => {
    if (!window.confirm(`Xoá Buổi ${s.no}? Sự kiện trên lịch cũng bị xoá.`)) return;
    removeSession(cls.id, s.id);
    toast.success(`Đã xoá Buổi ${s.no}`);
  };

  return (
    <TableFrame>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className={thClass}>Buổi</th>
              <th className={thClass}>Ngày</th>
              <th className={thClass}>Tiết</th>
              <th className={thClass}>Giờ</th>
              <th className={thClass}>Phòng</th>
              <th className={thClass}>Nội dung</th>
              <th className={thClass}>Trạng thái</th>
              {editable ? <th className={thClass} /> : null}
            </tr>
          </thead>
          <tbody>
            {paged.rows.map((s) => {
              const st = SESSION_STATE_LABEL[sessionState(s)];
              const attached = s.docIds.map(docById).filter((d): d is ClassDoc => !!d);
              const available = cls.docs.filter((d) => !s.docIds.includes(d.id));
              return (
                <tr key={s.id} className="border-b border-slate-100 align-top last:border-0">
                  <td className={`${tdClass} font-extrabold`}>Buổi {s.no}</td>
                  <td className={`${tdClass} tabular-nums`}>{dayLabel(s.date)}</td>
                  <td className={`${tdClass} tabular-nums`}>
                    Tiết {s.startPeriod}–{s.startPeriod + s.periods - 1}
                  </td>
                  <td className={`${tdClass} tabular-nums`}>
                    {s.start}–{s.end}
                  </td>
                  <td className={tdClass}>{s.room}</td>
                  <td className={tdClass}>
                    <p className="font-semibold text-slate-950">{s.topic || <span className="text-slate-400">Chưa có nội dung</span>}</p>
                    {attached.length > 0 || editable ? (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {attached.map((d) => (
                          <span key={d.id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-0.5 pl-1 pr-2 text-xs font-semibold text-slate-700">
                            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-extrabold" style={{ background: DOC_STYLE[d.type].bg, color: DOC_STYLE[d.type].text }}>
                              {d.type}
                            </span>
                            {d.name}
                            {editable ? (
                              <button type="button" aria-label="Bỏ tài liệu" className="text-slate-400 hover:text-rose-600" onClick={() => detachDoc(cls.id, s.id, d.id)}>
                                ×
                              </button>
                            ) : null}
                          </span>
                        ))}
                        {editable ? (
                          <select
                            aria-label="Gắn tài liệu"
                            value=""
                            disabled={available.length === 0}
                            onChange={(e) => e.target.value && attachDoc(cls.id, s.id, e.target.value)}
                            className="rounded-full border border-dashed border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 disabled:opacity-50"
                          >
                            <option value="">+ Gắn tài liệu</option>
                            {available.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </div>
                    ) : null}
                  </td>
                  <td className={tdClass}>
                    <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: st.bg, color: st.text }}>
                      {st.label}
                    </span>
                  </td>
                  {editable ? (
                    <td className={tdClass}>
                      <button type="button" className="text-[13px] font-bold text-rose-600 hover:underline" onClick={() => onDelete(s)}>
                        Xoá
                      </button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
            {paged.rows.length === 0 ? (
              <tr>
                <td colSpan={editable ? 8 : 7} className="px-5 py-10 text-center text-sm text-slate-500">
                  Chưa có buổi học nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Pagination page={paged.page} total={paged.total} pageSize={paged.pageSize} onChange={paged.setPage} />
    </TableFrame>
  );
}

export function DocsTable({ cls, editable }: { cls: ClassItem; editable: boolean }) {
  const paged = usePaged(cls.docs, cls.id);
  return (
    <TableFrame>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className={thClass}>Tài liệu</th>
              <th className={thClass}>Loại</th>
              <th className={thClass}>Dung lượng</th>
              <th className={thClass}>Đăng bởi</th>
              <th className={thClass} />
              {editable ? <th className={thClass} /> : null}
            </tr>
          </thead>
          <tbody>
            {paged.rows.map((d) => (
              <tr key={d.id} className="border-b border-slate-100 last:border-0">
                <td className={tdClass}>
                  <p className="font-bold text-slate-950">{d.name}</p>
                  {d.note ? <p className="text-xs text-slate-500">{d.note}</p> : null}
                </td>
                <td className={tdClass}>
                  <DocTypeChip type={d.type} />
                </td>
                <td className={`${tdClass} tabular-nums`}>{d.size}</td>
                <td className={tdClass}>
                  {d.by} · <span className="tabular-nums text-slate-500">{d.date}</span>
                </td>
                <td className={tdClass}>
                  <DocActionButton doc={d} />
                </td>
                {editable ? (
                  <td className={tdClass}>
                    <button
                      type="button"
                      className="text-[13px] font-bold text-rose-600 hover:underline"
                      onClick={() => {
                        if (!window.confirm(`Xoá tài liệu "${d.name}"?`)) return;
                        removeDoc(cls.id, d.id);
                        toast.success("Đã xoá tài liệu");
                      }}
                    >
                      Xoá
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
            {paged.rows.length === 0 ? (
              <tr>
                <td colSpan={editable ? 6 : 5} className="px-5 py-10 text-center text-sm text-slate-500">
                  Chưa có tài liệu nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Pagination page={paged.page} total={paged.total} pageSize={paged.pageSize} onChange={paged.setPage} />
    </TableFrame>
  );
}

export function StudentsTable({ students, resetKey }: { students: ClassStudent[]; resetKey: string }) {
  const paged = usePaged(students, resetKey);
  return (
    <TableFrame>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className={thClass}>Học viên</th>
              <th className={thClass}>Liên hệ</th>
              <th className={thClass}>Chuyên cần</th>
              <th className={thClass}>Flashcard</th>
              <th className={thClass}>Word Rush</th>
              <th className={thClass}>Hoạt động gần nhất</th>
            </tr>
          </thead>
          <tbody>
            {paged.rows.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 last:border-0">
                <td className={tdClass}>
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} />
                    <span className="font-bold text-slate-950">{s.name}</span>
                  </div>
                </td>
                <td className={tdClass}>
                  <p>{s.email}</p>
                  <p className="text-xs text-slate-500">{s.phone}</p>
                </td>
                <td className={tdClass}>
                  <AttBar value={s.att} />
                </td>
                <td className={`${tdClass} tabular-nums`}>{s.fc}% thẻ đã thuộc</td>
                <td className={`${tdClass} tabular-nums`}>{s.rush.toLocaleString("vi-VN")} điểm</td>
                <td className={`${tdClass} text-slate-600`}>{s.last}</td>
              </tr>
            ))}
            {paged.rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                  Lớp chưa có học viên.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Pagination page={paged.page} total={paged.total} pageSize={paged.pageSize} onChange={paged.setPage} />
    </TableFrame>
  );
}

type Mate = { key: string; name: string; role: "Giáo viên" | "Học viên"; email: string; me: boolean };

export function MatesTable({ cls }: { cls: ClassItem }) {
  const rows: Mate[] = [
    { key: "teacher", name: TEACHER_NAMES[cls.teacherId] ?? "Giáo viên", role: "Giáo viên", email: "", me: false },
    ...cls.students.map((s) => ({ key: s.id, name: s.name, role: "Học viên" as const, email: s.email, me: s.id === MOCK_STUDENT.id })),
  ];
  const paged = usePaged(rows, cls.id);
  return (
    <TableFrame>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className={thClass}>Thành viên</th>
            <th className={thClass}>Vai trò</th>
            <th className={thClass}>Email</th>
          </tr>
        </thead>
        <tbody>
          {paged.rows.map((m) => (
            <tr key={m.key} className="border-b border-slate-100 last:border-0">
              <td className={tdClass}>
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} tone={m.role === "Giáo viên" ? "blue" : "cyan"} />
                  <span className="font-bold text-slate-950">
                    {m.name}
                    {m.me ? <span className="ml-1 font-semibold text-slate-500">(bạn)</span> : null}
                  </span>
                </div>
              </td>
              <td className={tdClass}>{m.role}</td>
              <td className={`${tdClass} text-slate-600`}>{m.email || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={paged.page} total={paged.total} pageSize={paged.pageSize} onChange={paged.setPage} />
    </TableFrame>
  );
}
