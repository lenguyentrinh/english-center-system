import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PublicLayout from "@/shared/components/layout/PublicLayout.tsx";
import CourseCard from "@/shared/components/CourseCard.tsx";
import { getCourses } from "@/features/courses/courseApi.ts";
import type { Course } from "@/features/courses/types.ts";
import { getApiErrorMessage } from "@/shared/api/error.ts";

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
      const message = getApiErrorMessage(err, "Failed to load featured courses");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCourses();
  }, []);

  const featuredCourses = useMemo(
    () => [...courses].sort((left, right) => right.id - left.id).slice(0, 4),
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
              Learn English with structure, momentum, and visible progress.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Explore live courses, compare schedules, and find the learning track that fits your goals.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                View All Courses
              </Link>
              <a
                href="#why-us"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Why Choose Us
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["4", "Featured course picks"],
              ["3", "Study tracks"],
              ["24/7", "Access to the catalog"],
              ["1", "Simple place to start"],
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
              About Us
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              A focused center for exam prep and practical communication.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              We keep the learning journey clear: choose a course, review the schedule, and progress with regular checkpoints.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Browse courses
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              >
                Contact us
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Expert guidance", "Teachers who focus on speaking, strategy, and test structure."],
              ["Practical pace", "Courses designed for consistency rather than overload."],
              ["Clear goals", "Track progress with visible milestones and course schedules."],
              ["Supportive environment", "Learn in a setting that keeps you moving forward."],
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
                Why Choose Us
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Learn in a way that is easy to follow and easy to stick with.
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
              Featured Courses
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Latest courses from the catalog
            </h2>
          </div>
          <Link
            to="/courses"
            className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
          >
            View All Courses
          </Link>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-slate-500 shadow-sm">
            Loading featured courses...
          </div>
        ) : featuredCourses.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-slate-500 shadow-sm">
            No featured courses available right now.
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
              ["Flexible", "Explore courses any time"],
              ["Transparent", "See schedules and capacity upfront"],
              ["Practical", "Focus on measurable milestones"],
              ["Guided", "Start with a clean, simple next step"],
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