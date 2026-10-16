import { useQuery } from "@tanstack/react-query";
import { getSessionsByCourseId } from "@/features/courses/courseApi.ts";
import type { Session } from "@/features/courses/types.ts";

const NO_SESSIONS: Session[] = [];

type Props = {
  courseId: string;
};

export default function SessionList({ courseId }: Props) {
  const { data, isLoading: loading } = useQuery({
    queryKey: ["course-sessions", courseId],
    queryFn: () => getSessionsByCourseId(courseId),
  });
  const sessions = data?.data ?? NO_SESSIONS;

  if (loading) {
    return <div className="text-sm text-slate-500">Đang tải các buổi học...</div>;
  }

  if (sessions.length === 0) {
    return <div className="text-sm text-slate-500">Khoá học này chưa có buổi học nào.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Tiêu đề</th>
            <th className="px-3 py-2">Ngày</th>
            <th className="px-3 py-2">Bắt đầu</th>
            <th className="px-3 py-2">Kết thúc</th>
            <th className="px-3 py-2">Chủ đề</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sessions.map((s) => (
            <tr key={s.id} className="text-slate-700 hover:bg-slate-50">
              <td className="px-3 py-2 font-medium text-slate-900">{s.sessionNo}</td>
              <td className="px-3 py-2">{s.title}</td>
              <td className="px-3 py-2">{s.sessionDate}</td>
              <td className="px-3 py-2">{s.startTime}</td>
              <td className="px-3 py-2">{s.endTime}</td>
              <td className="px-3 py-2">{s.topic ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
