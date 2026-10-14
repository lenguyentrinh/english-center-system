import { useMemo, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import PageHeader, { TableFrame, outlineBtn, primaryBtn, tdClass, thClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import Drawer from "@/shared/components/Drawer.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { useQueryErrorMessage } from "@/shared/hooks/useQueryErrorMessage.ts";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import { createUser, getUserEffectiveRoles, getUsers, updateUser } from "@/features/admin/adminApi.ts";
import type { RoleCode, UserStatus, UserSummaryResponse } from "@/features/admin/types.ts";

const NO_USERS: UserSummaryResponse[] = [];
const NO_ROLES: RoleCode[] = [];

type RoleGroup = "ALL" | "ADMIN" | "TEACHER" | "STUDENT";
const GROUPS: { key: RoleGroup; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "ADMIN", label: "Admin" },
  { key: "TEACHER", label: "Teacher" },
  { key: "STUDENT", label: "Student" },
];

const STATUS_STYLE: Record<UserStatus, { bg: string; text: string; bar: string }> = {
  ACTIVE: { bg: "#d1fae5", text: "#065f46", bar: "#10b981" },
  INACTIVE: { bg: "#e2e8f0", text: "#334155", bar: "#94a3b8" },
  LOCKED: { bg: "#ffe4e6", text: "#be123c", bar: "#f43f5e" },
};

const groupOf = (code: RoleCode): Exclude<RoleGroup, "ALL"> =>
  code === "ADMIN" ? "ADMIN" : code === "STUDENT" ? "STUDENT" : "TEACHER";

function roleChipStyle(code: RoleCode): { bg: string; text: string } {
  if (code === "ADMIN") return { bg: "#020617", text: "#ffffff" };
  if (code === "STUDENT") return { bg: "#ecfdf5", text: "#065f46" };
  return { bg: "#eff6ff", text: "#1e40af" };
}

const formatDate = (v: string | null) => (v ? new Date(v).toLocaleDateString("vi-VN") : "-");

export default function ManageUsersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error: queryError } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const users = data?.data ?? NO_USERS;
  const error = useQueryErrorMessage(queryError, "Failed to load users");

  // Roles are not part of UserSummaryResponse: one /users/{id}/roles call per user (cached, loaded in the background).
  const roleQueries = useQueries({
    queries: users.map((u) => ({
      queryKey: ["users", u.id, "effective-roles"],
      queryFn: () => getUserEffectiveRoles(u.id),
      staleTime: 60_000,
    })),
  });
  const rolesKey = roleQueries.map((q) => q.dataUpdatedAt).join(",");
  const rolesById = useMemo(() => {
    const map = new Map<string, RoleCode[]>();
    users.forEach((u, i) => {
      const r = roleQueries[i]?.data?.data;
      if (r) map.set(u.id, [...new Set(r.effectiveRoles.map((x) => x.code))]);
    });
    return map;
    // roleQueries is a fresh array each render; rolesKey tracks real changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, rolesKey]);
  const rolesLoading = roleQueries.some((q) => q.isLoading);

  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<RoleGroup>("ALL");
  const [drawer, setDrawer] = useState(false);

  const counts = useMemo(() => {
    const c: Record<RoleGroup, number> = { ALL: users.length, ADMIN: 0, TEACHER: 0, STUDENT: 0 };
    users.forEach((u) => {
      new Set((rolesById.get(u.id) ?? NO_ROLES).map(groupOf)).forEach((g) => {
        c[g] += 1;
      });
    });
    return c;
  }, [users, rolesById]);

  const statusCounts = useMemo(() => {
    const c: Record<UserStatus, number> = { ACTIVE: 0, INACTIVE: 0, LOCKED: 0 };
    users.forEach((u) => {
      if (u.status) c[u.status] += 1;
    });
    return c;
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (group !== "ALL" && !(rolesById.get(u.id) ?? NO_ROLES).some((r) => groupOf(r) === group)) return false;
      if (!q) return true;
      return [u.fullName, u.username, u.email].some((v) => v?.toLowerCase().includes(q));
    });
  }, [users, rolesById, search, group]);

  const { rows, page, setPage, total, pageSize } = usePaged(filtered, `${search}|${group}`);

  const statusMutation = useMutation({
    mutationFn: ({ user, status }: { user: UserSummaryResponse; status: UserStatus }) =>
      updateUser(user.id, {
        username: user.username,
        email: user.email ?? "",
        fullName: user.fullName ?? undefined,
        phone: user.phone ?? undefined,
        status,
      }),
    onSuccess: (_d, v) => {
      toast.success(v.status === "LOCKED" ? "Đã khoá tài khoản" : "Đã mở khoá tài khoản");
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Không cập nhật được trạng thái")),
  });

  return (
    <AdminLayout>
      <PageHeader
        crumb={`Quản trị · ${users.length} tài khoản`}
        title="Người dùng"
        actions={
          <button type="button" className={primaryBtn} onClick={() => setDrawer(true)}>
            + Thêm người dùng
          </button>
        }
      />

      {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {(Object.keys(STATUS_STYLE) as UserStatus[]).map((s) => {
          const st = STATUS_STYLE[s];
          const pct = users.length ? (statusCounts[s] / users.length) * 100 : 0;
          return (
            <div key={s} className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <p className="text-[13px] font-semibold text-slate-500">{s}</p>
              <p className="text-[26px] font-black tabular-nums">{statusCounts[s]}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: st.bar }} />
              </div>
            </div>
          );
        })}
      </div>

      <TableFrame>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, username, email"
            className="w-full max-w-xs rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
          />
          <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1" title={rolesLoading ? "Đang tải vai trò…" : undefined}>
            {GROUPS.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setGroup(g.key)}
                className={`rounded-full px-3 py-1 text-[13px] font-bold ${group === g.key ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-white"}`}
              >
                {g.label} <span className="opacity-60">{counts[g.key]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className={thClass}>Người dùng</th>
                <th className={thClass}>Vai trò</th>
                <th className={thClass}>Liên hệ</th>
                <th className={thClass}>Trạng thái</th>
                <th className={thClass}>Ngày tạo</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td className={`${tdClass} text-slate-500`} colSpan={6}>
                    Đang tải…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className={`${tdClass} text-slate-500`} colSpan={6}>
                    Không có người dùng phù hợp.
                  </td>
                </tr>
              ) : (
                rows.map((u) => {
                  const roles = rolesById.get(u.id);
                  const st = u.status ? STATUS_STYLE[u.status] : null;
                  const locked = u.status === "LOCKED";
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70">
                      <td className={tdClass}>
                        <Link to={`/admin/users/${u.id}`} className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-800">
                            {(u.fullName || u.username).charAt(0).toUpperCase()}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-bold text-slate-950">{u.fullName || u.username}</span>
                            <span className="block truncate text-xs text-slate-500">@{u.username}</span>
                          </span>
                        </Link>
                      </td>
                      <td className={tdClass}>
                        {roles === undefined ? (
                          <span className="text-xs text-slate-400">…</span>
                        ) : roles.length === 0 ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {roles.map((r) => {
                              const c = roleChipStyle(r);
                              return (
                                <span key={r} className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: c.bg, color: c.text }}>
                                  {r}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className={tdClass}>
                        <span className="block text-slate-800">{u.email ?? "-"}</span>
                        <span className="block text-xs text-slate-500">{u.phone ?? ""}</span>
                      </td>
                      <td className={tdClass}>
                        {st && u.status ? (
                          <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: st.bg, color: st.text }}>
                            {u.status}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className={`${tdClass} text-slate-600`}>{formatDate(u.createdAt)}</td>
                      <td className={`${tdClass} text-right`}>
                        <button
                          type="button"
                          className={outlineBtn}
                          disabled={statusMutation.isPending}
                          onClick={() => statusMutation.mutate({ user: u, status: locked ? "ACTIVE" : "LOCKED" })}
                        >
                          {locked ? "Mở khoá" : "Khoá"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
      </TableFrame>

      {drawer ? <CreateUserDrawer onClose={() => setDrawer(false)} /> : null}
    </AdminLayout>
  );
}

function CreateUserDrawer({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ username: "", password: "", email: "", fullName: "", phone: "", status: "ACTIVE" as UserStatus });
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: () =>
      createUser({
        username: form.username.trim(),
        password: form.password,
        email: form.email.trim(),
        fullName: form.fullName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        status: form.status,
      }),
    onSuccess: () => {
      toast.success("Đã tạo người dùng");
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Không tạo được người dùng")),
  });

  const input = "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300";
  const label = "mb-1 block text-xs font-bold text-slate-600";
  const valid = Boolean(form.username.trim() && form.password && form.email.trim());

  return (
    <Drawer title="Thêm người dùng" onClose={onClose} accent>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) mutation.mutate();
        }}
      >
        <div>
          <label className={label}>Username *</label>
          <input className={input} value={form.username} onChange={set("username")} autoComplete="off" />
        </div>
        <div>
          <label className={label}>Mật khẩu *</label>
          <input className={input} type="password" value={form.password} onChange={set("password")} autoComplete="new-password" />
        </div>
        <div>
          <label className={label}>Email *</label>
          <input className={input} type="email" value={form.email} onChange={set("email")} />
        </div>
        <div>
          <label className={label}>Họ tên</label>
          <input className={input} value={form.fullName} onChange={set("fullName")} />
        </div>
        <div>
          <label className={label}>Điện thoại</label>
          <input className={input} value={form.phone} onChange={set("phone")} />
        </div>
        <div>
          <label className={label}>Trạng thái</label>
          <select className={input} value={form.status} onChange={set("status")}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="LOCKED">LOCKED</option>
          </select>
        </div>
        <p className="text-xs text-slate-500">Vai trò gán sau ở trang chi tiết người dùng.</p>
        <div className="flex gap-2">
          <button type="submit" disabled={!valid || mutation.isPending} className={`${primaryBtn} disabled:opacity-50`}>
            {mutation.isPending ? "Đang lưu…" : "Tạo người dùng"}
          </button>
          <button type="button" onClick={onClose} className={outlineBtn}>
            Huỷ
          </button>
        </div>
      </form>
    </Drawer>
  );
}
