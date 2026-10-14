import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import TeacherLayout from "@/shared/components/layout/TeacherLayout.tsx";
import PageHeader, { TableFrame, outlineBtn, primaryBtn, tdClass, thClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { MOCK_CLASS_REFS, MOCK_TEACHER } from "@/features/mock/common.ts";
import { buildReport, createSet, useWRState } from "@/features/wordRush/store.ts";
import { fmtPin } from "@/features/wordRush/constants.ts";
import { ModeChip } from "@/features/wordRush/ui.tsx";

export default function TeacherWordRushPage() {
  const { sets, room, results } = useWRState();
  const navigate = useNavigate();
  const mine = useMemo(() => sets.filter((s) => s.authorId === MOCK_TEACHER.id), [sets]);
  const { rows, page, setPage, total, pageSize } = usePaged(mine);

  return (
    <TeacherLayout>
      <PageHeader
        crumb={`Giáo viên · ${MOCK_TEACHER.name} · ${mine.length} bộ câu hỏi`}
        title="Word Rush của tôi"
        actions={
          <>
            <button type="button" className={outlineBtn} onClick={() => navigate("/teacher/word-rush/room")}>
              Mở phòng chơi
            </button>
            <button type="button" className={primaryBtn} onClick={() => navigate(`/teacher/word-rush/sets/${createSet()}`)}>
              + Tạo bộ câu hỏi
            </button>
          </>
        }
      />

      {room ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-bold text-cyan-900">
          <span>
            Phòng đang mở · {room.title} · PIN {fmtPin(room.pin)} · {room.players.length} người chơi
          </span>
          <Link to="/teacher/word-rush/room" className="text-blue-600 hover:underline">
            Quay lại màn chiếu →
          </Link>
        </div>
      ) : null}

      <TableFrame>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className={thClass}>Bộ câu hỏi</th>
              <th className={thClass}>Lớp</th>
              <th className={thClass}>Số câu</th>
              <th className={thClass}>Chế độ</th>
              <th className={thClass}>Lượt gần nhất</th>
              <th className={thClass} />
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const cls = MOCK_CLASS_REFS.find((c) => c.id === s.classId);
              const rep = buildReport(s, results[s.id]);
              return (
                <tr key={s.id} className="border-b border-slate-100 last:border-b-0">
                  <td className={tdClass}>
                    <div className="font-extrabold text-slate-950">{s.title}</div>
                    <div className="max-w-[320px] truncate text-xs text-slate-500">{s.questions[0]?.sentence ?? "Chưa có câu hỏi"}</div>
                  </td>
                  <td className={tdClass}>{cls?.name ?? "—"}</td>
                  <td className={`${tdClass} tabular-nums`}>{s.questions.length}</td>
                  <td className={tdClass}>
                    <ModeChip s={s} />
                  </td>
                  <td className={`${tdClass} tabular-nums text-slate-600`}>{rep.players} người · {rep.avgPct}% đúng</td>
                  <td className={`${tdClass} text-right`}>
                    <Link to={`/teacher/word-rush/sets/${s.id}`} className="text-[13px] font-extrabold text-blue-600 hover:underline">
                      Mở →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
      </TableFrame>
    </TeacherLayout>
  );
}
