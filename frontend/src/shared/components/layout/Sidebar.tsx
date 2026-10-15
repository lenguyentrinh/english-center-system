import { useNavigate, NavLink, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth, useLogout } from "@/features/auth/useAuth.ts";
import { useQuery } from "@tanstack/react-query";
import { getCourseSchedule } from "@/features/courses/courseApi.ts";
import { addDays, isoDate, mondayOf } from "@/features/courses/scheduleUi.ts";
import { NAV, NAV_ICON_PATH, type NavIcon } from "./navConfig.ts";

type Role = keyof typeof NAV;

function Icon({ name, size = 18 }: { name: NavIcon; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={NAV_ICON_PATH[name]} />
    </svg>
  );
}

/** Red badge on admin "Lịch giáo viên" = teacher schedule conflicts in the current week (from the backend). */
function useBadge(role: Role, to: string): number {
  const enabled = role === "admin" && to === "/admin/schedule";
  const monday = mondayOf(new Date());
  const from = isoDate(monday);
  const { data } = useQuery({
    queryKey: ["course-schedule", from, "badge"],
    queryFn: () => getCourseSchedule({ from, to: isoDate(addDays(monday, 6)) }),
    enabled,
    staleTime: 60_000,
  });
  return (data ?? []).reduce((n, t) => n + t.conflictCount, 0);
}

function SideItem({ role, item }: { role: Role; item: (typeof NAV)[Role]["items"][number] }) {
  const badge = useBadge(role, item.to);
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-xl px-3.5 py-[11px] text-sm font-bold ${isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`
      }
    >
      <Icon name={item.icon} />
      <span className="flex-1">{item.label}</span>
      {badge > 0 ? <span className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-rose-500 px-[7px] text-[11px] font-black text-white">{badge}</span> : null}
    </NavLink>
  );
}

function BottomItem({ role, item }: { role: Role; item: (typeof NAV)[Role]["items"][number] }) {
  const badge = useBadge(role, item.to);
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) => `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${isActive ? "text-blue-600" : "text-slate-400"}`}
    >
      <span className="relative">
        <Icon name={item.icon} size={20} />
        {badge > 0 ? <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">{badge}</span> : null}
      </span>
      <span className="max-w-full truncate px-1">{item.short}</span>
    </NavLink>
  );
}

/** Dark sidebar (>=900px) and fixed bottom nav (<900px). */
export default function Sidebar({ role }: { role: Role }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const cfg = NAV[role];
  const name = user?.fullName || user?.username || "";

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        toast.success("Đã đăng xuất");
        navigate("/");
      },
    });
  };

  return (
    <>
      <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-[272px] shrink-0 flex-col self-start bg-slate-950 text-slate-100 min-[900px]:flex">
        <div className="border-b border-white/[.08] px-6 py-5">
          <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-slate-400">{cfg.console}</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Điều hướng">
          {cfg.items.map((item) => (
            <SideItem key={item.to} role={role} item={item} />
          ))}
        </nav>

        <div className="flex flex-col gap-2.5 border-t border-white/[.08] p-4">
          <Link to="/account" className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 hover:bg-white/10">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-white text-[13px] font-black text-slate-950">{name.charAt(0).toUpperCase()}</span>
            <span className="flex min-w-0 flex-1 flex-col leading-snug">
              <span className="truncate text-sm font-bold text-white">{name}</span>
              <span className="truncate text-xs text-slate-400">{cfg.roleLabel}</span>
            </span>
          </Link>
          <button type="button" onClick={handleLogout} className="h-[38px] rounded-xl border border-white/[.12] text-[13px] font-bold text-slate-200 hover:bg-white/[.06]">
            Đăng xuất
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] min-[900px]:hidden" aria-label="Điều hướng">
        {cfg.items.map((item) => (
          <BottomItem key={item.to} role={role} item={item} />
        ))}
      </nav>
    </>
  );
}
