import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/shared/components/layout/AuthLayout.tsx";
import { AuthButton, AuthField, AuthHeading, authLinkClass } from "@/features/auth/components/AuthUi.tsx";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import { forgotPassword, resetPassword, verifyOtp } from "@/features/auth/authApi.ts";
import {
  forgotPasswordSchema,
  newPasswordSchema,
  otpSchema,
  type ForgotPasswordForm,
  type NewPasswordForm,
  type OtpForm,
} from "@/features/auth/validation/authSchema.ts";

type Step = "email" | "otp" | "password";

// Matches the server-side resend cooldown, so the button is not offered just to be silently ignored.
const RESEND_SECONDS = 60;

const resendClass =
  "font-bold text-[#2563eb] hover:text-[#1e40af] hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  // The code is kept in memory only so it can be sent again with the new password: the server
  // re-checks it at reset time, so passing the "verify" step grants nothing by itself.
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const emailForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });
  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
    mode: "onTouched",
  });
  const passwordForm = useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const sendCode = async (address: string) => {
    await forgotPassword(address);
    setCooldown(RESEND_SECONDS);
    toast.success("Nếu email này đã đăng ký, mã xác nhận đã được gửi. Vui lòng kiểm tra hộp thư.");
  };

  const onEmail = async (values: ForgotPasswordForm) => {
    const address = values.email.trim();
    try {
      await sendCode(address);
      setEmail(address);
      setStep("otp");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Không gửi được mã xác nhận. Vui lòng thử lại."));
    }
  };

  const onResend = async () => {
    if (cooldown > 0) return;
    try {
      await sendCode(email);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Không gửi được mã xác nhận. Vui lòng thử lại."));
    }
  };

  const onOtp = async (values: OtpForm) => {
    const code = values.otp.trim();
    try {
      await verifyOtp({ email, otp: code });
      setOtp(code);
      setStep("password");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Mã xác nhận không đúng hoặc đã hết hạn."));
    }
  };

  const onPassword = async (values: NewPasswordForm) => {
    try {
      await resetPassword({ email, otp, newPassword: values.newPassword });
      toast.success("Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới.");
      navigate("/auth/login", {
        replace: true,
        state: {
          notice: { type: "success", title: "Đã đặt lại mật khẩu", text: "Đăng nhập bằng mật khẩu mới của bạn." },
        },
      });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Không đặt lại được mật khẩu. Vui lòng thử lại."));
      // The code may have been consumed or expired: go back so the user can request a new one.
      setStep("otp");
      otpForm.reset();
    }
  };

  const stepIndex = step === "email" ? 0 : step === "otp" ? 1 : 2;

  return (
    <AuthLayout cardTag="Thẻ khôi phục" cardIpa="/rɪˈset/ · đặt lại">
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((n) => (
          <span key={n} className={`h-1 flex-1 rounded-full ${n <= stepIndex ? "bg-[#020617]" : "bg-slate-200"}`} />
        ))}
      </div>

      {step === "email" ? (
        <>
          <AuthHeading title="Đặt lại mật khẩu">Nhập email tài khoản, mình sẽ gửi mã 6 số.</AuthHeading>
          <form className="flex flex-col gap-4" onSubmit={emailForm.handleSubmit(onEmail)} noValidate>
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
        </>
      ) : null}

      {step === "otp" ? (
        <>
          <AuthHeading title="Nhập mã xác thực">
            Nếu <span className="break-all font-extrabold text-slate-700">{email}</span> đã đăng ký, mã đang được gửi tới. Mã hết hạn sau 5 phút.
          </AuthHeading>
          <form className="flex flex-col gap-4" onSubmit={otpForm.handleSubmit(onOtp)} noValidate>
            <AuthField
              otp
              label="Mã xác thực"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              autoComplete="one-time-code"
              {...otpForm.register("otp", { setValueAs: (v: string) => v.replace(/\D/g, "") })}
              error={otpForm.formState.errors.otp?.message}
              id="otp"
            />
            <AuthButton loading={otpForm.formState.isSubmitting} loadingText="Đang xác nhận…">
              Xác nhận mã
            </AuthButton>
          </form>
          <div className="flex justify-between text-sm">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="font-bold text-slate-600 hover:text-slate-900 hover:underline"
            >
              Dùng email khác
            </button>
            <button type="button" onClick={onResend} disabled={cooldown > 0} className={resendClass}>
              {cooldown > 0 ? `Gửi lại mã (${cooldown}s)` : "Gửi lại mã"}
            </button>
          </div>
        </>
      ) : null}

      {step === "password" ? (
        <>
          <AuthHeading title="Mật khẩu mới">Chọn mật khẩu mới cho tài khoản của bạn.</AuthHeading>
          <form className="flex flex-col gap-4" onSubmit={passwordForm.handleSubmit(onPassword)} noValidate>
            <AuthField
              label="Mật khẩu mới"
              type="password"
              placeholder="Ít nhất 6 ký tự"
              autoComplete="new-password"
              {...passwordForm.register("newPassword")}
              error={passwordForm.formState.errors.newPassword?.message}
              id="newPassword"
            />
            <AuthField
              label="Nhập lại mật khẩu mới"
              type="password"
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              {...passwordForm.register("confirmPassword")}
              error={passwordForm.formState.errors.confirmPassword?.message}
              id="confirmPassword"
            />
            <AuthButton loading={passwordForm.formState.isSubmitting} loadingText="Đang lưu…">
              Đặt lại mật khẩu
            </AuthButton>
          </form>
        </>
      ) : null}

      <p className="text-sm font-semibold text-slate-500">
        Nhớ ra rồi?{" "}
        <Link to="/auth/login" className={authLinkClass}>
          Quay lại đăng nhập
        </Link>
      </p>
    </AuthLayout>
  );
}
