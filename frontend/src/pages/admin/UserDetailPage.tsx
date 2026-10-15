import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import { BackLink, fieldClass, fieldErrClass, labelClass, outlineBtn, primaryBtn, surfaceClass } from "@/shared/components/PageHeader.tsx";
import { Tag } from "@/shared/components/ui/Tag.tsx";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import { useQueryErrorMessage } from "@/shared/hooks/useQueryErrorMessage.ts";
import { assignRoleToUser, getRoles, getUserById, getUserEffectiveRoles, getUsers, removeRoleFromUser, updateUser } from "@/features/admin/adminApi.ts";
import { getCoursesByTeacherUserId, getTeacherByUserId, setTeacherCategories } from "@/features/teachers/teachersApi.ts";
import { getUserEnrollments } from "@/features/courses/courseApi.ts";
import { STATUS_TAG, fmtDate } from "@/features/courses/classUi.ts";
import { scheduleText } from "@/features/courses/scheduleUi.ts";
import { categoryColors, useCategories } from "@/features/categories/useCategories.ts";
import { useAuth } from "@/features/auth/useAuth.ts";
import { forgotPassword } from "@/features/auth/authApi.ts";
import type { UserStatus, UserSummaryResponse } from "@/features/admin/types.ts";
import {
  AVATAR,
  DUPLICATE_EMAIL_MSG,
  STATUS_META,
  emailSchema,
  formatDate,
  initialOf,
  nameSchema,
  normalizePhone,
  phoneSchema,
  primaryGroup,
  roleLabel,
  roleTagStyle,
} from "@/features/admin/userUi.ts";

const SYSTEM_ROLES = ["ADMIN", "TEACHER", "STUDENT"];

type Form = { fullName: string; phone: string; email: string; username: string };

const toForm = (u: UserSummaryResponse): Form => ({ fullName: u.fullName ?? "", phone: u.phone ?? "", email: u.email ?? "", username: u.username });

export default function UserDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ["user-detail", id],
    queryFn: async () => {
      const [user, roles] = await Promise.all([getUserById(id), getUserEffectiveRoles(id)]);
      return { user: user.data, roles: [...new Set(roles.data.effectiveRoles.map((r) => r.code as string))] };
    },
    enabled: id.length > 0,
  });
  const { data: allUsers } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const loadError = useQueryErrorMessage(queryError, "Không tải được người dùng");

  const user = data?.user ?? null;
  const roles = data?.roles ?? [];
  const isTeacher = roles.some((r) => r.startsWith("TEACHER"));
  const isStudentOnly = roles.includes("STUDENT") && !isTeacher;

  const { data: classesRes } = useQuery({
    queryKey: ["user-detail", id, "courses"],
    queryFn: () => getCoursesByTeacherUserId(id).catch(() => ({ status: 200, message: "", data: [] })),
    enabled: isTeacher,
  });
  const classes = classesRes?.data ?? [];

  const { user: me } = useAuth();
  const isSelf = me?.id === id;

  const roleMutation = useMutation({
    mutationFn: async ({ code, add }: { code: string; add: boolean }) => {
      const all = (await getRoles()).data;
      const role = all.find((r) => r.code === code);
      if (!role) throw new Error(`Chưa có vai trò ${code} trên hệ thống`);
      return add ? assignRoleToUser(id, role.id) : removeRoleFromUser(id, role.id);
    },
    onSuccess: () => {
      toast.success("Đã cập nhật vai trò");
      void queryClient.invalidateQueries({ queryKey: ["user-detail", id] });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Không cập nhật được vai trò")),
  });

  const { data: enrollments } = useQuery({
    queryKey: ["user-detail", id, "enrollments"],
    queryFn: () => getUserEnrollments(id),
    enabled: roles.includes("STUDENT"),
  });
  const activeEnrollments = (enrollments ?? []).filter((e) => e.enrollmentStatus === "ACTIVE");

  const { data: teacherRes } = useQuery({
    queryKey: ["teachers", "by-user", id],
    queryFn: () => getTeacherByUserId(id),
    enabled: isTeacher,
    retry: false,
  });
  const teacher = teacherRes?.data ?? null;
  const { categories, categoryById } = useCategories();
  const [specDraft, setSpecDraft] = useState<string[] | null>(null);
  const specialties = specDraft ?? teacher?.categoryIds ?? [];
  const specDirty = specDraft !== null && teacher !== null && (specDraft.length !== teacher.categoryIds.length || specDraft.some((x) => !teacher.categoryIds.includes(x)));
  const specMutation = useMutation({
    mutationFn: () => setTeacherCategories(teacher!.id, specialties),
    onSuccess: () => {
      toast.success("Đã lưu chuyên môn giáo viên");
      setSpecDraft(null);
      void queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Không lưu được chuyên môn")),
  });

  const [draft, setDraft] = useState<Form | null>(null);
  const [tried, setTried] = useState(false);
  const [serverEmailErr, setServerEmailErr] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (v: { form: Form; status?: UserStatus }) =>
      updateUser(id, {
        username: v.form.username.trim(),
        email: v.form.email.trim().toLowerCase(),
        fullName: v.form.fullName.trim(),
        phone: normalizePhone(v.form.phone) || undefined,
        status: v.status ?? user?.status ?? undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user-detail", id] });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const resetMutation = useMutationReset(user?.email ?? null);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className={`${surfaceClass} px-6 py-8 text-slate-500`}>Đang tải…</div>
      </AdminLayout>
    );
  }
  if (!user) {
    return (
      <AdminLayout>
        <BackLink to="/admin/users">Người dùng</BackLink>
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">{loadError ?? "Không tìm thấy người dùng."}</div>
      </AdminLayout>
    );
  }

  const form = draft ?? toForm(user);
  const base = toForm(user);
  const dirty = (Object.keys(base) as (keyof Form)[]).some((k) => form[k] !== base[k]);
  const emailChanged = form.email.trim().toLowerCase() !== (user.email ?? "").toLowerCase();
  const emailDup =
    serverEmailErr ||
    (emailChanged && (allUsers?.data ?? []).some((x) => x.id !== user.id && x.email?.toLowerCase() === form.email.trim().toLowerCase()));

  const errs = {
    fullName: nameSchema.safeParse(form.fullName).error?.issues[0]?.message ?? "",
    email: emailSchema.safeParse(form.email).error?.issues[0]?.message || (emailDup ? DUPLICATE_EMAIL_MSG : ""),
    phone: phoneSchema.safeParse(form.phone).error?.issues[0]?.message ?? "",
    username:
      form.username.trim().length < 5 || form.username.trim().length > 50 || /\s/.test(form.username)
        ? "Tên đăng nhập 5–50 ký tự, không có khoảng trắng."
        : "",
  };
  const firstErr = errs.fullName || errs.phone || errs.email || errs.username;

  const set = (k: keyof Form, v: string) => {
    if (k === "email") setServerEmailErr(false);
    setDraft({ ...form, [k]: v });
  };

  const save = () => {
    if (!dirty) return;
    if (firstErr) return setTried(true);
    saveMutation.mutate(
      { form },
      {
        onSuccess: () => {
          setDraft(null);
          setTried(false);
          toast.success(`Đã lưu thông tin ${form.fullName.trim()}`);
        },
        onError: (e) => {
          const msg = getApiErrorMessage(e, "Không lưu được thông tin");
          if (axios.isAxiosError(e) && /email/i.test(msg)) {
            setServerEmailErr(true);
            setTried(true);
          } else toast.error(msg);
        },
      },
    );
  };

  const locked = user.status === "LOCKED";
  const st = user.status ? STATUS_META[user.status] : null;
  const av = AVATAR[primaryGroup(roles)];
  const display = user.fullName || user.username;

  const toggleLock = () =>
    saveMutation.mutate(
      { form: toForm(user), status: locked ? "ACTIVE" : "LOCKED" },
      {
        onSuccess: () => toast.success(`${locked ? "Đã mở khoá" : "Đã khoá"} ${display}`),
        onError: (e) => toast.error(getApiErrorMessage(e, "Không cập nhật được trạng thái")),
      },
    );

  const fields: { k: keyof Form; label: string; type?: string }[] = [
    { k: "fullName", label: "Họ và tên" },
    { k: "phone", label: "Số điện thoại", type: "tel" },
    { k: "email", label: "Email", type: "email" },
    { k: "username", label: "Tên đăng nhập" },
  ];

  return (
    <AdminLayout>
      <div className="mb-3">
        <BackLink to="/admin/users">Người dùng</BackLink>
      </div>

      <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span style={{ background: av.bg, color: av.fg }} className="grid size-14 shrink-0 place-items-center rounded-full text-xl font-black">
            {initialOf(display)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="truncate text-[clamp(24px,3vw,30px)] font-black tracking-tight text-slate-950">{display}</h1>
              {st ? (
                <Tag width={120} bg={st.bg} fg={st.fg}>
                  {st.label}
                </Tag>
              ) : null}
            </div>
            <p className="text-[13px] font-semibold text-slate-500">
              @{user.username} · tạo ngày {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={outlineBtn} disabled={!user.email || resetMutation.isPending} onClick={() => resetMutation.mutate()}>
            Gửi link đặt lại mật khẩu
          </button>
          <button
            type="button"
            disabled={saveMutation.isPending || isSelf}
            title={isSelf ? "Bạn không thể tự khoá tài khoản của mình" : undefined}
            onClick={toggleLock}
            className={`${outlineBtn} ${locked ? "!border-emerald-200 !text-emerald-600" : "!border-rose-200 !text-rose-600"}`}
          >
            {locked ? "Mở khoá tài khoản" : "Khoá tài khoản"}
          </button>
        </div>
      </header>

      <div className="grid items-start gap-5 min-[1100px]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-5">
          <section className={`${surfaceClass} p-[22px]`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[17px] font-black tracking-tight">Thông tin tài khoản</h2>
              <span className={`text-xs font-extrabold ${dirty ? "text-amber-800" : "text-emerald-600"}`}>{dirty ? "Có thay đổi chưa lưu" : "Đã lưu"}</span>
            </div>
            <form
              noValidate
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              {fields.map((f) => (
                <div key={f.k}>
                  <label className={labelClass}>{f.label}</label>
                  <input
                    className={`${fieldClass} ${tried && errs[f.k] ? fieldErrClass : ""}`}
                    type={f.type ?? "text"}
                    value={form[f.k]}
                    onChange={(e) => set(f.k, e.target.value)}
                    autoComplete="off"
                  />
                  {tried && errs[f.k] ? <p className="mt-1 text-xs font-semibold text-rose-600">{errs[f.k]}</p> : null}
                  {f.k === "email" && emailChanged && !errs.email ? (
                    <p className="mt-1 text-xs font-semibold text-amber-800">Sau khi lưu, hệ thống gửi mã xác thực tới email mới. Người dùng chưa đăng nhập được cho tới khi xác thực email này.</p>
                  ) : null}
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                <button type="submit" disabled={saveMutation.isPending} style={{ opacity: dirty ? 1 : 0.45 }} className={primaryBtn}>
                  {saveMutation.isPending ? "Đang lưu…" : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  style={{ opacity: dirty ? 1 : 0.45 }}
                  className={outlineBtn}
                  onClick={() => {
                    setDraft(null);
                    setTried(false);
                    setServerEmailErr(false);
                  }}
                >
                  Huỷ
                </button>
                {tried && firstErr ? <span className="text-xs font-semibold text-rose-600">{firstErr}</span> : null}
              </div>
            </form>
          </section>

          <section className={`${surfaceClass} p-[22px]`}>
            <h2 className="mb-1 text-[17px] font-black tracking-tight">Vai trò</h2>
            <p className="mb-3 text-[13px] text-slate-500">Chỉ có 3 vai trò hệ thống. Chuyên môn của giáo viên được gán bằng danh mục bên dưới.</p>
            <div className="flex flex-wrap gap-2">
              {SYSTEM_ROLES.map((code) => {
                const on = roles.includes(code);
                const c = roleTagStyle(code);
                return (
                  <button
                    key={code}
                    type="button"
                    disabled={roleMutation.isPending || (isSelf && code === "ADMIN" && on)}
                    title={isSelf && code === "ADMIN" && on ? "Không thể tự gỡ vai trò Admin của mình" : undefined}
                    onClick={() => roleMutation.mutate({ code, add: !on })}
                    style={on ? { background: c.bg, color: c.fg } : undefined}
                    className={`rounded-full px-4 py-1.5 text-[13px] font-extrabold disabled:opacity-50 ${on ? "" : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"}`}
                  >
                    {on ? "✓ " : "+ "}
                    {roleLabel(code)}
                  </button>
                );
              })}
              {roles
                .filter((r) => !SYSTEM_ROLES.includes(r))
                .map((r) => {
                  const c = roleTagStyle(r);
                  return (
                    <Tag key={r} bg={c.bg} fg={c.fg} title={`${r} (vai trò cũ)`} className="!px-3">
                      {roleLabel(r)}
                    </Tag>
                  );
                })}
            </div>
          </section>

          {isTeacher ? (
            <section className={`${surfaceClass} p-[22px]`}>
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[17px] font-black tracking-tight">Chuyên môn giảng dạy</h2>
                <Link to="/admin/categories" className="text-[13px] font-bold text-slate-600 underline underline-offset-4 hover:opacity-70">
                  Quản lý danh mục
                </Link>
              </div>
              <p className="mb-3 text-[13px] text-slate-500">Giáo viên chỉ được gán vào lớp thuộc danh mục nằm trong chuyên môn này.</p>
              {!teacher ? (
                <p className="text-sm text-slate-500">Chưa có hồ sơ giáo viên.</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-slate-500">Chưa có danh mục nào. Tạo danh mục trước.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((c) => {
                      const on = specialties.includes(c.id);
                      const col = categoryColors(c.color);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setSpecDraft(on ? specialties.filter((x) => x !== c.id) : [...specialties, c.id])}
                          style={on ? { background: col.bg, color: col.fg, borderColor: col.solid } : undefined}
                          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-bold ${on ? "" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}
                        >
                          {on ? "✓ " : ""}
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex gap-2" style={{ opacity: specDirty ? 1 : 0.45 }}>
                    <button type="button" className={primaryBtn} disabled={!specDirty || specMutation.isPending} onClick={() => specMutation.mutate()}>
                      {specMutation.isPending ? "Đang lưu…" : "Lưu chuyên môn"}
                    </button>
                    <button type="button" className={outlineBtn} disabled={!specDirty} onClick={() => setSpecDraft(null)}>
                      Huỷ
                    </button>
                  </div>
                </>
              )}
            </section>
          ) : null}
        </div>

        <section className={`${surfaceClass} p-[22px]`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-black tracking-tight">{isStudentOnly ? "Lớp đang học" : "Lớp phụ trách"}</h2>
            {isTeacher ? <span className="text-xs font-bold text-slate-500">{classes.length} lớp</span> : null}
            {isStudentOnly ? <span className="text-xs font-bold text-slate-500">{activeEnrollments.length} lớp</span> : null}
          </div>
          {isStudentOnly ? (
            activeEnrollments.length === 0 ? (
              <p className="text-sm text-slate-500">Học viên chưa ghi danh lớp nào. Thêm học viên ở trang chi tiết lớp.</p>
            ) : (
              <ul>
                {activeEnrollments.map((e) => {
                  const c = e.course;
                  const st = STATUS_TAG[c.status];
                  const cat = categoryById(c.categoryId);
                  const sched = scheduleText(c);
                  return (
                    <li key={e.enrollmentId} className="border-b border-dashed border-[#eef2f6] last:border-b-0">
                      <button type="button" onClick={() => navigate(`/admin/classes/${c.id}`)} className="flex w-full items-center justify-between gap-3 rounded-xl px-1 py-3 text-left hover:bg-slate-50">
                        <span className="min-w-0">
                          <span className="block truncate font-extrabold text-slate-950">{c.name}</span>
                          <span className="block truncate text-xs text-slate-500">
                            {c.code}
                            {cat ? ` · ${cat.name}` : ""}
                            {sched ? ` · ${sched}` : ""} · ghi danh {fmtDate(e.enrollDate)}
                          </span>
                        </span>
                        <Tag bg={st.bg} fg={st.fg} width={110}>
                          {st.label}
                        </Tag>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )
          ) : classes.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa phụ trách lớp nào.</p>
          ) : (
            <ul>
              {classes.map((c) => (
                <li key={c.id} className="border-b border-dashed border-[#eef2f6] last:border-b-0">
                  <button type="button" onClick={() => navigate(`/admin/classes/${c.id}`)} className="flex w-full items-center justify-between gap-3 rounded-xl px-1 py-3 text-left hover:bg-slate-50">
                    <span className="min-w-0">
                      <span className="block truncate font-extrabold text-slate-950">{c.name}</span>
                      <span className="block text-xs text-slate-500">{c.code}</span>
                    </span>
                    <span className="text-slate-400">›</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

/** "Gửi link đặt lại mật khẩu": the backend flow emails a 6-digit reset code via the public forgot-password endpoint. */
function useMutationReset(email: string | null) {
  return useMutation({
    mutationFn: () => forgotPassword(email ?? ""),
    onSuccess: () => toast.success(`Đã gửi mã đặt lại mật khẩu tới ${email}`),
    onError: (e) => toast.error(getApiErrorMessage(e, "Không gửi được email đặt lại mật khẩu")),
  });
}
