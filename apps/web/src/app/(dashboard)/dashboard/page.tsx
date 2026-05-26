"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@monorepo/ui";

import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-foreground text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-sm">Tổng quan tài khoản của bạn.</p>
      </header>

      {user && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Người dùng</CardDescription>
              <CardTitle>{user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Vai trò</CardDescription>
              <CardTitle className="text-primary uppercase tracking-wide">{user.role}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Quyền truy cập của tài khoản.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Trạng thái</CardDescription>
              <CardTitle className={user.isActive ? "text-green-500" : "text-destructive"}>
                {user.isActive ? "Hoạt động" : "Đã khoá"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-mono text-sm">ID: {user.id}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
