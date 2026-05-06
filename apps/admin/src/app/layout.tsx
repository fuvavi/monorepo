'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setupApiClient } from '@/lib/setup-api';
import { useAuthStore } from '@/stores/auth.store';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    setupApiClient(() => {
      clearAuth();
      router.push('/login');
    });
  }, []);

  return (
    <html lang="vi">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
