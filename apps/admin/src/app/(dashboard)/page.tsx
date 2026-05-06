'use client';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:underline"
          >
            Đăng xuất
          </button>
        </div>
        {user && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-600">Xin chào, <span className="font-medium">{user.name}</span></p>
            <p className="text-sm text-gray-400 mt-1">{user.email} · {user.role}</p>
          </div>
        )}
      </div>
    </div>
  );
}
