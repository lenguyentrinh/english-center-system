import axios from "axios";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import AuthLayout from "@/shared/components/layout/AuthLayout.tsx";
import PageLoader from "@/shared/components/PageLoader.tsx";
import { fetchMe, login } from "@/features/auth/authApi.ts";
import { AUTH_QUERY_KEY } from "@/features/auth/authKeys.ts";
import { safeReturnPath } from "@/features/auth/safeReturnPath.ts";
import { useAuth } from "@/features/auth/useAuth.ts";
import { homePathForRoles } from "@/shared/utils/role.ts";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import {
  loginSchema,
  type LoginForm,
} from "@/features/auth/validation/authSchema.ts";
import { InputField } from "@/shared/components/form";
import Button from "@/shared/components/Button.tsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { user: sessionUser, isLoading, isAuthenticated } = useAuth();
  const returnParam = safeReturnPath(searchParams.get("return"));
  const returnTo = returnParam ?? homePathForRoles(sessionUser?.roles);

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
    mode: "onTouched",
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      const res = await login({
        username: values.username.trim(),
        password: values.password,
      });
      // Fetch the session now so the destination page already knows who is signed in.
      const user = await queryClient.fetchQuery({ queryKey: AUTH_QUERY_KEY, queryFn: fetchMe, staleTime: 0 });
      toast.success(res.message);
      navigate(user ? (returnParam ?? homePathForRoles(user.roles)) : "/", { replace: true });
    } catch (error: unknown) {
      // Correct password but unverified email: continue on the verification page, which sends a fresh code.
      if (axios.isAxiosError(error) && error.response?.data?.origin === "email-not-verified") {
        const email = values.username.includes("@") ? values.username.trim() : "";
        toast.info("Please verify your email to continue.");
        navigate("/auth/verify-email", { state: { email, autoSend: true } });
        return;
      }
      toast.error(getApiErrorMessage(error, "Login failed"));
    }
  };

  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to={returnTo} replace />;

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-slate-900">Login</h1>
      <p className="mt-1 text-sm text-slate-600">Use your account to continue.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label="Username or email"
          placeholder="Username or email"
          autoComplete="username"
          {...register("username")}
          error={errors.username?.message}
          id="username"
          required={true}
        />

        <InputField
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
          id="password"
          required={true}
        />

        <div className="text-right">
          <Link to="/auth/forgot-password" className="text-sm font-medium text-indigo-600 underline hover:text-indigo-500">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="large" className="w-full" loading={isSubmitting}>
          Login
        </Button>
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
