import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PublicLayout from "@/shared/components/layout/PublicLayout.tsx";
import { getCourseById } from "@/features/courses/courseApi.ts";
import type { Course } from "@/features/courses/types.ts";
import { useQueryErrorMessage } from "@/shared/hooks/useQueryErrorMessage.ts";
import { useAuth } from "@/features/auth/useAuth.ts";

const STATUS_VI: Record<Course["status"], string> = {
  OPEN: "Đang tuyển sinh",
  ACTIVE: "Đang học",
  CLOSE: "Đã đóng",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const getDurationLabel = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.max(
    0,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );

  return diffDays > 0 ? `${diffDays} ngày` : "Chỉ có lịch học";
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id ?? "";
  const { isAuthenticated } = useAuth();

  const isValidId = courseId.length > 0;
  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
    enabled: isValidId,
  });
  const course: Course | null = data?.data ?? null;
  const loadError = useQueryErrorMessage(queryError, "Không tải được thông tin khoá học. Vui lòng thử lại.");
  const error = isValidId ? loadError : "Đường dẫn khoá học không hợp lệ.";

  const durationLabel = useMemo(
    () => (course ? getDurationLabel(course.startDate, course.endDate) : "-"),
    [course]
  );

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate(`/auth/login?return=${encodeURIComponent(`/courses/${courseId}`)}`);
      return;
    }

    toast.info("Tính năng đăng ký khoá học đang được hoàn thiện. Vui lòng liên hệ trung tâm để được hỗ trợ.");
  };

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/courses" className="text-sm font-medium text-slate-500 transition hover:text-slate-950">
          Quay lại danh sách khoá học
        </Link>

        {loading ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-6 py-10 text-slate-500 shadow-sm">
            Đang tải thông tin khoá học...
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
                  Chi tiết khoá học
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {course.name}
                </h1>
                <p className="mt-3 max-w-2xl text-slate-300">
                  Lịch học, sĩ số và giáo viên phụ trách.
                </p>
              </div>

              <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
                {[
                  ["Tên khoá học", course.name],
                  ["Mã khoá học", course.code],
                  ["Trạng thái", STATUS_VI[course.status]],
                  ["Thời gian", `${formatDate(course.startDate)} - ${formatDate(course.endDate)}`],
                  ["Thời lượng", durationLabel],
                  ["Sĩ số tối đa", `${course.maxStudent} học viên`],
                  ["Giáo viên", course.teacher?.fullName ?? "—"],
                  ["Tuổi tối thiểu", course.minimumAge ?? "—"],
                  ["Trình độ đầu vào", course.requiredEntryLevel ?? "—"],
                  ["Điều kiện tiên quyết", course.prerequisitesRequired ? "Có" : "Không"],
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
                  Đăng ký học
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  Đăng ký khi bạn đã sẵn sàng.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Đăng nhập bằng tài khoản học viên để đăng ký khoá học này.
                </p>

                <button
                  type="button"
                  onClick={handleEnroll}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Đăng ký
                </button>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Cần hỗ trợ?
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Ghé trang chủ xem thêm khoá học, hoặc liên hệ trung tâm để được tư vấn chọn lớp.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/"
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                  >
                    Trang chủ
                  </Link>
                  <Link
                    to="/contact"
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                  >
                    Liên hệ
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