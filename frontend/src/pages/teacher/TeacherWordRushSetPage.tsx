import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import TeacherLayout from "@/shared/components/layout/TeacherLayout.tsx";
import Modal from "@/shared/components/Modal.tsx";
import { BackLink, TableFrame, fieldClass, labelClass, outlineBtn, primaryBtn, tdClass, thClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { useAuth } from "@/features/auth/useAuth.ts";
import { categoryColors, useCategories } from "@/features/categories/useCategories.ts";
import { useAllCourses, useTeacherCourses } from "@/features/flashcards/useCourses.ts";
import { addQuestion, buildReport, deleteQuestion, isValidQuestion, roomActions, updateQuestion, updateSet, useWRSet, useWRState } from "@/features/wordRush/store.ts";
import { LETTERS } from "@/features/wordRush/constants.ts";
import { DesignSentence, SentenceWithAnswer, StatStrip, Tabs } from "@/features/wordRush/ui.tsx";
import type { WRQuestion, WRSet } from "@/features/wordRush/types.ts";

const labelCls = labelClass;
/** Design v5 editor inputs: 1.5px #e2e8f0 border on #f8fafc, blue border + white on focus. */
const editField = "w-full rounded-xl border-[1.5px] border-slate-200 bg-[#f8fafc] text-slate-950 outline-none focus:border-blue-600 focus:bg-white";

function QuestionCard({ setId, x, index, open, canDelete, onToggle }: { setId: string; x: WRQuestion; index: number; open: boolean; canDelete: boolean; onToggle: () => void }) {
  const valid = isValidQuestion(x);
  return (
    <article className="overflow-hidden rounded-[20px] bg-white" style={{ boxShadow: open ? "0 0 0 1.5px #93c5fd" : "0 0 0 1px #eef2f6" }}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full flex-wrap items-start gap-x-3.5 gap-y-2.5 px-[clamp(12px,2.4vw,18px)] py-4 text-left hover:bg-[rgba(15,23,42,.06)]">
        <span className={`grid size-[30px] shrink-0 place-items-center rounded-[10px] text-[13px] font-black ${open ? "bg-[#2563eb] text-white" : "bg-[#f1f5f9] text-[#475569]"}`}>{index + 1}</span>
        <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-2">
          <span className="text-base font-extrabold leading-[1.5] text-slate-950 [overflow-wrap:anywhere]">
            <DesignSentence text={x.sentence} answer={x.options[x.answer]} />
          </span>
          <div className="flex flex-wrap gap-1.5">
            {x.options.map((o, i) => (
              <span key={i} className="rounded-full px-2.5 py-[3px] text-xs font-extrabold" style={{ background: i === x.answer ? "#ecfdf5" : "#f8fafc", color: i === x.answer ? "#065f46" : "#475569" }}>
                {LETTERS[i]} · {o || "—"}
              </span>
            ))}
          </div>
        </div>
        {!valid ? <span className="rounded-full bg-[#ffe4e6] px-[9px] py-[3px] text-[11px] font-extrabold text-[#be123c]">Chưa hợp lệ</span> : null}
      </button>
      {open ? (
        <div className="flex flex-col gap-3 border-t border-dashed border-slate-200 pb-[18px] pl-[clamp(12px,5vw,62px)] pr-[clamp(12px,2.4vw,18px)] pt-1">
          <label className="mt-3 flex flex-col gap-[5px]">
            <span className="text-xs font-bold text-slate-600">Câu hỏi · dùng ___ cho chỗ trống</span>
            <textarea
              className={`${editField} resize-y px-3 py-2.5 text-base font-extrabold leading-[1.45]`}
              rows={2}
              value={x.sentence}
              onChange={(e) => updateQuestion(setId, x.id, { sentence: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-2">
            {x.options.map((o, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl py-[5px] pl-2 pr-[5px]"
                style={{ boxShadow: `0 0 0 1.5px ${i === x.answer ? "#a7f3d0" : "#e2e8f0"}`, background: i === x.answer ? "#f0fdf4" : "#fff" }}
              >
                <button
                  type="button"
                  title="Đáp án đúng"
                  aria-label={`Chọn ${LETTERS[i]} là đáp án đúng`}
                  onClick={() => updateQuestion(setId, x.id, { answer: i })}
                  className="grid size-6 shrink-0 place-items-center rounded-full border-2 p-0 text-xs font-black text-white hover:brightness-95"
                  style={{ background: i === x.answer ? "#10b981" : "#fff", borderColor: i === x.answer ? "#10b981" : "#cbd5e1" }}
                >
                  {i === x.answer ? "✓" : ""}
                </button>
                <input
                  className="min-w-0 flex-1 border-0 bg-transparent px-1 py-[7px] text-sm font-bold text-slate-950 outline-none"
                  value={o}
                  placeholder={`Đáp án ${LETTERS[i]}`}
                  aria-label={`Đáp án ${LETTERS[i]}`}
                  onChange={(e) => updateQuestion(setId, x.id, { options: x.options.map((v, k) => (k === i ? e.target.value : v)) })}
                />
              </div>
            ))}
          </div>
          <input
            className={`${editField} h-[42px] px-3 text-sm`}
            value={x.explain ?? ""}
            placeholder="Giải thích hiện sau khi trả lời"
            aria-label="Giải thích"
            onChange={(e) => updateQuestion(setId, x.id, { explain: e.target.value })}
          />
          {canDelete ? (
            <button type="button" className="self-start text-[13px] font-extrabold text-[#e11d48] hover:opacity-70" onClick={() => deleteQuestion(setId, x.id)}>
              Xoá câu này
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

/** Set options that are not part of the v5 editor screen (class, self-study assignment); opened from the header. */
function SettingsForm({ s }: { s: WRSet }) {
  const { courses } = useTeacherCourses();
  const { nameOf } = useAllCourses();
  // Own live classes, plus the one this set is already assigned to even if it has closed since.
  const myClasses = !s.classId || courses.some((c) => c.id === s.classId) ? courses : [...courses, { id: s.classId, name: nameOf(s.classId) }];
  const patch = (p: Partial<WRSet>) => updateSet(s.id, p);
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={labelCls}>Lớp</label>
        <select className={fieldClass} value={s.classId} onChange={(e) => patch({ classId: e.target.value })}>
          {s.classId === "" || !myClasses.some((c) => c.id === s.classId) ? <option value={s.classId}>Chọn lớp…</option> : null}
          {myClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <input type="checkbox" className="h-4 w-4 accent-slate-950" checked={s.selfPaced} onChange={(e) => patch({ selfPaced: e.target.checked })} />
        Giao cho học viên tự luyện
      </label>
      {s.selfPaced ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-3">
          <Tabs<"game" | "test"> value={s.mode} items={[["game", "Kiểu game"], ["test", "Bài kiểm tra"]]} onChange={(mode) => patch({ mode })} />
          {s.mode === "test" ? (
            <div>
              <label className={labelCls}>Thời gian làm bài</label>
              <select className={fieldClass} value={s.testMin} onChange={(e) => patch({ testMin: Number(e.target.value) })}>
                {[10, 15, 20, 30].map((m) => (
                  <option key={m} value={m}>
                    {m} phút
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label className={labelCls}>Hạn hoàn thành</label>
            <input type="date" className={fieldClass} value={s.deadline} onChange={(e) => patch({ deadline: e.target.value })} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReportTab({ s }: { s: WRSet }) {
  const { reports } = useWRState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rep = useMemo(() => buildReport(s), [s, reports]);
  const per = usePaged(rep.perQuestion);
  const board = usePaged(rep.board);
  const color = (p: number) => (p >= 75 ? "#10b981" : p >= 50 ? "#f59e0b" : "#f43f5e");
  return (
    <div className="flex flex-col gap-6">
      {!rep.hasData ? (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-[13px] font-bold text-slate-600">
          Chưa có dữ liệu: báo cáo được tạo từ lần trình chiếu thật có học viên trả lời. Mở phòng, để học viên vào bằng PIN và chơi xong rồi đóng phòng.
        </p>
      ) : null}
      <StatStrip
        items={[
          { label: "người chơi", value: rep.hasData ? rep.players : "—" },
          { label: "% đúng trung bình", value: rep.hasData ? `${rep.avgPct}%` : "—" },
          { label: "câu khó nhất", value: rep.hardest ? `Câu ${rep.hardest.index + 1}` : "—" },
          { label: "thời gian TB mỗi câu", value: rep.hasData ? `${rep.avgSeconds}s` : "—" },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-[17px] font-extrabold">Từng câu</h3>
          <TableFrame>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className={thClass}>Câu</th>
                  <th className={thClass}>% đúng</th>
                </tr>
              </thead>
              <tbody>
                {per.rows.map((r) => {
                  const x = s.questions[r.index];
                  return (
                    <tr key={r.index} className="border-b border-slate-100 last:border-b-0">
                      <td className={tdClass}>
                        <div className="font-bold text-slate-950">
                          {r.index + 1}. <SentenceWithAnswer text={x.sentence} answer={x.options[x.answer]} />
                        </div>
                        {r.wrongOption ? (
                          <div className="text-xs font-semibold text-slate-500">
                            Hay nhầm: “{r.wrongOption}” · {r.wrongCount} bạn
                          </div>
                        ) : null}
                      </td>
                      <td className={`${tdClass} w-[150px]`}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full" style={{ width: `${rep.hasData ? r.pct : 0}%`, background: color(r.pct) }} />
                          </div>
                          <span className="text-[13px] font-extrabold tabular-nums">{rep.hasData ? `${r.pct}%` : "—"}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination page={per.page} total={per.total} pageSize={per.pageSize} onChange={per.setPage} />
          </TableFrame>
        </div>
        <div>
          <h3 className="mb-2 text-[17px] font-extrabold">Bảng xếp hạng</h3>
          <TableFrame>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className={thClass}>#</th>
                  <th className={thClass}>Tên</th>
                  <th className={thClass}>Điểm</th>
                  <th className={thClass}>Đúng</th>
                  <th className={thClass}>Giây TB</th>
                </tr>
              </thead>
              <tbody>
                {board.rows.map((b, i) => (
                  <tr key={b.name} className="border-b border-slate-100 last:border-b-0">
                    <td className={`${tdClass} font-black tabular-nums`}>{(board.page - 1) * board.pageSize + i + 1}</td>
                    <td className={`${tdClass} font-bold`}>{b.name}</td>
                    <td className={`${tdClass} tabular-nums`}>{b.score.toLocaleString("vi-VN")}</td>
                    <td className={`${tdClass} tabular-nums`}>
                      {b.correct}/{s.questions.length}
                    </td>
                    <td className={`${tdClass} tabular-nums`}>{b.avgSec}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={board.page} total={board.total} pageSize={board.pageSize} onChange={board.setPage} />
          </TableFrame>
        </div>
      </div>
    </div>
  );
}

export default function TeacherWordRushSetPage() {
  const { id } = useParams();
  const s = useWRSet(id);
  const navigate = useNavigate();
  const { categories, categoryById } = useCategories();
  const { user } = useAuth();
  // undefined = nothing chosen yet, so the first question starts open (design: qOpen 0).
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);
  const [panel, setPanel] = useState<"settings" | "report" | null>(null);

  // Only the author edits a set.
  if (s && s.authorId !== user?.id) {
    return (
      <TeacherLayout>
        <BackLink to="/teacher/word-rush">Bộ câu hỏi</BackLink>
        <p className="mt-6 text-sm text-slate-500">Bạn chỉ có thể chỉnh sửa bộ câu hỏi do mình tạo.</p>
      </TeacherLayout>
    );
  }
  if (!s) {
    return (
      <TeacherLayout>
        <BackLink to="/teacher/word-rush">Bộ câu hỏi</BackLink>
        <h1 className="mt-3 text-[30px] font-black">Không tìm thấy bộ câu hỏi</h1>
        <button type="button" className={`${outlineBtn} mt-4`} onClick={() => navigate("/teacher/word-rush")}>
          Về danh sách
        </button>
      </TeacherLayout>
    );
  }

  const col = categoryColors(categoryById(s.categoryId)?.color);
  const valid = s.questions.filter(isValidQuestion).length;
  const isOpen = (qid: string, i: number) => (openId === undefined ? i === 0 : openId === qid);
  const headBtn = `${outlineBtn} !h-10 !px-4 !text-[13px] !font-extrabold`;

  return (
    <TeacherLayout>
      <div className="flex flex-col gap-[18px]">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-2">
            <BackLink to="/teacher/word-rush">Bộ câu hỏi</BackLink>
            <input
              aria-label="Tên bộ câu hỏi"
              value={s.title}
              onChange={(e) => updateSet(s.id, { title: e.target.value })}
              placeholder="Bộ câu hỏi chưa đặt tên"
              className="w-full max-w-[640px] rounded-[10px] border-0 bg-transparent py-0.5 text-[clamp(24px,3vw,32px)] font-black tracking-[-0.03em] text-slate-950 outline-none focus:shadow-[0_0_0_2px_#bfdbfe]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Danh mục"
              value={s.categoryId ?? ""}
              onChange={(e) => updateSet(s.id, { categoryId: e.target.value || undefined })}
              className="h-10 cursor-pointer rounded-full border-0 px-3.5 text-[13px] font-extrabold"
              style={{ background: col.bg, color: col.fg }}
            >
              <option value="">Chưa phân loại</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="button" className={headBtn} onClick={() => setPanel("settings")}>
              Cài đặt
            </button>
            <button type="button" className={headBtn} onClick={() => setPanel("report")}>
              Báo cáo
            </button>
            <button
              type="button"
              disabled={valid === 0}
              className={`${primaryBtn} !h-11 !px-5 !text-sm !font-extrabold`}
              onClick={() => {
                if (valid === 0) return toast.error("Cần ít nhất 1 câu hợp lệ để trình chiếu.");
                roomActions.open(s.id);
                navigate("/teacher/word-rush/room");
              }}
            >
              Trình chiếu · {s.questions.length} câu
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-2.5">
          {s.questions.map((x, i) => (
            <QuestionCard
              key={x.id}
              setId={s.id}
              x={x}
              index={i}
              open={isOpen(x.id, i)}
              canDelete={s.questions.length > 1}
              onToggle={() => setOpenId(isOpen(x.id, i) ? null : x.id)}
            />
          ))}
          <button
            type="button"
            className="rounded-[20px] border-[1.5px] border-dashed border-slate-300 bg-transparent p-4 text-sm font-extrabold text-slate-600 hover:border-blue-500 hover:text-blue-600"
            onClick={() => setOpenId(addQuestion(s.id))}
          >
            + Thêm câu hỏi
          </button>
        </div>
      </div>

      <Modal isOpen={panel === "settings"} title="Cài đặt bộ câu hỏi" onClose={() => setPanel(null)} widthClassName="max-w-md">
        <SettingsForm s={s} />
      </Modal>
      <Modal isOpen={panel === "report"} title="Báo cáo" onClose={() => setPanel(null)} widthClassName="max-w-5xl">
        <ReportTab s={s} />
      </Modal>
    </TeacherLayout>
  );
}
