import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth, useLogout } from "@/features/auth/useAuth.ts";
import { homePathForRoles } from "@/shared/utils/role.ts";

const navItems = [
  { label: "Khoá học", href: "/courses" },
  { label: "Giới thiệu", href: "/#about-us" },
  { label: "Vì sao chọn chúng tôi", href: "/#why-us" },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated: authed } = useAuth();
  const workspace = homePathForRoles(user?.roles);
  const hasWorkspace = authed && workspace !== "/";
  const logoutMutation = useLogout();
  const username = user?.fullName?.trim() || user?.username || "";

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

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      // Local state is cleared even when the API call fails (e.g. the session had already expired).
      onSettled: () => {
        toast.success("Đã đăng xuất");
        navigate("/");
      },
    });
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

        <nav aria-label="Điều hướng chính" className="hidden items-center gap-6 lg:flex">
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
          {hasWorkspace ? (
            <Link
              to={workspace}
              className="hidden rounded-full bg-[#1f2937] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0b1220] sm:inline-flex"
            >
              Vào trang làm việc
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
              <span className="max-w-[8rem] truncate">{authed ? username : "Tài khoản"}</span>
              <span className="text-slate-400">▾</span>
            </button>

            <div className="invisible absolute right-0 top-full z-50 mt-2 w-52 translate-y-1 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl shadow-slate-950/10 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Đã đăng nhập
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                  {authed ? username || "Người dùng" : "Khách"}
                </p>
              </div>

              <Link
                to="/account"
                className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              >
                Tài khoản của tôi
              </Link>
              {hasWorkspace ? (
                <Link
                  to={workspace}
                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  Vào trang làm việc
                </Link>
              ) : null}

              <div className="mt-2 border-t border-slate-100 pt-2">
                {authed ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Đăng xuất
                  </button>
                ) : (
                  <Link
                    to="/auth/login"
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    Đăng nhập
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
