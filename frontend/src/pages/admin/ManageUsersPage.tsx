import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import PageHeader, { TableFrame, fieldClass, fieldErrClass, labelClass, outlineBtn, primaryBtn, rowClass, tdClass, thClass } from "@/shared/components/PageHeader.tsx";
import Pagination from "@/shared/components/Pagination.tsx";
import Drawer from "@/shared/components/Drawer.tsx";
import SearchInput from "@/shared/components/ui/SearchInput.tsx";
import Segmented from "@/shared/components/ui/Segmented.tsx";
import { StatusDot, Tag } from "@/shared/components/ui/Tag.tsx";
import { usePaged } from "@/shared/hooks/usePaged.ts";
import { useQueryErrorMessage } from "@/shared/hooks/useQueryErrorMessage.ts";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import { useAuth } from "@/features/auth/useAuth.ts";
import { assignRoleToUser, createUser, getRoles, getUsers, updateUser } from "@/features/admin/adminApi.ts";
import type { RoleCode, UserStatus, UserSummaryResponse } from "@/features/admin/types.ts";
import {
  AVATAR,
  STATUS_META,
  emailSchema,
  formatDate,
  groupOf,
  initialOf,
  nameSchema,
  normalizePhone,
  phoneSchema,
  primaryGroup,
  roleLabel,
  roleTagStyle,
  type RoleGroup,
} from "@/features/admin/userUi.ts";

const NO_USERS: UserSummaryResponse[] = [];
const NO_ROLES: RoleCode[] = [];

export default function ManageUsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, error: queryError } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const users = data?.data ?? NO_USERS;
  const error = useQueryErrorMessage(queryError, "Không tải được danh sách người dùng");

  const { user: me } = useAuth();
  // UserResponse carries the effective role codes, so no per-user role request is needed.
  const rolesById = useMemo(() => new Map(users.map((u) => [u.id, (u.roles ?? NO_ROLES) as RoleCode[]])), [users]);

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
      toast.success(`${v.status === "LOCKED" ? "Đã khoá" : "Đã mở khoá"} ${v.user.fullName || v.user.username}`);
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      void queryClient.invalidateQueries({ queryKey: ["user-detail", v.user.id] });
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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên, username, email" />
        <Segmented
          value={group}
          onChange={setGroup}
          options={[
            { key: "ALL", label: "Tất cả", count: counts.ALL },
            { key: "ADMIN", label: "Admin", count: counts.ADMIN },
            { key: "TEACHER", label: "Giáo viên", count: counts.TEACHER },
            { key: "STUDENT", label: "Học viên", count: counts.STUDENT },
          ]}
        />
      </div>

      <TableFrame>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Người dùng</th>
                <th className={thClass}>Vai trò</th>
                <th className={thClass}>Liên hệ</th>
                <th className={thClass}>Trạng thái</th>
                <th className={thClass}>Ngày tạo</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
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
                  const st = u.status ? STATUS_META[u.status] : null;
                  const locked = u.status === "LOCKED";
                  const av = AVATAR[primaryGroup(roles ?? [])];
                  const display = u.fullName || u.username;
                  const open = () => navigate(`/admin/users/${u.id}`);
                  return (
                    <tr
                      key={u.id}
                      tabIndex={0}
                      onClick={open}
                      onKeyDown={(e) => e.key === "Enter" && open()}
                      className={`${rowClass} cursor-pointer hover:bg-slate-50`}
                    >
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <span style={{ background: av.bg, color: av.fg }} className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-black">
                            {initialOf(display)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-extrabold text-slate-950">{display}</span>
                            <span className="block truncate text-xs text-slate-500">@{u.username}</span>
                          </span>
                        </div>
                      </td>
                      <td className={tdClass}>
                        {roles === undefined || roles.length === 0 ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            {roles.slice(0, 2).map((r) => {
                              const c = roleTagStyle(r);
                              return (
                                <Tag key={r} width={108} bg={c.bg} fg={c.fg} title={r}>
                                  {roleLabel(r)}
                                </Tag>
                              );
                            })}
                            {roles.length > 2 ? (
                              <Tag width={44} bg="#f1f5f9" fg="#334155" title={roles.slice(2).join(", ")}>
                                +{roles.length - 2}
                              </Tag>
                            ) : null}
                          </div>
                        )}
                      </td>
                      <td className={tdClass}>
                        <span className="block text-slate-800">{u.email ?? "—"}</span>
                        <span className="block text-xs text-slate-500">{u.phone ?? ""}</span>
                      </td>
                      <td className={tdClass}>
                        {st ? (
                          <StatusDot bg={st.bg} fg={st.fg} dot={st.dot}>
                            {st.label}
                          </StatusDot>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-slate-600`}>{formatDate(u.createdAt)}</td>
                      <td className={`${tdClass} text-right`}>
                        <button
                          type="button"
                          disabled={statusMutation.isPending || u.id === me?.id}
                          title={u.id === me?.id ? "Bạn không thể tự khoá tài khoản của mình" : undefined}
                          onClick={(e) => {
                            e.stopPropagation();
                            statusMutation.mutate({ user: u, status: locked ? "ACTIVE" : "LOCKED" });
                          }}
                          className={`${outlineBtn} !px-3.5 !py-1.5 ${locked ? "!border-emerald-200 !text-emerald-600" : "!border-rose-200 !text-rose-600"}`}
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

      {drawer ? <CreateUserDrawer existing={users} onClose={() => setDrawer(false)} /> : null}
    </AdminLayout>
  );
}

const NEW_ROLES: { key: "STUDENT" | "TEACHER" | "ADMIN"; label: string }[] = [
  { key: "STUDENT", label: "Học viên" },
  { key: "TEACHER", label: "Giáo viên" },
  { key: "ADMIN", label: "Admin" },
];

/** Username is not asked in the design: derive it from the email local part, unique, >= 5 chars. */
function deriveUsername(email: string, taken: Set<string>): string {
  let base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9._]/g, "");
  if (base.length < 5) base = (base + "user").slice(0, 8);
  base = base.slice(0, 44);
  let name = base;
  for (let i = 2; taken.has(name); i++) name = `${base}${i}`;
  return name;
}

/** 12 chars, always has a letter and a digit (backend PASSWORD_PATTERN). */
function tempPassword(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const all = letters + digits;
  const buf = crypto.getRandomValues(new Uint32Array(12));
  const chars = Array.from(buf, (n) => all[n % all.length]);
  chars[0] = letters[buf[0] % letters.length];
  chars[1] = digits[buf[1] % digits.length];
  return chars.sort(() => 0.5 - Math.random()).join("");
}

function CreateUserDrawer({ existing, onClose }: { existing: UserSummaryResponse[]; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "STUDENT" as (typeof NEW_ROLES)[number]["key"] });
  const [tried, setTried] = useState(false);

  const emailTaken = existing.some((u) => u.email?.toLowerCase() === form.email.trim().toLowerCase());
  const errs = {
    name: nameSchema.safeParse(form.name).error?.issues[0]?.message ?? "",
    email: emailSchema.safeParse(form.email).error?.issues[0]?.message || (emailTaken ? "Email đã được dùng cho tài khoản khác." : ""),
    phone: phoneSchema.safeParse(form.phone).error?.issues[0]?.message ?? "",
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const email = form.email.trim().toLowerCase();
      const taken = new Set(existing.map((u) => u.username.toLowerCase()));
      const created = await createUser({
        username: deriveUsername(email, taken),
        password: tempPassword(),
        email,
        fullName: form.name.trim(),
        phone: normalizePhone(form.phone) || undefined,
        status: "ACTIVE",
      });
      const roles = await getRoles();
      const role = roles.data?.find((r) => r.code === form.role);
      let roleAssigned = Boolean(role);
      if (role) {
        try {
          await assignRoleToUser(created.data.id, role.id);
        } catch {
          roleAssigned = false;
        }
      }
      return { created, roleAssigned };
    },
    onSuccess: ({ roleAssigned }) => {
      toast.success(`Đã tạo tài khoản cho ${form.name.trim()}. Đã gửi mã đặt mật khẩu tới ${form.email.trim()}.`);
      if (!roleAssigned) toast.warning("Chưa gán được vai trò, hãy gán ở trang Quản lý vai trò.");
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Không tạo được người dùng")),
  });

  const set = (k: "name" | "email" | "phone") => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const hasErr = Boolean(errs.name || errs.email || errs.phone);

  const fields: { k: "name" | "email" | "phone"; label: string; ph: string; type?: string }[] = [
    { k: "name", label: "Họ và tên", ph: "vd. Nguyễn Văn A" },
    { k: "email", label: "Email", ph: "vd. vana@gmail.com", type: "email" },
    { k: "phone", label: "Số điện thoại (tuỳ chọn)", ph: "vd. 0912345678", type: "tel" },
  ];

  return (
    <Drawer title="Thêm người dùng" onClose={onClose} accent>
      <form
        className="flex flex-col gap-3.5"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (hasErr) return setTried(true);
          mutation.mutate();
        }}
      >
        {fields.map((f) => (
          <div key={f.k}>
            <label className={labelClass}>{f.label}</label>
            <input
              className={`${fieldClass} ${tried && errs[f.k] ? fieldErrClass : ""}`}
              type={f.type ?? "text"}
              placeholder={f.ph}
              value={form[f.k]}
              onChange={set(f.k)}
              autoComplete="off"
            />
            {tried && errs[f.k] ? <p className="mt-1 text-xs font-semibold text-rose-600">{errs[f.k]}</p> : null}
          </div>
        ))}
        <div>
          <label className={labelClass}>Vai trò</label>
          <Segmented value={form.role} onChange={(role) => setForm((f) => ({ ...f, role }))} options={NEW_ROLES} />
        </div>
        <p className="text-xs text-slate-500">Tài khoản được tạo ở trạng thái hoạt động và hệ thống gửi mã đặt mật khẩu tới email này (người dùng nhập mã ở màn “Quên mật khẩu”). Chuyên môn giáo viên gán ở trang chi tiết người dùng.</p>
        <div className="mt-1 flex gap-2">
          <button type="submit" disabled={mutation.isPending} className={primaryBtn}>
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
