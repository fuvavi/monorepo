"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IAuthResponse } from "@monorepo/shared";
import { authApi } from "@monorepo/shared";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@monorepo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { ME_QUERY_KEY } from "@/hooks/useMe";
import { useAuthStore } from "@/stores/auth.store";

const schema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => (await authApi.post.register(data)).data as IAuthResponse,
    onSuccess: data => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      queryClient.setQueryData(ME_QUERY_KEY, data.user);
      router.push("/dashboard");
    },
    onError: (err: any) => {
      setError("root", {
        message: err?.response?.data?.message ?? "Đăng ký thất bại",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo tài khoản</CardTitle>
        <CardDescription>Đăng ký để sử dụng Monorepo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleAuthButton label="Đăng ký với Google" />

        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          <span className="bg-border h-px flex-1" />
          hoặc
          <span className="bg-border h-px flex-1" />
        </div>

        <form onSubmit={handleSubmit(data => registerMutation.mutate(data))} className="space-y-4">
          {errors.root && (
            <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
              {errors.root.message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Tên hiển thị</Label>
            <Input id="name" placeholder="Nguyễn Văn A" {...register("name")} />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" type="password" placeholder="••••••" {...register("password")} />
            {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
          </div>

          <Button type="submit" disabled={registerMutation.isPending} className="w-full">
            {registerMutation.isPending ? "Đang xử lý…" : "Đăng ký"}
          </Button>

          <p className="text-muted-foreground text-center text-sm">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Đăng nhập
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
