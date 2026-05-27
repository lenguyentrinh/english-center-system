import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PublicLayout from "@/shared/components/layout/PublicLayout.tsx";
import { getCourseById } from "@/features/courses/courseApi.ts";
import type { Course } from "@/features/courses/types.ts";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import { isAuthenticated } from "@/features/auth/authSession.ts";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "long",
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

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = Number(id);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(courseId)) {
      setError("Invalid course id");
      setLoading(false);
      return;
    }

    const loadCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getCourseById(courseId);
        setCourse(res.data);
      } catch (err) {
        const message = getApiErrorMessage(err, "Failed to load course detail");
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void loadCourse();
  }, [courseId]);

  const durationLabel = useMemo(
    () => (course ? getDurationLabel(course.startDate, course.endDate) : "-"),
    [course]
  );

  const handleEnroll = () => {
    if (!isAuthenticated()) {
      navigate("/auth/login");
      return;
    }

    toast.info("Enrollment is not available in the current backend yet.");
  };

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/courses" className="text-sm font-medium text-slate-500 transition hover:text-slate-950">
          Back to courses
        </Link>

        {loading ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-6 py-10 text-slate-500 shadow-sm">
            Loading course detail...
          </div>
        ) : error ? (
          <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-rose-700">
            {error}
          </div>
        ) : course ? (
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
            <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-900 px-6 py-8 text-white sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                  Course detail
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {course.name}
                </h1>
                <p className="mt-3 max-w-2xl text-slate-300">
                  This course card is based on the backend-provided fields, so only the API data is shown here.
                </p>
              </div>

              <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
                {[
                  ["Course name", course.name],
                  ["Course code", course.code],
                  ["Status", course.status],
                  ["Schedule", `${formatDate(course.startDate)} - ${formatDate(course.endDate)}`],
                  ["Duration", durationLabel],
                  ["Capacity", `${course.maxStudent} students`],
                  ["Teacher", "Not provided by current API"],
                  ["Description", "Not provided by current API"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
                  </div>
                ))}
              </div>
            </article>

            <aside className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Enrollment
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  Join this course when you are ready.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The UI is ready for enrollment. Once the backend exposes an enrollment endpoint, this button can be wired without changing the page structure.
                </p>

                <button
                  type="button"
                  onClick={handleEnroll}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Enroll
                </button>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Need help?
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Visit the home page for featured courses or contact the team for recommendations.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/"
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                  >
                    Home
                  </Link>
                  <Link
                    to="/contact"
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </section>
    </PublicLayout>
  );
}