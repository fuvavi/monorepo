"use client";
import { IUser, userApi } from "@monorepo/shared";
import { Card } from "@monorepo/ui";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.get
      .list({ page: 1, limit: 20 })
      .then(res => setUsers(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-foreground text-2xl font-bold">Quản lý người dùng</h1>
        <p className="text-muted-foreground mt-2 text-sm">Danh sách tài khoản trong hệ thống.</p>
      </header>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="text-muted-foreground p-6 text-sm">Đang tải…</div>
        ) : users.length === 0 ? (
          <div className="text-muted-foreground p-6 text-sm">Chưa có người dùng.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b">
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide uppercase">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide uppercase">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wide uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-border hover:bg-accent/50 border-b transition-colors">
                  <td className="text-foreground px-6 py-3">{user.name}</td>
                  <td className="text-muted-foreground px-6 py-3">{user.email}</td>
                  <td className="px-6 py-3">
                    <span className="bg-primary/10 text-primary rounded-sm px-2 py-1 text-xs tracking-wide uppercase">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={user.isActive ? "text-green-500 text-xs" : "text-destructive text-xs"}>
                      {user.isActive ? "● Hoạt động" : "● Đã khoá"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
