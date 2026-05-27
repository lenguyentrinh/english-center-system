import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import { getCourseById } from "@/features/courses/courseApi";
import type { Course } from "@/features/courses/types.ts";

export default function AdminCourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("sessions");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    void getCourseById(Number(id))
      .then((res) => setCourse(res.data))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  const statusBadgeClass: Record<string, string> = {
    OPEN: "rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800",
    ACTIVE: "rounded-full px-3 py-1 text-xs font-semibold bg-green-100 text-green-800",
    CLOSED: "rounded-full px-3 py-1 text-xs font-semibold bg-rose-100 text-rose-800",
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link to="/admin/courses" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
            Back to courses
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Course Detail</h1>
          <p className="mt-1 text-sm text-slate-600">{course?.name ?? ""}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={statusBadgeClass[course?.status ?? "OPEN"]}>{course?.status}</div>
          <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
            Edit course
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-slate-500 shadow-sm">Loading course...</div>
      ) : !course ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">Course not found</div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-1">
              <h3 className="text-sm font-semibold text-slate-900">Overview</h3>
              <dl className="mt-3 text-sm text-slate-600">
                <div className="flex justify-between py-1"><dt>Code</dt><dd>{course.code}</dd></div>
                <div className="flex justify-between py-1"><dt>Start</dt><dd>{course.startDate}</dd></div>
                <div className="flex justify-between py-1"><dt>End</dt><dd>{course.endDate}</dd></div>
                <div className="flex justify-between py-1"><dt>Max students</dt><dd>{course.maxStudent}</dd></div>
                <div className="flex justify-between py-1"><dt>Teacher</dt><dd>{course.teacher?.fullName ?? "—"}</dd></div>
                <div className="flex justify-between py-1"><dt>Allowed role</dt><dd>{course.availableTeacherRole ?? "—"}</dd></div>
              </dl>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-950">Details</h2>
                <div className="text-sm text-slate-500">Course ID #{course.id}</div>
              </div>

              <div className="rounded-lg border border-slate-100 shadow-sm p-4 bg-slate-50">
                <nav className="mb-4 flex gap-2">
                  {[
                    { key: "sessions", label: "Sessions" },
                    { key: "students", label: "Students" },
                    { key: "materials", label: "Materials" },
                    { key: "settings", label: "Settings" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={`rounded-md px-3 py-1 text-sm font-medium transition ${activeTab === t.key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </nav>

                <div className="mt-2">
                  {activeTab === "sessions" && <div className="text-sm text-slate-600">Sessions list will appear here.</div>}
                  {activeTab === "students" && <div className="text-sm text-slate-600">Students enrolled will appear here.</div>}
                  {activeTab === "materials" && <div className="text-sm text-slate-600">Session materials will appear here.</div>}
                  {activeTab === "settings" && <div className="text-sm text-slate-600">Course settings and teacher assignment UI.</div>}
                </div>
              </div>
            </article>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}

