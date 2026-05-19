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
  });

  const onSubmit = async (values: SignupForm) => {
    try {
      const res = await signup({
        username: values.username.trim(),
        password: values.password,
        email: values.email.trim(),
        fullName: values.fullName.trim(),
        phone: values.phone?.trim() ? values.phone.trim() : undefined,
      });
      toast.success(res.message);
      navigate("/auth/login");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Signup failed"));
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
      <p className="mt-1 text-sm text-slate-600">Register a new student account.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <input
          placeholder="Username"
          {...register("username")}
          className="w-full rounded-lg border border-slate-200 shadow-sm px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p className="text-xs text-red-500">{errors.username?.message}</p>

        <input
          type="password"
          placeholder="Password"
          {...register("password")}
          className="w-full rounded-lg border border-slate-200 shadow-sm px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p className="text-xs text-red-500">{errors.password?.message}</p>

        <input
          type="email"
          placeholder="Email"
          {...register("email")}
          className="w-full rounded-lg border border-slate-200 shadow-sm px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p className="text-xs text-red-500">{errors.email?.message}</p>

        <input
          placeholder="Full name"
          {...register("fullName")}
          className="w-full rounded-lg border border-slate-200 shadow-sm px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p className="text-xs text-red-500">{errors.fullName?.message}</p>

        <input
          placeholder="Phone (optional)"
          {...register("phone")}
          className="w-full rounded-lg border border-slate-200 shadow-sm px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p className="text-xs text-red-500">{errors.phone?.message}</p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already registered?{" "}
        <Link to="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-500 underline">
          Go to login
        </Link>
      </p>
    </AuthLayout>
  );
}
