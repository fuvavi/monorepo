"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi, UserRole } from "@monorepo/shared";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@monorepo/ui";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuthStore } from "@/stores/auth.store";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

const ALLOWED_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await authApi.post.login(data);
      const { user, accessToken, refreshToken } = res.data;

      if (!ALLOWED_ROLES.includes(user.role)) {
        setError("root", {
          message: "Tài khoản này không có quyền truy cập admin panel.",
        });
        return;
      }

      setAuth(user, accessToken, refreshToken);
      router.push("/dashboard");
    } catch (err: any) {
      setError("root", {
        message: err?.response?.data?.message ?? "Đăng nhập thất bại",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng nhập Admin</CardTitle>
        <CardDescription>Chỉ tài khoản admin mới được phép truy cập.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
              {errors.root.message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
