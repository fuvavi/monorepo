"use client";
import "./globals.css";

import { ThemeProvider } from "@monorepo/ui";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { setupApiClient } from "@/lib/setup-api";
import { useAuthStore } from "@/stores/auth.store";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const clearAuth = useAuthStore(s => s.clearAuth);

  useEffect(() => {
    setupApiClient(() => {
      clearAuth();
      router.push("/login");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <body className="bg-background text-foreground font-sans antialiased">
        <ThemeProvider defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
