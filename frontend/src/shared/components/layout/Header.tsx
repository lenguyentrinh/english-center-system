import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logout } from "@/features/auth/authApi.ts";
import {
  AUTH_CHANGED_EVENT,
  isAuthenticated,
  setAuthenticated,
} from "@/features/auth/authSession.ts";

const navItems = [
  { label: "Why us", href: "#why-us" },
  { label: "Courses", href: "#courses" },
];

export default function Header() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(() => isAuthenticated());

  useEffect(() => {
    const onAuthChanged = () => setAuthed(isAuthenticated());
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await logout();
      toast.success(res.message);
    } catch {
      // Even if API logout fails (expired session), we should still clear client state.
      toast.success("Logged out");
    } finally {
      setAuthenticated(false);
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-bold tracking-tight text-slate-900">
          English Center
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-5">
          <Link
            to="/teaching-classes"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Classes CRUD
          </Link>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              {item.label}
            </a>
          ))}

          <Link
            to="/contact"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Contact
          </Link>
          {authed ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/auth/login"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
