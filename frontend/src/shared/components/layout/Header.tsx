import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logout } from "@/features/auth/authApi.ts";
import {
  AUTH_CHANGED_EVENT,
  getAdminAccessState,
  isAuthenticated,
  setAdminAccessState,
  setAuthenticated,
} from "@/features/auth/authSession.ts";
import {
  clearCurrentUsername,
  getCurrentDisplayName,
  getCurrentUsername,
} from "@/features/auth/authIdentity.ts";
import { probeAdminAccess } from "@/features/auth/authApi.ts";
import { getUsers } from "@/features/admin/adminApi.ts";

const navItems = [
  { label: "Course", href: "/courses" },
  { label: "About Us", href: "/#about-us" },
  { label: "Why Us", href: "/#why-us" },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authed, setAuthed] = useState(() => isAuthenticated());
  const [username, setUsername] = useState(() => getCurrentDisplayName() || getCurrentUsername());
  const [isAdmin, setIsAdmin] = useState<boolean | null>(() => getAdminAccessState());

  useEffect(() => {
    const onAuthChanged = () => {
      setAuthed(isAuthenticated());
      setUsername(getCurrentDisplayName() || getCurrentUsername());
      setIsAdmin(getAdminAccessState());
    };
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!authed || getAdminAccessState() !== null) return;

      const adminAllowed = await probeAdminAccess();
      setAdminAccessState(adminAllowed);

      if (adminAllowed) {
        try {
          const usersRes = await getUsers();
          const currentUsername = getCurrentUsername();
          const currentUser = usersRes.data.find((user) => user.username === currentUsername);
          if (currentUser?.fullName?.trim()) {
            setUsername(currentUser.fullName.trim());
          }
        } catch {
          // Keep the existing display name if the admin user lookup fails.
        }
      }

      setIsAdmin(adminAllowed);
    };

    void bootstrap();
  }, [authed]);

  const activeLinkClass = (href: string) => {
    const isActive = href === "/courses"
      ? location.pathname.startsWith("/courses")
      : href === "/#about-us"
        ? location.pathname === "/" && location.hash === "#about-us"
        : href === "/#why-us"
          ? location.pathname === "/" && location.hash === "#why-us"
          : false;

    return [
      "text-sm font-medium transition",
      isActive ? "text-slate-950" : "text-slate-600 hover:text-slate-950",
    ].join(" ");
  };

  const handleLogout = async () => {
    try {
      const res = await logout();
      toast.success(res.message);
    } catch {
      // Even if API logout fails (expired session), we should still clear client state.
      toast.success("Logged out");
    } finally {
      setAuthenticated(false);
      clearCurrentUsername();
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-lg shadow-slate-950/20">
            EC
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
              English Center
            </p>
          </div>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) =>
            item.href.startsWith("/") && !item.href.startsWith("/#") ? (
              <Link key={item.label} to={item.href} className={activeLinkClass(item.href)}>
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className={activeLinkClass(item.href)}>
                {item.label}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          {authed && isAdmin ? (
            <Link
              to="/admin/users"
              className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:inline-flex"
            >
              My Manage
            </Link>
          ) : null}

          <div className="group relative">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {(authed ? username || "A" : "G").slice(0, 1).toUpperCase()}
              </span>
              <span className="max-w-[8rem] truncate">{authed ? username : "Account"}</span>
              <span className="text-slate-400">▾</span>
            </button>

            <div className="invisible absolute right-0 top-full z-50 mt-2 w-52 translate-y-1 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl shadow-slate-950/10 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Signed in
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                  {authed ? username || "Signed in user" : "Guest"}
                </p>
              </div>

              <Link
                to="/account"
                className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              >
                My Account
              </Link>
              {authed && isAdmin ? (
                <Link
                  to="/admin/users"
                  className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  My Manage
                </Link>
              ) : null}

              <div className="mt-2 border-t border-slate-100 pt-2">
                {authed ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/auth/login"
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
