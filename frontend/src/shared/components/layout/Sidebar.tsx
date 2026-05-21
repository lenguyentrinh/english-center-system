import { useNavigate, NavLink, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { logout } from "@/features/auth/authApi.ts";
import {
  AUTH_CHANGED_EVENT,
  isAuthenticated,
  setAuthenticated,
} from "@/features/auth/authSession.ts";
import { clearCurrentUsername } from "@/features/auth/authIdentity.ts";

const navItems = [
  { to: "/admin/users", label: "Manage Users" },
  { to: "/admin/courses", label: "Manage Course" },
  { to: "/admin/roles", label: "Manage Roles" },
  { to: "/admin/business-roles", label: "Manage Business Roles" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const authed = isAuthenticated();

  const handleLogout = async () => {
    try {
      const res = await logout();
      toast.success(res.message);
    } catch {
      toast.success("Logged out");
    } finally {
      setAuthenticated(false);
      clearCurrentUsername();
      navigate("/");
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    }
  };

  return (
    <aside className="flex h-full w-full flex-col border-b border-slate-200 bg-slate-950 text-slate-100 md:sticky md:top-0 md:h-screen md:w-72 md:border-b-0 md:border-r">
      <div className="border-b border-white/10 px-6 py-6">
        <Link to="/" className="text-lg font-semibold tracking-tight text-white">
          English Center
        </Link>
        <p className="mt-2 text-sm text-slate-400">Admin console</p>
      </div>

      <nav className="flex-1 px-3 py-4" aria-label="Admin navigation">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "block rounded-xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300">
          <p className="font-medium text-white">Signed in</p>
          <p className="mt-1 text-xs text-slate-400">
            Use the admin pages to manage users and roles.
          </p>
        </div>

        <div className="mt-4 flex gap-3">
          <Link
            to="/"
            className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-center text-sm font-medium text-slate-200 transition hover:bg-white/5"
          >
            Home
          </Link>
          {authed ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}