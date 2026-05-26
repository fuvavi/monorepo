"use client";
import { authApi } from "@monorepo/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

import { ME_QUERY_KEY } from "@/hooks/useMe";
import { useAuthStore } from "@/stores/auth.store";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center">
          Đang hoàn tất đăng nhập Google…
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore(s => s.setAuth);
  const queryClient = useQueryClient();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const error = params.get("error");
    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    if (!accessToken || !refreshToken) {
      router.replace("/login?error=missing_token");
      return;
    }

    localStorage.setItem("accessToken", accessToken);

    authApi.get
      .me()
      .then(res => {
        setAuth(res.data, accessToken, refreshToken);
        queryClient.setQueryData(ME_QUERY_KEY, res.data);
        router.replace("/dashboard");
      })
      .catch(() => {
        router.replace("/login?error=session_invalid");
      });
  }, [params, router, setAuth, queryClient]);

  return (
    <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center">
      Đang hoàn tất đăng nhập Google…
    </div>
  );
}
