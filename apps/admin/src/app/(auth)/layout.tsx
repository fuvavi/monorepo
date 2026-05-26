"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/stores/auth.store";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore(s => s.accessToken);

  useEffect(() => {
    if (accessToken) router.replace("/dashboard");
  }, [accessToken, router]);

  if (accessToken) return null;

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-primary text-2xl font-bold tracking-wide">Monorepo</h1>
          <p className="text-muted-foreground mt-2 text-sm">Trang quản trị nội bộ</p>
        </div>
        {children}
      </div>
    </main>
  );
}
