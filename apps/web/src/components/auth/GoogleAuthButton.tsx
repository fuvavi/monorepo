"use client";
import { API_ENDPOINTS } from "@monorepo/shared";
import { Button } from "@monorepo/ui";

export function GoogleAuthButton({ label = "Tiếp tục với Google" }: { label?: string }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8002/api/v1";

  const handleClick = () => {
    window.location.href = `${apiUrl}${API_ENDPOINTS.AUTH.GOOGLE}`;
  };

  return (
    <Button type="button" variant="outline" onClick={handleClick} className="w-full gap-2">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.71-1.57 2.7-3.9 2.7-6.62Z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.92v2.32A9 9 0 0 0 9 18Z"
        />
        <path
          fill="#FBBC05"
          d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.92A9 9 0 0 0 0 9c0 1.45.35 2.82.92 4.04l3.05-2.32Z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58A9 9 0 0 0 .92 4.96l3.05 2.32C4.68 5.16 6.66 3.58 9 3.58Z"
        />
      </svg>
      {label}
    </Button>
  );
}
