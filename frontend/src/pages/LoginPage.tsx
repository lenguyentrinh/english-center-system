import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/shared/components/layout/AuthLayout.tsx";
import { login, probeAdminAccess } from "@/features/auth/authApi.ts";
import {
  clearCurrentUsername,
  setCurrentDisplayName,
  setCurrentUsername,
} from "@/features/auth/authIdentity.ts";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import {
  clearAdminAccessState,
  setAdminAccessState,
  setAuthenticated,
} from "@/features/auth/authSession.ts";
import { getUsers } from "@/features/admin/adminApi.ts";
import {
  loginSchema,
  type LoginForm,
} from "@/features/auth/validation/authSchema.ts";

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginForm) => {
    const username = values.username.trim();

    try {
      const res = await login({
        username,
        password: values.password,
      });
      toast.success(res.message);
      setAuthenticated(true);
      setCurrentUsername(username);
      setCurrentDisplayName(username);

      const isAdmin = await probeAdminAccess();
      setAdminAccessState(isAdmin);

      if (isAdmin) {
        try {
          const usersRes = await getUsers();
          const currentUser = usersRes.data.find((user) => user.username === username);
          setCurrentDisplayName(currentUser?.fullName?.trim() || currentUser?.username || username);
        } catch {
          setCurrentDisplayName(username);
        }
      } else {
        clearAdminAccessState();
      }

      navigate("/");
    } catch (error: unknown) {
      setAuthenticated(false);
      clearCurrentUsername();
      clearAdminAccessState();
      toast.error(getApiErrorMessage(error, "Login failed"));
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-slate-900">Login</h1>
      <p className="mt-1 text-sm text-slate-600">Use your account to continue.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1">
          <label htmlFor="username" className="text-sm font-medium text-slate-700">
            Username
          </label>
          <input
            id="username"
            autoComplete="username"
            {...register("username")}
            className="w-full rounded-lg border border-slate-200 shadow-sm px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="text-xs text-red-500">{errors.username?.message}</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="w-full rounded-lg border border-slate-200 shadow-sm px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="text-xs text-red-500">{errors.password?.message}</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        No account yet?{" "}
        <Link to="/auth/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
