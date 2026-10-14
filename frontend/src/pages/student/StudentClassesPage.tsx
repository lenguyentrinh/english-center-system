import { Link } from "react-router-dom";
import StudentLayout from "@/shared/components/layout/StudentLayout";
import PageHeader, { TableFrame, tdClass, thClass } from "@/shared/components/PageHeader";
import Pagination from "@/shared/components/Pagination";
import { usePaged } from "@/shared/hooks/usePaged";
import { MOCK_STUDENT } from "@/features/mock/common";
import { useClasses } from "@/features/classes";
import { StatusPill } from "@/features/classes/ClassParts";
import { TEACHER_NAMES } from "@/features/classes/utils";

export default function StudentClassesPage() {
  const mine = useClasses().filter((c) => c.students.some((s) => s.id === MOCK_STUDENT.id));
  const paged = usePaged(mine);

  return (
    <StudentLayout>
      <PageHeader crumb={`Học tập · ${mine.length} lớp`} title="Lớp của tôi" />
      <TableFrame>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className={thClass}>Lớp</th>
                <th className={thClass}>Lịch học</th>
                <th className={thClass}>Phòng</th>
                <th className={thClass}>Sĩ số</th>
                <th className={thClass}>Giáo viên</th>
                <th className={thClass}>Trạng thái</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {paged.rows.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0">
                  <td className={tdClass}>
                    <p className="font-extrabold text-slate-950">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.code}</p>
                  </td>
                  <td className={`${tdClass} tabular-nums`}>{c.scheduleText}</td>
                  <td className={tdClass}>{c.room}</td>
                  <td className={`${tdClass} tabular-nums`}>{c.students.length}</td>
                  <td className={tdClass}>{TEACHER_NAMES[c.teacherId] ?? "—"}</td>
                  <td className={tdClass}>
                    <StatusPill status={c.status} />
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <Link to={`/student/classes/${c.id}`} className="text-[13px] font-bold text-blue-600 hover:underline">
                      Vào lớp →
                    </Link>
                  </td>
                </tr>
              ))}
              {paged.rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                    Bạn chưa tham gia lớp nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination page={paged.page} total={paged.total} pageSize={paged.pageSize} onChange={paged.setPage} />
      </TableFrame>
    </StudentLayout>
  );
}
