import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PublicLayout from "@/shared/components/layout/PublicLayout.tsx";
import CourseCard from "@/shared/components/CourseCard.tsx";
import { getCourses } from "@/features/courses/courseApi.ts";
import type { Course } from "@/features/courses/types.ts";
import { useQueryErrorMessage } from "@/shared/hooks/useQueryErrorMessage.ts";

const NO_COURSES: Course[] = [];

export default function CoursesPage() {
  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });
  const courses = data?.data ?? NO_COURSES;
  const error = useQueryErrorMessage(queryError, "Không tải được danh sách khoá học. Vui lòng thử lại.");

  const sortedCourses = useMemo(
    () => [...courses].sort((left, right) => right.id.localeCompare(left.id)),
    [courses]
  );

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Khoá học đang mở
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Chọn khoá học phù hợp với bạn
            </h2>
          </div>

          <Link
            to="/"
            className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
          >
            Về trang chủ
          </Link>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-slate-500 shadow-sm">
            Đang tải khoá học...
          </div>
        ) : sortedCourses.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-slate-500 shadow-sm">
            Hiện chưa có khoá học nào.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}