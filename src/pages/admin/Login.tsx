import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useLogin, useLogout, useMe } from "@/api/auth";
import { Button, Field, Input } from "@/components/ui";
import { loginSchema, type LoginValues } from "@/schemas";
import { useTitle } from "@/lib/utils";

export default function Login() {
  useTitle("Admin login | Portfulio");
  const navigate = useNavigate();
  const location = useLocation();
  const { data: me } = useMe();
  const login = useLogin();
  const logout = useLogout();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  if (me?.role === "ADMIN") return <Navigate to="/admin" replace />;

  const from = (location.state as { from?: string } | null)?.from ?? "/admin";

  const onSubmit = (values: LoginValues) => {
    setFormError(null);
    login.mutate(values, {
      onSuccess: (data) => {
        if (data.user.role !== "ADMIN") {
          setFormError("This account doesn't have admin access.");
          logout.mutate();
          return;
        }
        toast.success(`Welcome back, ${data.user.name}`);
        navigate(from, { replace: true });
      },
      onError: (error) => setFormError(error.message),
    });
  };

  return (
    <main className="dotgrid grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="font-display text-xl font-extrabold">
          Portfulio
        </Link>
        <div className="mt-6 rounded-2xl border-2 border-ink bg-white p-7 shadow-[8px_8px_0_var(--color-marigold)] sm:p-9">
          <h1 className="text-3xl font-extrabold">Log in to your dashboard</h1>
          <p className="mt-2 text-mute">Manage your projects, skills and messages.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-5">
            {formError && (
              <p role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
                {formError}
              </p>
            )}
            <Field label="Email" htmlFor="l-email" error={errors.email?.message}>
              <Input id="l-email" type="email" autoComplete="username" invalid={!!errors.email} {...register("email")} />
            </Field>
            <Field label="Password" htmlFor="l-password" error={errors.password?.message}>
              <Input id="l-password" type="password" autoComplete="current-password" invalid={!!errors.password} {...register("password")} />
            </Field>
            <Button type="submit" loading={login.isPending} className="w-full">
              {login.isPending ? "Logging in" : "Log in"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
