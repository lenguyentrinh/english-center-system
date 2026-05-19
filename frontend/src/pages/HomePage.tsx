import { Link } from "react-router-dom";
import Footer from "@/shared/components/layout/Footer.tsx";
import Header from "@/shared/components/layout/Header.tsx";

const highlights = [
  "Native + Vietnamese teachers",
  "IELTS / TOEIC / Communication tracks",
  "Small classes and progress checkpoints",
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-full">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            English Center
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Learn English with confidence
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Structured lessons, real speaking practice, and measurable progress.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#courses"
              className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
            >
              View courses
            </a>
            <Link
              to="/contact"
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Free consultation
            </Link>
          </div>
        </section>
        <section id="why-us" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-slate-900">Why choose us</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section id="courses" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-slate-900">Popular courses</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {["IELTS Foundation", "IELTS Intensive", "English Communication"].map(
              (course) => (
                <article
                  key={course}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{course}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Practical curriculum with weekly checkpoints.
                  </p>
                </article>
              ),
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}