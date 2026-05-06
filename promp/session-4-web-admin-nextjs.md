# Session 4 — apps/web + apps/admin (NextJS 14)

> **Đã hoàn thành:** Root workspace (s1) + shared package (s2) + NestJS API chạy port 4000 (s3).
> **Mục tiêu session này:** Tạo 2 NextJS apps — `web` (port 3000) và `admin` (port 3001).
> Cả hai dùng chung: Tailwind, Zustand, react-hook-form, import API từ `@my-app/shared`.
> Kết thúc session, login form gọi được API và lưu token thành công.

---

## Điểm khác nhau giữa web và admin

| | `apps/web` | `apps/admin` |
|---|---|---|
| Port | 3000 | 3001 |
| `package.json` name | `"web"` | `"admin"` |
| localStorage key | `accessToken` | `admin_accessToken` |
| Zustand persist name | `"auth-storage"` | `"admin-auth-storage"` |
| `setup-api.ts` token key | `accessToken` | `admin_accessToken` |

> Tạo `apps/web` trước, sau đó copy sang `apps/admin` và thay các giá trị trên.

---

## Folder tree (áp dụng cho cả web và admin)

```
apps/web/                        apps/admin/
├── src/                         ├── src/
│   ├── app/                     │   ├── app/
│   │   ├── globals.css          │   │   ├── globals.css
│   │   ├── layout.tsx           │   │   ├── layout.tsx
│   │   ├── page.tsx             │   │   ├── page.tsx
│   │   ├── (auth)/              │   │   ├── (auth)/
│   │   │   └── login/           │   │   │   └── login/
│   │   │       └── page.tsx     │   │   │       └── page.tsx
│   │   └── (dashboard)/         │   │   └── (dashboard)/
│   │       └── page.tsx         │   │       ├── page.tsx
│   ├── components/              │   │       ├── users/
│   │   └── ui/                  │   │       │   └── page.tsx
│   ├── hooks/                   │   │       └── settings/
│   │   └── useAuth.ts           │   │           └── page.tsx
│   ├── stores/                  │   ├── components/
│   │   └── auth.store.ts        │   │   └── ui/
│   └── lib/                     │   ├── hooks/
│       └── setup-api.ts         │   │   └── useAuth.ts
├── next.config.js               │   ├── stores/
├── tailwind.config.ts           │   │   └── auth.store.ts
├── postcss.config.js            │   └── lib/
├── package.json                 │       └── setup-api.ts
├── tsconfig.json                ├── next.config.js
└── .env.local                   ├── tailwind.config.ts
                                 ├── postcss.config.js
                                 ├── package.json
                                 ├── tsconfig.json
                                 └── .env.local
```

---

## Config files (giống nhau cho cả hai, trừ name và port)

### `apps/web/package.json`
```json
{
  "name": "web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  },
  "dependencies": {
    "@my-app/shared": "workspace:*",
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "typescript": "^5.3.0"
  }
}
```

> `apps/admin/package.json`: thay `"name": "admin"` và cả 2 port thành `3001`

### `apps/web/tsconfig.json`
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `apps/web/next.config.js`
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@my-app/shared'],
};

module.exports = nextConfig;
```

### `apps/web/tailwind.config.ts`
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

### `apps/web/postcss.config.js`
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### `apps/web/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## Source files — apps/web

### `apps/web/src/app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### `apps/web/src/lib/setup-api.ts`
```ts
import { createApiClient } from '@my-app/shared';

export function setupApiClient(onUnauthorized: () => void) {
  createApiClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
    getToken: () => {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem('accessToken');
    },
    onUnauthorized,
  });
}
```

### `apps/web/src/stores/auth.store.ts`
```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUser } from '@my-app/shared';

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: IUser, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        set({ user, accessToken, refreshToken });
      },

      clearAuth: () => {
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null, refreshToken: null });
      },

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
```

### `apps/web/src/hooks/useAuth.ts`
```ts
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@my-app/shared';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const logout = async () => {
    try {
      await authApi.post.logout();
    } catch {
      // ignore
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return { user, isAuthenticated: isAuthenticated(), logout };
}
```

### `apps/web/src/app/layout.tsx`
```tsx
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
```

### `apps/web/src/app/page.tsx`
```tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
}
```

### `apps/web/src/app/(auth)/login/page.tsx`
```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { authApi } from '@my-app/shared';
import { useAuthStore } from '@/stores/auth.store';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await authApi.post.login(data);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError('root', {
        message: err?.response?.data?.message ?? 'Đăng nhập thất bại',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-gray-800">Đăng nhập</h1>

        {errors.root && (
          <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
            {errors.root.message}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••"
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
```

### `apps/web/src/app/(dashboard)/page.tsx`
```tsx
'use client';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
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
```

---

## Source files — apps/admin (diff so với web)

Tạo toàn bộ giống `apps/web`, sau đó thay các file sau:

### `apps/admin/src/lib/setup-api.ts`
```ts
import { createApiClient } from '@my-app/shared';

export function setupApiClient(onUnauthorized: () => void) {
  createApiClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
    getToken: () => {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem('admin_accessToken');  // ← khác web
    },
    onUnauthorized,
  });
}
```

### `apps/admin/src/stores/auth.store.ts`
```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUser } from '@my-app/shared';

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: IUser, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('admin_accessToken', accessToken);  // ← khác web
        set({ user, accessToken, refreshToken });
      },

      clearAuth: () => {
        localStorage.removeItem('admin_accessToken');  // ← khác web
        set({ user: null, accessToken: null, refreshToken: null });
      },

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'admin-auth-storage',  // ← khác web
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
```

### `apps/admin/src/app/(dashboard)/users/page.tsx`
```tsx
'use client';
import { useEffect, useState } from 'react';
import { userApi, IUser } from '@my-app/shared';

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.get.list({ page: 1, limit: 20 })
      .then((res) => setUsers(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>
      {loading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Tên</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Vai trò</th>
                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Hoạt động' : 'Đã khoá'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## Checkpoint

```bash
# Terminal 1 — API
pnpm dev:api

# Terminal 2 — Web
pnpm dev:web

# Terminal 3 — Admin
pnpm dev:admin
```

Kiểm tra:
- `http://localhost:3000/login` → form đăng nhập web
- `http://localhost:3001/login` → form đăng nhập admin
- Đăng nhập với tài khoản đã tạo ở session 3 → redirect sang dashboard
- Mở DevTools → Application → LocalStorage:
  - `localhost:3000` có key `accessToken`
  - `localhost:3001` có key `admin_accessToken`

---

## Deploy — Nginx (optional, nếu dùng VPS)

```nginx
server {
    server_name app.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    server_name admin.app.com;
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    server_name api.app.com;
    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# SSL cho cả 3 domain
certbot --nginx -d app.com -d admin.app.com -d api.app.com
```

---

## Toàn bộ monorepo đã hoàn thành!

```
Session 1 ✅  Root workspace + Turborepo
Session 2 ✅  packages/shared (interfaces, DTOs, API functions)
Session 3 ✅  apps/api — NestJS + MongoDB + Auth
Session 4 ✅  apps/web + apps/admin — NextJS + Tailwind + Zustand + react-hook-form
```
