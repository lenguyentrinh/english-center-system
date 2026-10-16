import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signup } from "@/features/auth/authApi.ts";
import AuthLayout from "@/shared/components/layout/AuthLayout.tsx";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import {
  signupSchema,
  type SignupForm,
} from "@/features/auth/validation/authSchema.ts";
import { AuthButton, AuthField, AuthHeading, authLinkClass } from "@/features/auth/components/AuthUi.tsx";

export default function SignupPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
      phone: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: SignupForm) => {
    try {
      const email = values.email.trim();
      const res = await signup({
        username: values.username.trim(),
        password: values.password,
        email,
        fullName: values.fullName.trim(),
        phone: values.phone?.trim() ? values.phone.trim() : undefined,
      });
      toast.success(res.message);
      navigate("/auth/verify-email", { state: { email } });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Đăng ký không thành công. Vui lòng thử lại."));
    }
  };


  const row = "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3";

  return (
    <AuthLayout cardTag="Thẻ mới · đăng ký" cardIpa="/bɪˈɡɪn/ · bắt đầu">
      <AuthHeading title="Tạo tài khoản" small>
        Đăng ký tài khoản học viên mới.
      </AuthHeading>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={row}>
          <AuthField compact label="Họ và tên" placeholder="Nguyễn Minh Anh" autoComplete="name" {...register("fullName")} error={errors.fullName?.message} id="fullName" />
          <AuthField compact label="Tên đăng nhập" placeholder="minhanh" autoComplete="username" {...register("username")} error={errors.username?.message} id="username" />
        </div>
        <div className={row}>
          <AuthField compact label="Email" type="email" placeholder="minhanh@gmail.com" autoComplete="email" {...register("email")} error={errors.email?.message} id="email" />
          <AuthField
            compact
            label="Số điện thoại"
            hint={<span className="text-[13px] font-semibold text-slate-400">tuỳ chọn</span>}
            placeholder="0901234567"
            autoComplete="tel"
            {...register("phone")}
            error={errors.phone?.message}
            id="phone"
          />
        </div>
        <AuthField compact label="Mật khẩu" type="password" placeholder="Ít nhất 6 ký tự" autoComplete="new-password" {...register("password")} error={errors.password?.message} id="password" />

        <AuthButton compact loading={isSubmitting} loadingText="Đang tạo…">
          Tạo tài khoản
        </AuthButton>
      </form>

      <p className="text-sm font-semibold text-slate-500">
        Đã có tài khoản?{" "}
        <Link to="/auth/login" className={authLinkClass}>
          Đăng nhập
        </Link>
      </p>
    </AuthLayout>
  );
}
