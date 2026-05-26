"use client";
import { authApi, UserRole } from "@monorepo/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/stores/auth.store";

const ALLOWED_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore(s => s.accessToken);
  const setUser = useAuthStore(s => s.setUser);
  const clearAuth = useAuthStore(s => s.clearAuth);
  const [state, setState] = useState<"loading" | "ready" | "forbidden">("loading");

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    authApi.get
      .me()
      .then(res => {
        const me = res.data;
        if (!ALLOWED_ROLES.includes(me.role)) {
          setState("forbidden");
          return;
        }
        setUser(me);
        setState("ready");
      })
      .catch(() => {
        clearAuth();
        router.replace("/login");
      });
  }, [accessToken, router, setUser, clearAuth]);

  if (state === "loading") {
    return (
      <div className="bg-background text-muted-foreground flex min-h-screen items-center justify-center">
        <span className="text-sm">Đang xác thực phiên admin…</span>
      </div>
    );
  }

  if (state === "forbidden") {
    return (
      <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-3">
        <h1 className="text-destructive text-2xl font-bold">Truy cập bị từ chối</h1>
        <p className="text-muted-foreground text-sm">Tài khoản này không có quyền truy cập admin panel.</p>
        <button
          onClick={() => {
            clearAuth();
            router.replace("/login");
          }}
          className="text-primary mt-2 underline"
        >
          Đăng xuất và quay lại
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
