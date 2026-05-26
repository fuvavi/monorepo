"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@monorepo/ui";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-foreground text-2xl font-bold">Cài đặt</h1>
        <p className="text-muted-foreground mt-2 text-sm">Cấu hình hệ thống.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Chưa có cài đặt</CardTitle>
          <CardDescription>Các tuỳ chọn cấu hình sẽ xuất hiện tại đây.</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
