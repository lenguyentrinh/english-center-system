import type { TeachingClass } from "@/features/teaching-classes/types.ts";

interface TeachingClassTableProps {
  classes: TeachingClass[];
  loading: boolean;
  onUpdate: (teachingClass: TeachingClass) => void;
  onDelete: (id: number) => void;
  submitting?: boolean;
}

const statusColors: Record<string, { badge: string }> = {
  OPEN: { badge: "bg-blue-100 text-blue-800" },
  ACTIVE: { badge: "bg-green-100 text-green-800" },
  CLOSED: { badge: "bg-slate-100 text-slate-800" },
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

export default function TeachingClassTable({
  classes,
  loading,
  onUpdate,
  onDelete,
  submitting,
}: TeachingClassTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              ID
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              Code
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              Course ID
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              Start Date
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              End Date
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              Max Students
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              Status
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {classes.map((teachingClass) => {
            const colors =
              statusColors[teachingClass.status] || statusColors.OPEN;

            return (
              <tr
                key={teachingClass.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                  #{teachingClass.id}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {teachingClass.code}
                </td>

                <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                  {teachingClass.name}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {teachingClass.courseId}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatDate(teachingClass.startDate)}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatDate(teachingClass.endDate)}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {teachingClass.maxStudent}
                </td>

                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}
                  >
                    {teachingClass.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onUpdate(teachingClass)}
                      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={submitting}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete(teachingClass.id)}
                      className="inline-flex items-center rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          <p className="text-sm text-slate-500">
            No teaching classes found. Create one to get started.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">Loading classes...</p>
        </div>
      )}
    </div>
  );
}