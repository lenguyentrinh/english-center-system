import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/shared/components/layout/AuthLayout.tsx";
import Button from "@/shared/components/Button.tsx";
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
import { InputField } from "@/shared/components/form";

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onBlur",
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
            <InputField
              label="Username"
              placeholder="Username"
              {...register("username")}
              error={errors.username?.message}
              id="username"
              required={true}
            />
        </div>

        <div className="space-y-1">
          <InputField
            label="Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
            id="password"
            required={true}
          />
        </div>

        <Button type="submit" size="large" className="w-full" loading={isSubmitting} disabled={!isValid}>
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
