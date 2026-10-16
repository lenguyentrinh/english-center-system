import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PublicLayout from "@/shared/components/layout/PublicLayout.tsx";
import CourseCard from "@/shared/components/CourseCard.tsx";
import { getCourses } from "@/features/courses/courseApi.ts";
import type { Course } from "@/features/courses/types.ts";
import { useQueryErrorMessage } from "@/shared/hooks/useQueryErrorMessage.ts";

const whyChooseUs = [
  "Giáo viên bản ngữ và giáo viên Việt Nam cùng giảng dạy",
  "Lộ trình IELTS, TOEIC và Giao tiếp",
  "Lớp nhỏ, nhận xét đều đặn và có bài kiểm tra định kỳ",
  "Tư vấn xếp lớp tận tình cho học viên mới",
];

const testimonials = [
  {
    quote:
      "Lộ trình khoá học rõ ràng giúp em học đều đặn hơn. Tuần nào em cũng thấy mình tiến bộ.",
    name: "Minh Anh",
    role: "Học viên IELTS",
  },
  {
    quote:
              "Các buổi luyện nói và nhịp học hợp lý giúp em tự tin hơn khi phỏng vấn và đi thi.",
    name: "Hoang Nam",
    role: "Học viên TOEIC",
  },
];

const NO_COURSES: Course[] = [];

export default function HomePage() {
  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });
  const courses = data?.data ?? NO_COURSES;
  const error = useQueryErrorMessage(queryError, "Không tải được các khoá học nổi bật. Vui lòng thử lại.");

  const featuredCourses = useMemo(
    () => [...courses].sort((left, right) => right.id.localeCompare(left.id)).slice(0, 4),
    [courses]
  );

  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.16),_transparent_35%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              English Center
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
              Học tiếng Anh bài bản, tiến bộ thấy rõ từng tuần.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Chọn khoá học, xem lịch học và bắt đầu lộ trình đúng với mục tiêu của bạn.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Xem tất cả khoá học
              </Link>
              <a
                href="#why-us"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Vì sao chọn chúng tôi
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["4", "Khoá học đang mở"],
              ["3", "Lộ trình học"],
              ["24/7", "Xem khoá học mọi lúc"],
              ["1", "Điểm khởi đầu của bạn"],
            ].map(([value, label]) => (
              <article
                key={label}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <p className="text-4xl font-semibold tracking-tight text-white">{value}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about-us" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Giới thiệu
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Luyện thi hiệu quả, giao tiếp tự tin.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Chọn khoá học, xem lịch học, rồi cùng giáo viên chinh phục từng cột mốc. Mọi bước đều rõ ràng, dễ theo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Xem khoá học
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              >
                Liên hệ với chúng tôi
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Thầy cô tận tâm", "Chú trọng luyện nói, mẹo làm bài và nắm chắc cấu trúc đề thi."],
              ["Nhịp học vừa sức", "Học đều mỗi tuần, không áp lực, không bị quá tải."],
              ["Mục tiêu rõ ràng", "Biết mình đang ở đâu qua từng cột mốc và lịch học cụ thể."],
              ["Lớp học thân thiện", "Môi trường vui, gần gũi để bạn luôn có hứng thú đến lớp."],
            ].map(([title, description]) => (
              <article key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="why-us" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                Vì sao chọn chúng tôi
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Học dễ theo, dễ giữ nhịp, càng học càng có động lực.
              </h2>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {whyChooseUs.map((item) => (
                <li key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Khoá học nổi bật
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Khoá học mới, mở lớp thường xuyên
            </h2>
          </div>
          <Link
            to="/courses"
            className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
          >
            Xem tất cả khoá học
          </Link>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-slate-500 shadow-sm">
            Đang tải các khoá học nổi bật...
          </div>
        ) : featuredCourses.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-slate-500 shadow-sm">
            Hiện chưa có khoá học nổi bật.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} className="h-full" />
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Linh hoạt", "Xem khoá học bất cứ lúc nào, ở đâu"],
              ["Minh bạch", "Lịch học, sĩ số rõ ràng ngay từ đầu"],
              ["Thiết thực", "Mỗi giai đoạn đều có mục tiêu cụ thể để đạt được"],
              ["Được đồng hành", "Luôn có người chỉ cho bạn bước tiếp theo"],
            ].map(([title, description]) => (
              <article key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm leading-7 text-slate-600">“{item.quote}”</p>
              <div className="mt-5">
                <p className="font-semibold text-slate-950">{item.name}</p>
                <p className="text-sm text-slate-500">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}