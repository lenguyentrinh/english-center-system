import PublicLayout from "@/shared/components/layout/PublicLayout.tsx";
import { getCurrentDisplayName, getCurrentUsername } from "@/features/auth/authIdentity.ts";
import { isAdminUser, isAuthenticated } from "@/features/auth/authSession.ts";
import { Link } from "react-router-dom";

export default function AccountPage() {
  const authed = isAuthenticated();
  const username = getCurrentDisplayName() || getCurrentUsername();

  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            My Account
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {authed ? username || "Signed in user" : "Guest account"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            This page uses the current frontend session state, so it can show the signed-in username even though the backend does not expose a dedicated profile endpoint yet.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Username</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{username || "-"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Status</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {authed ? "Signed in" : "Not signed in"}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/courses"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse Courses
            </Link>
            {authed && isAdminUser() ? (
              <Link
                to="/admin/users"
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              >
                My Manage
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}