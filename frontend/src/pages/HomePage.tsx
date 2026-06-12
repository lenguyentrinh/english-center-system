import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/shared/components/layout/PublicLayout.tsx";
import CourseCard from "@/shared/components/CourseCard.tsx";
import { useAppDispatch, useAppSelector } from "@/app/hooks.ts";
import { fetchCourses } from "@/features/courses/courseThunks.ts";

const whyChooseUs = [
  "Native and Vietnamese teachers working together",
  "IELTS, TOEIC, and communication tracks",
  "Small courses, consistent feedback, and checkpoints",
  "Supportive placement guidance for new learners",
];

const testimonials = [
  {
    quote:
      "The course structure made it easier to stay consistent. I could see progress every week.",
    name: "Minh Anh",
    role: "IELTS learner",
  },
  {
    quote:
      "The speaking practice and course rhythm gave me confidence for interviews and exams.",
    name: "Hoang Nam",
    role: "TOEIC learner",
  },
];

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { courses, loadingList: loading, listError: error } = useAppSelector((state) => state.courses);

  useEffect(() => {
    void dispatch(fetchCourses());
  }, [dispatch]);

  const featuredCourses = useMemo(
    () => [...courses].sort((left, right) => right.id - left.id).slice(0, 4),
    [courses]
  );

  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.25),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.2),_transparent_40%),radial-gradient(circle_at_top_left,_rgba(168,85,247,0.12),_transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-300 backdrop-blur">
                <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
                Welcome to English Center
              </div>
              <h1 className="mt-6 text-6xl font-bold tracking-tight sm:text-7xl lg:text-6xl">
                Learn English with purpose
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Structured courses designed for real progress. Choose from IELTS, TOEIC, or communication tracks with expert teachers and regular checkpoints.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/courses"
                  className="rounded-full bg-white px-8 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-100 hover:shadow-lg hover:shadow-white/20"
                >
                  Browse Courses
                </Link>
                <a
                  href="#why-us"
                  className="rounded-full border-2 border-white/30 px-8 py-4 text-base font-semibold text-white transition hover:border-white/50 hover:bg-white/10"
                >
                  Learn More
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { value: "4", label: "Featured course picks", icon: "📚" },
                { value: "3", label: "Study tracks", icon: "🎯" },
                { value: "24/7", label: "Access to the catalog", icon: "🌐" },
                { value: "100%", label: "Progress tracking", icon: "📊" },
              ].map(({ value, label, icon }) => (
                <article
                  key={label}
                  className="group rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur transition hover:border-white/40 hover:bg-white/15"
                >
                  <p className="text-3xl">{icon}</p>
                  <p className="mt-4 text-3xl font-bold tracking-tight text-white">{value}</p>
                  <p className="mt-2 text-sm leading-5 text-slate-300">{label}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about-us" className="relative bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <div className="inline-block rounded-full bg-indigo-100 px-4 py-1 text-sm font-semibold text-indigo-700">
                About Us
              </div>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Focused learning, clear progress
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                We simplify English learning with structured courses, transparent schedules, and regular milestones. Choose your track and learn at a pace that keeps you motivated.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/courses"
                  className="rounded-full bg-slate-950 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800 hover:shadow-lg"
                >
                  Explore Courses
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: "Expert Teachers", desc: "Native and Vietnamese instructors focused on speaking, strategy, and test prep.", icon: "👨‍🏫" },
                { title: "Consistent Pace", desc: "Courses designed for steady progress without overwhelming workload.", icon: "⚡" },
                { title: "Clear Milestones", desc: "Track your progress with visible checkpoints and course schedules.", icon: "🏆" },
                { title: "Small Groups", desc: "Learn in intimate settings with personalized feedback.", icon: "👥" },
              ].map(({ title, desc, icon }) => (
                <article key={title} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg hover:shadow-slate-950/5 hover:border-slate-300">
                  <p className="text-3xl">{icon}</p>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="why-us" className="relative overflow-hidden bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-block rounded-full bg-indigo-200 px-4 py-1 text-sm font-semibold text-indigo-700">
              Why Choose Us
            </div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
              Learning made simple and effective
            </h2>
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item) => (
              <li key={item} className="group rounded-2xl border border-white bg-white/80 p-6 shadow-sm transition hover:shadow-lg hover:bg-white backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                      <span className="text-lg">✓</span>
                    </div>
                  </div>
                  <p className="text-base font-medium leading-6 text-slate-900">{item}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="courses" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-block rounded-full bg-indigo-100 px-4 py-1 text-sm font-semibold text-indigo-700">
                Featured Courses
              </div>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
                Explore our latest courses
              </h2>
            </div>
            <Link
              to="/courses"
              className="inline-flex rounded-full bg-slate-950 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800 hover:shadow-lg"
            >
              View All Courses →
            </Link>
          </div>

          {error ? (
            <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-base text-rose-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-8 py-16 text-center text-slate-500">
              <p className="text-base">Loading featured courses...</p>
            </div>
          ) : featuredCourses.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-8 py-16 text-center text-slate-500">
              <p className="text-base">No featured courses available right now.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} className="h-full" />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-20 sm:py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.15),_transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Flexible", desc: "Learn at your own pace with courses available 24/7", icon: "🕐" },
              { title: "Transparent", desc: "See all schedules, capacity, and requirements upfront", icon: "👁️" },
              { title: "Results-focused", desc: "Track progress with measurable milestones", icon: "📈" },
              { title: "Supportive", desc: "Get guidance every step of your learning journey", icon: "🤝" },
            ].map(({ title, desc, icon }) => (
              <article key={title} className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/10 hover:border-white/20">
                <p className="text-3xl">{icon}</p>
                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <div className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
              Student Stories
            </div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
              What our learners say
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {testimonials.map((item) => (
              <article key={item.name} className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-lg hover:border-slate-300">
                <div className="flex items-start gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-lg leading-7 text-slate-700">"{item.quote}"</p>
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <p className="font-semibold text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
