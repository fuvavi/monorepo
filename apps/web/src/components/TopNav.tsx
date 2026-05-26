"use client";
import { Button, ThemeToggle } from "@monorepo/ui";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";

export function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-background border-border sticky top-0 z-40 h-16 w-full border-b">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-primary text-base font-semibold tracking-wide">
            Monorepo
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/dashboard" className="hover:text-primary text-sm font-medium transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Tài khoản
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Hỗ trợ
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <span className="text-muted-foreground hidden text-sm sm:inline">
              {user.name} <span className="mx-1">·</span> {user.email}
            </span>
          )}
          <ThemeToggle />
          <Button onClick={logout} variant="secondary" size="sm">
            Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  );
}
