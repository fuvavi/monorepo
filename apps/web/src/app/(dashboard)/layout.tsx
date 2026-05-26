import { AuthGuard } from "@/components/AuthGuard";
import { TopNav } from "@/components/TopNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="bg-background text-foreground min-h-screen">
        <TopNav />
        <div className="mx-auto max-w-[1280px] px-6 py-10">{children}</div>
      </div>
    </AuthGuard>
  );
}
