import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/shared/components/layout/AuthLayout.tsx";
import { AuthButton, AuthField, AuthHeading, authLinkClass } from "@/features/auth/components/AuthUi.tsx";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import { resendVerification, verifyEmail } from "@/features/auth/authApi.ts";
import {
  forgotPasswordSchema,
  otpSchema,
  type ForgotPasswordForm,
  type OtpForm,
} from "@/features/auth/validation/authSchema.ts";

// Matches the server-side resend cooldown.
const RESEND_SECONDS = 60;

type LocationState = { email?: string; autoSend?: boolean } | null;

const layoutTag = { cardTag: "Thẻ xác thực", cardIpa: "/kənˈfɜːm/ · xác nhận" };

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = location.state as LocationState;
  // Logging in with a username does not tell us the address, so the user may have to type it.
  const [email, setEmail] = useState(state?.email || searchParams.get("email") || "");

  // After signup the server already emailed a code, so start with a cooldown. When arriving from a
  // blocked login there may be no live code yet, so ask for one right away.
  const [cooldown, setCooldown] = useState(state?.autoSend ? 0 : RESEND_SECONDS);
  const autoSent = useRef(false);

  const emailForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
    mode: "onTouched",
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async (address: string = email) => {
    try {
      const res = await resendVerification(address);
      setCooldown(RESEND_SECONDS);
      toast.success(res.message);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Could not send the code"));
    }
  };

  useEffect(() => {
    if (state?.autoSend && email && !autoSent.current) {
      autoSent.current = true;
      void sendCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values: OtpForm) => {
    try {
      const res = await verifyEmail({ email, otp: values.otp.trim() });
      toast.success(res.message);
      navigate("/auth/login", {
        replace: true,
        state: { notice: { type: "success", title: "Email đã được xác thực", text: "Bạn có thể đăng nhập ngay bây giờ." } },
      });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Invalid or expired code"));
    }
  };

  if (!email) {
    return (
      <AuthLayout {...layoutTag}>
        <AuthHeading title="Xác thực email">Nhập email bạn đã dùng khi đăng ký, mình sẽ gửi mã.</AuthHeading>
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={emailForm.handleSubmit(async (values) => {
            const address = values.email.trim();
            await sendCode(address);
            setEmail(address);
          })}
        >
          <AuthField
            label="Email"
            type="email"
            placeholder="minhanh@gmail.com"
            autoComplete="email"
            {...emailForm.register("email")}
            error={emailForm.formState.errors.email?.message}
            id="email"
          />
          <AuthButton loading={emailForm.formState.isSubmitting} loadingText="Đang gửi…">
            Gửi mã
          </AuthButton>
        </form>
        <p className="text-sm">
          <Link to="/auth/login" className={authLinkClass}>
            Quay lại đăng nhập
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout {...layoutTag}>
      <AuthHeading title="Xác thực email">
        Nhập mã 6 số đã gửi tới <span className="break-all font-extrabold text-slate-700">{email}</span>. Mã hết hạn sau 5 phút.
      </AuthHeading>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          otp
          label="Mã xác thực"
          inputMode="numeric"
          maxLength={6}
          placeholder="••••••"
          autoComplete="one-time-code"
          {...register("otp", { setValueAs: (v: string) => v.replace(/\D/g, "") })}
          error={errors.otp?.message}
          id="otp"
        />
        <AuthButton loading={isSubmitting} loadingText="Đang xác thực…">
          Xác thực email
        </AuthButton>
      </form>

      <div className="flex justify-between text-sm">
        <Link to="/auth/login" className="font-bold text-slate-600 hover:text-slate-900 hover:underline">
          Quay lại đăng nhập
        </Link>
        <button
          type="button"
          onClick={() => void sendCode()}
          disabled={cooldown > 0}
          className="font-bold text-[#2563eb] hover:text-[#1e40af] hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
        >
          {cooldown > 0 ? `Gửi lại mã (${cooldown}s)` : "Gửi lại mã"}
        </button>
      </div>
    </AuthLayout>
  );
}
