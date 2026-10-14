import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import TeacherLayout from "@/shared/components/layout/TeacherLayout.tsx";
import { TableFrame, outlineBtn, primaryBtn, tdClass, thClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { MOCK_CLASS_REFS } from "@/features/mock/common.ts";
import { addQuestion, buildReport, deleteQuestion, isValidQuestion, roomActions, updateQuestion, updateSet, useWRSet, useWRState } from "@/features/wordRush/store.ts";
import { LETTERS } from "@/features/wordRush/constants.ts";
import { SentenceWithAnswer, StatStrip, Tabs } from "@/features/wordRush/ui.tsx";
import type { WRQuestion, WRSet } from "@/features/wordRush/types.ts";

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200";
const labelCls = "mb-1 block text-xs font-bold text-slate-600";

function QuestionRow({ setId, x, index, open, onToggle }: { setId: string; x: WRQuestion; index: number; open: boolean; onToggle: () => void }) {
  const valid = isValidQuestion(x);
  return (
    <li className="border-b border-slate-100 last:border-b-0">
      <button type="button" onClick={onToggle} className="flex w-full flex-col gap-2 px-5 py-4 text-left hover:bg-slate-50">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-[13px] font-black tabular-nums text-slate-400">{String(index + 1).padStart(2, "0")}</span>
          <p className="flex-1 text-[15px] font-bold text-slate-950">
            <SentenceWithAnswer text={x.sentence} answer={x.options[x.answer]} />
          </p>
          {!valid ? <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700">Chưa hợp lệ</span> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 pl-8">
          {x.options.map((o, i) => (
            <span key={i} className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${i === x.answer ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
              {LETTERS[i]}. {o || "…"}
            </span>
          ))}
          <span className="text-xs font-semibold text-slate-400">{x.topic}</span>
        </div>
      </button>
      {open ? (
        <div className="flex flex-col gap-3 bg-slate-50 px-5 py-4">
          <div>
            <label className={labelCls}>Câu hỏi (dùng ___ cho chỗ trống)</label>
            <textarea className={inputCls} rows={2} value={x.sentence} onChange={(e) => updateQuestion(setId, x.id, { sentence: e.target.value })} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {x.options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`Chọn ${LETTERS[i]} là đáp án đúng`}
                  onClick={() => updateQuestion(setId, x.id, { answer: i })}
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-black ${i === x.answer ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white text-slate-500"}`}
                >
                  {i === x.answer ? "✓" : LETTERS[i]}
                </button>
                <input
                  className={inputCls}
                  value={o}
                  placeholder={`Đáp án ${LETTERS[i]}`}
                  onChange={(e) => updateQuestion(setId, x.id, { options: x.options.map((v, k) => (k === i ? e.target.value : v)) })}
                />
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Chủ đề</label>
              <input className={inputCls} value={x.topic} onChange={(e) => updateQuestion(setId, x.id, { topic: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Giải thích</label>
              <input className={inputCls} value={x.explain ?? ""} onChange={(e) => updateQuestion(setId, x.id, { explain: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-between">
            <button type="button" className="text-[13px] font-extrabold text-rose-600 hover:underline" onClick={() => deleteQuestion(setId, x.id)}>
              Xoá câu
            </button>
            <button type="button" className="text-[13px] font-extrabold text-slate-600 hover:underline" onClick={onToggle}>
              Thu gọn
            </button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function Settings({ s }: { s: WRSet }) {
  const navigate = useNavigate();
  const valid = s.questions.filter(isValidQuestion).length;
  const patch = (p: Partial<WRSet>) => updateSet(s.id, p);
  return (
    <aside className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 border-t-2 border-slate-950 pt-3">
        <h3 className="text-[17px] font-extrabold">Cài đặt</h3>
        <div>
          <label className={labelCls}>Tên bộ</label>
          <input className={inputCls} value={s.title} onChange={(e) => patch({ title: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Lớp</label>
          <select className={inputCls} value={s.classId} onChange={(e) => patch({ classId: e.target.value })}>
            {MOCK_CLASS_REFS.map((c) => (
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
                <select className={inputCls} value={s.testMin} onChange={(e) => patch({ testMin: Number(e.target.value) })}>
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
              <input type="date" className={inputCls} value={s.deadline} onChange={(e) => patch({ deadline: e.target.value })} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl bg-slate-950 p-5 text-white">
        <h3 className="text-[17px] font-extrabold">Sẵn sàng trình chiếu</h3>
        <p className="mt-2 text-sm text-slate-300">
          {s.questions.length} câu · {s.secPerQ} giây mỗi câu · {valid} câu hợp lệ
        </p>
        <button
          type="button"
          disabled={valid === 0}
          onClick={() => {
            roomActions.open(s.id);
            navigate("/teacher/word-rush/room");
          }}
          className="mt-4 w-full rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-slate-950 disabled:opacity-40"
        >
          Mở phòng &amp; trình chiếu
        </button>
      </div>

      <ol className="list-decimal space-y-1.5 pl-5 text-[13px] font-semibold text-slate-500">
        <li>Soạn câu hỏi, dùng ___ cho chỗ trống và chọn đáp án đúng.</li>
        <li>Mở phòng, chiếu PIN lên màn hình để học viên vào.</li>
        <li>Điều khiển từng câu, xem bảng xếp hạng và báo cáo sau trận.</li>
      </ol>
    </aside>
  );
}

function QuestionsTab({ s }: { s: WRSet }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { rows, page, setPage, total, pageSize } = usePaged(s.questions);
  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="min-w-0 flex-[999_1_560px]">
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            className={primaryBtn}
            onClick={() => {
              const id = addQuestion(s.id);
              setOpenId(id);
              setPage(Math.ceil((s.questions.length + 1) / pageSize));
            }}
          >
            + Thêm câu hỏi
          </button>
        </div>
        <TableFrame>
          <ul className="m-0 list-none p-0">
            {rows.map((x, i) => (
              <QuestionRow key={x.id} setId={s.id} x={x} index={(page - 1) * pageSize + i} open={openId === x.id} onToggle={() => setOpenId(openId === x.id ? null : x.id)} />
            ))}
            {rows.length === 0 ? <li className="px-5 py-8 text-center text-sm font-semibold text-slate-500">Chưa có câu hỏi nào.</li> : null}
          </ul>
          <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
        </TableFrame>
      </div>
      <div className="min-w-0 flex-[1_1_300px]">
        <Settings s={s} />
      </div>
    </div>
  );
}

function ReportTab({ s }: { s: WRSet }) {
  const { results } = useWRState();
  const rep = useMemo(() => buildReport(s, results[s.id]), [s, results]);
  const per = usePaged(rep.perQuestion);
  const board = usePaged(rep.board);
  const color = (p: number) => (p >= 75 ? "#10b981" : p >= 50 ? "#f59e0b" : "#f43f5e");
  return (
    <div className="flex flex-col gap-6">
      <StatStrip
        items={[
          { label: "người chơi", value: rep.players },
          { label: "% đúng trung bình", value: `${rep.avgPct}%` },
          { label: "câu khó nhất", value: rep.hardest ? `Câu ${rep.hardest.index + 1}` : "—" },
          { label: "thời gian TB mỗi câu", value: `${rep.avgSeconds}s` },
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
                            <div className="h-full" style={{ width: `${r.pct}%`, background: color(r.pct) }} />
                          </div>
                          <span className="text-[13px] font-extrabold tabular-nums">{r.pct}%</span>
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
  const [tab, setTab] = useState<"q" | "r">("q");
  const cls = MOCK_CLASS_REFS.find((c) => c.id === s?.classId);

  return (
    <TeacherLayout>
      <div className="mb-5 flex flex-col gap-2">
        <Link to="/teacher/word-rush" className="self-start text-[13px] font-extrabold text-blue-600 hover:underline">
          ← Word Rush của tôi
        </Link>
        {s ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-slate-500">
                  {cls?.name ?? "—"} · {s.questions.length} câu
                </p>
                <h1 className="text-[30px] font-extrabold leading-tight">{s.title}</h1>
              </div>
              <Tabs value={tab} items={[["q", "Câu hỏi"], ["r", "Báo cáo"]]} onChange={setTab} />
            </div>
          </>
        ) : (
          <h1 className="text-[30px] font-extrabold">Không tìm thấy bộ câu hỏi</h1>
        )}
      </div>
      {s ? tab === "q" ? <QuestionsTab s={s} /> : <ReportTab s={s} /> : <Link to="/teacher/word-rush" className={outlineBtn}>Về danh sách</Link>}
    </TeacherLayout>
  );
}
