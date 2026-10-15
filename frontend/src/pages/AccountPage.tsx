import { useState, type ReactNode } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import PublicLayout from "@/shared/components/layout/PublicLayout.tsx";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import TeacherLayout from "@/shared/components/layout/TeacherLayout.tsx";
import StudentLayout from "@/shared/components/layout/StudentLayout.tsx";
import MemberCard from "@/shared/components/MemberCard.tsx";
import Modal from "@/shared/components/Modal.tsx";
import PageHeader, { fieldClass, fieldErrClass, labelClass, outlineBtn, primaryBtn, surfaceClass } from "@/shared/components/PageHeader.tsx";
import { Tag } from "@/shared/components/ui/Tag.tsx";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import { roleColors, roleLabel } from "@/shared/utils/role.ts";
import { changePassword } from "@/features/auth/authApi.ts";
import { AUTH_QUERY_KEY } from "@/features/auth/authKeys.ts";
import { useAuth } from "@/features/auth/useAuth.ts";
import { changePasswordSchema, type ChangePasswordForm } from "@/features/auth/validation/authSchema.ts";
import { updateUser } from "@/features/admin/adminApi.ts";
import type { AuthUser } from "@/features/auth/types.ts";

// Mirrors UserUpdateRequest (username 5-50, fullName 5-50, phone 0xxxxxxxxx).
const profileSchema = z.object({
  fullName: z.string().trim().min(5, "Họ và tên cần 5–50 ký tự.").max(50, "Họ và tên cần 5–50 ký tự."),
  username: z
    .string()
    .trim()
    .regex(/^\S*$/, "Tên đăng nhập không được chứa khoảng trắng.")
    .min(5, "Tên đăng nhập cần 5–50 ký tự.")
    .max(50, "Tên đăng nhập cần 5–50 ký tự."),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || /^0\d{9}$/.test(v.replace(/\s/g, "")), "Số điện thoại gồm 10 số, bắt đầu bằng 0."),
});
type ProfileForm = z.infer<typeof profileSchema>;

const CARD_TITLE = { admin: "Thẻ quản trị", teacher: "Thẻ giáo viên", student: "Thẻ học viên" } as const;

/** Account sits inside the role workspace (header + sidebar + footer); users with no workspace role get the public layout. */
function Shell({ kind, children }: { kind: "admin" | "teacher" | "student" | null; children: ReactNode }) {
  if (kind === "admin") return <AdminLayout>{children}</AdminLayout>;
  if (kind === "teacher") return <TeacherLayout>{children}</TeacherLayout>;
  if (kind === "student") return <StudentLayout>{children}</StudentLayout>;
  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</div>
    </PublicLayout>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: (v: ChangePasswordForm) => changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword }),
    onSuccess: () => {
      toast.success("Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.");
      onClose();
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Không đổi được mật khẩu")),
  });

  const fields = [
    ["currentPassword", "Mật khẩu hiện tại", "current-password"],
    ["newPassword", "Mật khẩu mới", "new-password"],
    ["confirmPassword", "Nhập lại mật khẩu mới", "new-password"],
  ] as const;

  return (
    <Modal isOpen title="Đổi mật khẩu" onClose={onClose} widthClassName="max-w-md">
      <form className="flex flex-col gap-3.5" noValidate onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        {fields.map(([key, label, ac]) => (
          <div key={key}>
            <label htmlFor={key} className={labelClass}>
              {label}
            </label>
            <input id={key} type="password" autoComplete={ac} className={`${fieldClass} ${errors[key] ? fieldErrClass : ""}`} {...register(key)} />
            {errors[key] ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors[key]?.message}</p> : null}
          </div>
        ))}
        <p className="text-xs text-slate-500">Mật khẩu từ 6 ký tự, gồm chữ và số. Các thiết bị khác sẽ bị đăng xuất.</p>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className={outlineBtn} onClick={onClose}>
            Huỷ
          </button>
          <button type="submit" className={primaryBtn} disabled={mutation.isPending}>
            {mutation.isPending ? "Đang lưu…" : "Đổi mật khẩu"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ProfileCard({ user }: { user: AuthUser }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user.fullName ?? "", username: user.username, phone: user.phone ?? "" },
  });
  const { register, handleSubmit, reset, formState: { errors } } = form;

  const mutation = useMutation({
    // The admin-only fields (status/email) are not editable here: email is sent unchanged, status is omitted.
    mutationFn: (v: ProfileForm) =>
      updateUser(user.id, {
        username: v.username.trim(),
        email: user.email,
        fullName: v.fullName.trim(),
        phone: v.phone.replace(/\s/g, "") || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      toast.success("Đã lưu thông tin");
      setEditing(false);
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Không lưu được thông tin")),
  });

  const cancel = () => {
    reset({ fullName: user.fullName ?? "", username: user.username, phone: user.phone ?? "" });
    setEditing(false);
  };

  const rows: { key: "fullName" | "username" | "email" | "phone"; label: string; glyph: string; value: string }[] = [
    { key: "fullName", label: "Họ và tên", glyph: "Aa", value: user.fullName },
    { key: "username", label: "Tên đăng nhập", glyph: "@", value: user.username },
    { key: "email", label: "Email", glyph: "✉", value: user.email },
    { key: "phone", label: "Số điện thoại", glyph: "☏", value: user.phone ?? "" },
  ];

  return (
    <section className={`${surfaceClass} p-5`}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-black">Thông tin cá nhân</h2>
        {editing ? null : (
          <button type="button" className={outlineBtn} onClick={() => setEditing(true)}>
            Chỉnh sửa
          </button>
        )}
      </div>
      <form noValidate onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        {rows.map((r, i) => {
          const locked = r.key === "email";
          const err = r.key !== "email" ? errors[r.key]?.message : undefined;
          return (
            <div key={r.key} className={`flex items-center gap-3.5 py-3 ${i ? "border-t border-dashed border-slate-200" : ""}`}>
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-[13px] font-black ${locked ? "bg-slate-100 text-slate-500" : "bg-cyan-50 text-cyan-700"}`}>{r.glyph}</span>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-500">{r.label}</span>
                {editing && !locked ? (
                  <>
                    <input className={`${fieldClass} mt-1 ${err ? fieldErrClass : ""}`} aria-label={r.label} {...register(r.key as "fullName" | "username" | "phone")} />
                    {err ? <span className="mt-1 block text-xs font-semibold text-rose-600">{err}</span> : null}
                  </>
                ) : (
                  <span className="block truncate text-sm font-bold text-slate-950">{r.value || "—"}</span>
                )}
              </div>
              {locked ? <Tag bg="#f1f5f9" fg="#64748b">Cố định</Tag> : null}
            </div>
          );
        })}
        {editing ? (
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" className={outlineBtn} onClick={cancel}>
              Huỷ
            </button>
            <button type="submit" className={primaryBtn} disabled={mutation.isPending}>
              {mutation.isPending ? "Đang lưu…" : "Lưu"}
            </button>
          </div>
        ) : null}
      </form>
    </section>
  );
}

export default function AccountPage() {
  const { user, isAdmin, isTeacher } = useAuth();
  const [pwOpen, setPwOpen] = useState(false);

  // The route is wrapped in RequireAuth, so `user` is always present here.
  if (!user) return null;

  const kind = isAdmin ? "admin" : isTeacher ? "teacher" : user.roles.includes("STUDENT") ? "student" : null;
  const name = user.fullName || user.username;
  const code = `EC-${user.id.slice(-6).toUpperCase()}`;

  return (
    <Shell kind={kind}>
      <PageHeader crumb="Tài khoản" title="Tài khoản của tôi" />
      <div className="grid items-start gap-6 min-[1100px]:grid-cols-[380px_minmax(0,1fr)]">
        <MemberCard title={CARD_TITLE[kind ?? "student"]} name={name} username={user.username} roles={user.roles} code={code} />

        <div className="flex min-w-0 flex-col gap-5">
          <section className={`${surfaceClass} flex flex-wrap items-center justify-between gap-3 p-5`}>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-black">Mật khẩu</h2>
              <span className="text-[13px] text-slate-500">Đổi mật khẩu định kỳ để bảo vệ tài khoản.</span>
            </div>
            <button type="button" className={outlineBtn} onClick={() => setPwOpen(true)}>
              Đổi
            </button>
          </section>

          <ProfileCard user={user} />

          <section className={`${surfaceClass} p-5`}>
            <h2 className="mb-3 text-base font-black">Vai trò &amp; chuyên môn</h2>
            {user.roles.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có vai trò nào.</p>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {user.roles.map((r) => {
                  const c = roleColors(r);
                  return (
                    <div key={r} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3.5 py-3">
                      <Tag bg={c.bg} fg={c.fg} width={96}>
                        {roleLabel(r)}
                      </Tag>
                      <span className="truncate text-xs font-semibold text-slate-500">{r}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
      {pwOpen ? <PasswordModal onClose={() => setPwOpen(false)} /> : null}
    </Shell>
  );
}
