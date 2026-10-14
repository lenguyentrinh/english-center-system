import { useNavigate, NavLink, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth, useLogout } from "@/features/auth/useAuth.ts";
import { NAV } from "./navConfig.ts";

export default function Sidebar({ role }: { role: keyof typeof NAV }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const cfg = NAV[role];
  const name = user?.fullName || user?.username || "";

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        toast.success("Logged out");
        navigate("/");
      },
    });
  };

  return (
    <aside className="sticky top-0 flex max-h-screen min-h-screen w-72 shrink-0 flex-col self-start overflow-y-auto bg-slate-950 text-slate-100">
      <div className="border-b border-white/10 p-6">
        <Link to="/" className="text-lg font-semibold tracking-tight text-white">
          English Center
        </Link>
        <p className="mt-2 text-sm text-slate-400">{cfg.console}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-5 px-3 py-4" aria-label="Navigation">
        {cfg.groups.map((g) => (
          <div key={g.title} className="flex flex-col gap-1">
            <span className="px-4 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{g.title}</span>
            {g.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block w-full rounded-xl px-4 py-3 text-sm font-medium transition ${isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
          <span className="grid size-[34px] place-items-center rounded-full bg-white text-sm font-extrabold text-slate-950">
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className="truncate text-xs text-slate-400">{user?.roles?.[0] ?? ""}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-3">
          <Link to="/" className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-center text-sm font-medium text-slate-200 hover:bg-white/5">
            Home
          </Link>
          <button type="button" onClick={handleLogout} className="flex-1 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200">
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
