import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-slate-500">
          {new Date().getFullYear()} English Center. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          <a href="#courses" className="transition hover:text-slate-900">
            Courses
          </a>
          <Link to="/contact" className="transition hover:text-slate-900">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
