import { Link } from "react-router-dom";
import type { Course } from "@/features/courses/types.ts";

type Props = {
  course: Course;
  className?: string;
  showDetailButton?: boolean;
};

const statusClasses: Record<Course["status"], string> = {
  OPEN: "bg-emerald-100 text-emerald-800",
  ACTIVE: "bg-indigo-100 text-indigo-800",
  CLOSED: "bg-slate-200 text-slate-700",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getDurationLabel = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.max(
    0,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );

  return diffDays > 0 ? `${diffDays} day${diffDays === 1 ? "" : "s"}` : "Schedule only";
};

export default function CourseCard({ course, className = "", showDetailButton = true }: Props) {
  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-950/10 ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-950 via-indigo-600 to-cyan-500" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Course #{course.id}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            {course.name}
          </h3>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[course.status]}`}>
          {course.status}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
        {course.code} is scheduled from {formatDate(course.startDate)} to {formatDate(course.endDate)}.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Capacity</p>
          <p className="mt-2 font-semibold text-slate-950">{course.maxStudent} students</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Duration</p>
          <p className="mt-2 font-semibold text-slate-950">{getDurationLabel(course.startDate, course.endDate)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <div>Teacher: {course.teacher?.fullName ?? "—"}</div>
        <div>Min age: {course.minimumAge ?? "—"}</div>
      </div>

      {showDetailButton ? (
        <Link
          to={`/courses/${course.id}`}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white opacity-0 transition hover:bg-slate-800 group-hover:opacity-100"
        >
          View Detail
        </Link>
      ) : null}
    </article>
  );
}