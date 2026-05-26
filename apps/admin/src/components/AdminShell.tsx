"use client";
import { Button, ThemeToggle, cn } from "@monorepo/ui";
import { LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Người dùng", icon: Users },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="bg-background text-foreground min-h-screen">
      <aside className="border-border bg-card fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r md:flex">
        <div className="border-border flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="text-primary text-base font-semibold tracking-wide">
            Monorepo <span className="text-muted-foreground text-sm font-normal">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-border border-t p-3">
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </Button>
        </div>
      </aside>

      <header className="border-border bg-background sticky top-0 z-20 h-16 border-b md:pl-60">
        <div className="flex h-full items-center justify-between px-6">
          <div className="text-muted-foreground text-sm">
            {user && (
              <>
                Xin chào <span className="text-foreground font-medium">{user.name}</span>
                <span className="text-muted-foreground mx-2">·</span>
                <span className="text-primary uppercase">{user.role}</span>
              </>
            )}
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="md:pl-60">
        <div className="mx-auto max-w-[1280px] px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
