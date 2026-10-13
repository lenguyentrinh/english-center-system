import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/shared/components/layout/AuthLayout.tsx";
import Button from "@/shared/components/Button.tsx";
import { InputField } from "@/shared/components/form";
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
    const res = await forgotPassword(address);
    setCooldown(RESEND_SECONDS);
    toast.success(res.message);
  };

  const onEmail = async (values: ForgotPasswordForm) => {
    const address = values.email.trim();
    try {
      await sendCode(address);
      setEmail(address);
      setStep("otp");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Could not send the code"));
    }
  };

  const onResend = async () => {
    if (cooldown > 0) return;
    try {
      await sendCode(email);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Could not send the code"));
    }
  };

  const onOtp = async (values: OtpForm) => {
    const code = values.otp.trim();
    try {
      await verifyOtp({ email, otp: code });
      setOtp(code);
      setStep("password");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Invalid or expired code"));
    }
  };

  const onPassword = async (values: NewPasswordForm) => {
    try {
      const res = await resetPassword({ email, otp, newPassword: values.newPassword });
      toast.success(res.message);
      navigate("/auth/login", { replace: true });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Could not reset the password"));
      // The code may have been consumed or expired: go back so the user can request a new one.
      setStep("otp");
      otpForm.reset();
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>

      {step === "email" ? (
        <>
          <p className="mt-1 text-sm text-slate-600">
            Enter your account email and we will send you a 6-digit code.
          </p>
          <form className="mt-6 space-y-4" onSubmit={emailForm.handleSubmit(onEmail)} noValidate>
            <InputField
              label="Email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              {...emailForm.register("email")}
              error={emailForm.formState.errors.email?.message}
              id="email"
              required={true}
            />
            <Button type="submit" size="large" className="w-full" loading={emailForm.formState.isSubmitting}>
              Send code
            </Button>
          </form>
        </>
      ) : null}

      {step === "otp" ? (
        <>
          <p className="mt-1 text-sm text-slate-600">
            If <span className="font-semibold">{email}</span> is registered, a code is on its way. It expires in 5 minutes.
          </p>
          <form className="mt-6 space-y-4" onSubmit={otpForm.handleSubmit(onOtp)} noValidate>
            <InputField
              label="Verification code"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              autoComplete="one-time-code"
              {...otpForm.register("otp")}
              error={otpForm.formState.errors.otp?.message}
              id="otp"
              required={true}
            />
            <Button type="submit" size="large" className="w-full" loading={otpForm.formState.isSubmitting}>
              Verify code
            </Button>
          </form>
          <div className="mt-4 flex justify-between text-sm">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="font-medium text-slate-600 underline hover:text-slate-900"
            >
              Use a different email
            </button>
            <button
              type="button"
              onClick={onResend}
              disabled={cooldown > 0}
              className="font-medium text-indigo-600 underline hover:text-indigo-500 disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
            >
              {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
            </button>
          </div>
        </>
      ) : null}

      {step === "password" ? (
        <>
          <p className="mt-1 text-sm text-slate-600">Choose a new password for your account.</p>
          <form className="mt-6 space-y-4" onSubmit={passwordForm.handleSubmit(onPassword)} noValidate>
            <InputField
              label="New password"
              type="password"
              autoComplete="new-password"
              {...passwordForm.register("newPassword")}
              error={passwordForm.formState.errors.newPassword?.message}
              id="newPassword"
              required={true}
            />
            <InputField
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              {...passwordForm.register("confirmPassword")}
              error={passwordForm.formState.errors.confirmPassword?.message}
              id="confirmPassword"
              required={true}
            />
            <Button type="submit" size="large" className="w-full" loading={passwordForm.formState.isSubmitting}>
              Reset password
            </Button>
          </form>
        </>
      ) : null}

      <p className="mt-4 text-sm text-slate-600">
        Remembered it?{" "}
        <Link to="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-500 underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
