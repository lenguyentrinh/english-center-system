import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import PublicLayout from "@/shared/components/layout/PublicLayout.tsx";
import Button from "@/shared/components/Button.tsx";
import { InputField } from "@/shared/components/form";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import { changePassword } from "@/features/auth/authApi.ts";
import { useAuth } from "@/features/auth/useAuth.ts";
import {
  changePasswordSchema,
  type ChangePasswordForm,
} from "@/features/auth/validation/authSchema.ts";

function ChangePasswordSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordForm) =>
      changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    onSuccess: (res) => {
      toast.success(`${res.message}. Other devices have been signed out.`);
      reset();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Could not change the password")),
  });

  return (
    <form className="mt-4 max-w-md space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
      <InputField
        label="Current password"
        type="password"
        autoComplete="current-password"
        {...register("currentPassword")}
        error={errors.currentPassword?.message}
        id="currentPassword"
        required={true}
      />
      <InputField
        label="New password"
        type="password"
        autoComplete="new-password"
        {...register("newPassword")}
        error={errors.newPassword?.message}
        id="newPassword"
        required={true}
      />
      <InputField
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
        id="confirmPassword"
        required={true}
      />
      <Button type="submit" loading={mutation.isPending}>
        Change password
      </Button>
    </form>
  );
}

export default function AccountPage() {
  const { user, isAdmin } = useAuth();

  // The route is wrapped in RequireAuth, so `user` is always present here.
  if (!user) return null;

  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            My Account
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {user.fullName || user.username}
          </h1>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="min-w-0 rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Username</p>
              <p className="mt-2 truncate text-sm font-semibold text-slate-950" title={user.username}>{user.username}</p>
            </div>
            <div className="min-w-0 rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Email</p>
              <p className="mt-2 truncate text-sm font-semibold text-slate-950" title={user.email}>{user.email || "-"}</p>
            </div>
            <div className="min-w-0 rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Phone</p>
              <p className="mt-2 truncate text-sm font-semibold text-slate-950">{user.phone || "-"}</p>
            </div>
            <div className="min-w-0 rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Roles</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{user.roles.join(", ") || "-"}</p>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-100 pt-8">
            <h2 className="text-lg font-semibold text-slate-950">Change password</h2>
            <p className="mt-1 text-sm text-slate-600">
              You will stay signed in here; every other device is signed out.
            </p>
            <ChangePasswordSection />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/courses"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse Courses
            </Link>
            {isAdmin ? (
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
