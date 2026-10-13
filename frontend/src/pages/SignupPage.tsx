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
import { InputField } from "@/shared/components/form";
import Button from "@/shared/components/Button.tsx";

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
    mode: "onBlur",
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
      toast.error(getApiErrorMessage(error, "Signup failed"));
    }
  };


  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
      <p className="mt-1 text-sm text-slate-600">Register a new student account.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label="Username"
          placeholder="Username"
          {...register("username")}
          error={errors.username?.message}
          id="username"
          required={true}
        />
        <InputField
          label="Password"
          type="password"
          placeholder="Password"
          {...register("password")}
          error={errors.password?.message}
          id="password"
          required={true}
        />
        <InputField
          label="Email"
          type="email"
          placeholder="Email"
          {...register("email")}
          error={errors.email?.message}
          id="email"
          required={true}
        />
        <InputField
          label="Full Name"
          placeholder="Full name"
          {...register("fullName")}
          error={errors.fullName?.message}
          id="fullName"
          required={true}
        />
        <InputField
          label="Phone"
          placeholder="Phone"
          {...register("phone")}
          error={errors.phone?.message}
          id="phone"
          required={false}
        />
        <Button type="submit" size="large" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
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
