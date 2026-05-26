"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@monorepo/ui";

import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-foreground text-2xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground mt-2 text-sm">Theo dõi nhanh tình trạng hệ thống và người dùng.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Tổng người dùng</CardDescription>
            <CardTitle className="text-primary text-3xl font-bold">—</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Cập nhật từ /users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Đang hoạt động</CardDescription>
            <CardTitle className="text-3xl font-bold text-green-500">—</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Tài khoản isActive</p>
          </CardContent>
        </Card>

        {user && (
          <Card>
            <CardHeader>
              <CardDescription>Đăng nhập với</CardDescription>
              <CardTitle>{user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              <p className="text-primary mt-1 text-sm uppercase">{user.role}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
