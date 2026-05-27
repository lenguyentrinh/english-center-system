import type { Course } from "@/features/courses/types.ts";

interface CourseTableProps {
  classes: Course[];
  loading: boolean;
  onView?: (course: Course) => void;
  onUpdate: (course: Course) => void;
  onDelete: (id: number) => void;
  submitting?: boolean;
}

const statusColors: Record<string, { badge: string }> = {
  OPEN: { badge: "bg-emerald-100 text-emerald-800" },
  ACTIVE: { badge: "bg-green-100 text-green-800" },
  CLOSED: { badge: "bg-rose-100 text-rose-800" },
};

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function CourseTable({ classes, loading, onView, onUpdate, onDelete, submitting }: CourseTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Code</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Start Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">End Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Max Students</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {classes.map((course) => {
            const colors = statusColors[course.status] || statusColors.OPEN;
            return (
              <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">#{course.id}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{course.code}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{course.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{formatDate(course.startDate)}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{formatDate(course.endDate)}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{course.maxStudent}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}>
                    {course.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onView ? (
                      <button
                        onClick={() => onView(course)}
                        className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={submitting}
                      >
                        View
                      </button>
                    ) : null}
                    <button
                      onClick={() => onUpdate(course)}
                      className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={submitting}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(course.id)}
                      className="inline-flex items-center rounded-md border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={submitting}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!loading && classes.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">No courses found. Create one to get started.</p>
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">Loading courses...</p>
        </div>
      )}
    </div>
  );
}