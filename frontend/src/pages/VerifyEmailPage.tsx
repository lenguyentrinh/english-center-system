import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/shared/components/layout/AuthLayout.tsx";
import Button from "@/shared/components/Button.tsx";
import { InputField } from "@/shared/components/form";
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
      navigate("/auth/login", { replace: true });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Invalid or expired code"));
    }
  };

  if (!email) {
    return (
      <AuthLayout>
        <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
        <p className="mt-1 text-sm text-slate-600">Enter the email address you signed up with and we will send you a code.</p>
        <form
          className="mt-6 space-y-4"
          noValidate
          onSubmit={emailForm.handleSubmit(async (values) => {
            const address = values.email.trim();
            await sendCode(address);
            setEmail(address);
          })}
        >
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
        <p className="mt-4 text-sm">
          <Link to="/auth/login" className="font-semibold text-indigo-600 underline hover:text-indigo-500">
            Back to login
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
      <p className="mt-1 text-sm text-slate-600">
        Enter the 6-digit code we sent to <span className="break-all font-semibold">{email}</span>. It expires in 5 minutes.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <InputField
          label="Verification code"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          autoComplete="one-time-code"
          {...register("otp")}
          error={errors.otp?.message}
          id="otp"
          required={true}
        />
        <Button type="submit" size="large" className="w-full" loading={isSubmitting}>
          Verify email
        </Button>
      </form>

      <div className="mt-4 flex justify-between text-sm">
        <Link to="/auth/login" className="font-medium text-slate-600 underline hover:text-slate-900">
          Back to login
        </Link>
        <button
          type="button"
          onClick={() => void sendCode()}
          disabled={cooldown > 0}
          className="font-medium text-indigo-600 underline hover:text-indigo-500 disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
        >
          {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
        </button>
      </div>
    </AuthLayout>
  );
}
