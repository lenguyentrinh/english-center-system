import axios from "axios";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
import { AuthBanner, AuthButton, AuthField, AuthHeading, authLinkClass, type BannerData } from "@/features/auth/components/AuthUi.tsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const notice = (useLocation().state as { notice?: BannerData } | null)?.notice;
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
        toast.info("Vui lòng xác nhận email để tiếp tục.");
        navigate("/auth/verify-email", { state: { email, autoSend: true } });
        return;
      }
      toast.error(getApiErrorMessage(error, "Đăng nhập không thành công. Vui lòng thử lại."));
    }
  };

  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to={returnTo} replace />;

  return (
    <AuthLayout cardTag="Thẻ 1 · đăng nhập" cardIpa="/rɪˈtɜːn/ · trở lại">
      <AuthHeading title="Đăng nhập">Dùng tài khoản trung tâm cấp để tiếp tục.</AuthHeading>

      {notice ? <AuthBanner {...notice} /> : null}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          label="Tên đăng nhập hoặc email"
          placeholder="vd. minhanh hoặc minhanh@gmail.com"
          autoComplete="username"
          {...register("username")}
          error={errors.username?.message}
          id="username"
        />

        <AuthField
          label="Mật khẩu"
          type="password"
          placeholder="Ít nhất 6 ký tự"
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
          id="password"
          hint={
            <Link to="/auth/forgot-password" className={`text-[13px] ${authLinkClass}`}>
              Quên mật khẩu?
            </Link>
          }
        />

        <AuthButton loading={isSubmitting} loadingText="Đang đăng nhập…">
          Đăng nhập
        </AuthButton>
      </form>

      <p className="text-sm font-semibold text-slate-500">
        Chưa có tài khoản?{" "}
        <Link to="/auth/signup" className={authLinkClass}>
          Tạo tài khoản
        </Link>
      </p>
    </AuthLayout>
  );
}
