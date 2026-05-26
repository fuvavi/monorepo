"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useMe } from "@/hooks/useMe";
import { useAuthStore } from "@/stores/auth.store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore(s => s.accessToken);
  const setUser = useAuthStore(s => s.setUser);
  const clearAuth = useAuthStore(s => s.clearAuth);

  const { data, isError, isSuccess, isLoading } = useMe(!!accessToken);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  useEffect(() => {
    if (isSuccess && data) setUser(data);
  }, [isSuccess, data, setUser]);

  useEffect(() => {
    if (isError) {
      clearAuth();
      router.replace("/login");
    }
  }, [isError, clearAuth, router]);

  if (!accessToken || isLoading || !isSuccess) {
    return (
      <div className="bg-background text-muted-foreground flex min-h-screen items-center justify-center">
        <span className="text-sm">Đang kiểm tra phiên đăng nhập…</span>
      </div>
    );
  }

  return <>{children}</>;
}
