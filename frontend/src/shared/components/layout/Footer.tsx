import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            English Center
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
            Structured English learning for exam prep, speaking confidence, and measurable progress.
          </p>
        </div>

        <div className="grid gap-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Explore
          </p>
          <a href="/#courses" className="transition hover:text-white">
            Courses
          </a>
          <a href="/#about-us" className="transition hover:text-white">
            About Us
          </a>
          <a href="/#why-us" className="transition hover:text-white">
            Why Us
          </a>
          <Link to="/contact" className="transition hover:text-white">
            Contact
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
          <p className="font-semibold text-white">Need help choosing a course?</p>
          <p className="mt-2 leading-6 text-slate-400">
            Browse the latest classes or open your account area to continue where you left off.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/courses"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              View Courses
            </Link>
            <Link
              to="/account"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              My Account
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>{new Date().getFullYear()} English Center. All rights reserved.</p>
          <p>Learn English with confidence and consistency.</p>
        </div>
      </div>
    </footer>
  );
}
