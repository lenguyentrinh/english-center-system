import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PublicLayout from "@/shared/components/layout/PublicLayout.tsx";
import CourseCard from "@/shared/components/CourseCard.tsx";
import { getCourses } from "@/features/courses/courseApi.ts";
import type { Course } from "@/features/courses/types.ts";
import { getApiErrorMessage } from "@/shared/api/error.ts";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCourses();
      setCourses(res.data);
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to load courses");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCourses();
  }, []);

  const sortedCourses = useMemo(
    () => [...courses].sort((left, right) => right.id - left.id),
    [courses]
  );

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Available courses
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              All classes in one place
            </h2>
          </div>

          <Link
            to="/"
            className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
          >
            Back to home
          </Link>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-slate-500 shadow-sm">
            Loading courses...
          </div>
        ) : sortedCourses.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-slate-500 shadow-sm">
            No courses are available right now.
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