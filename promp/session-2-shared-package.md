# Session 2 — packages/shared

> **Đã hoàn thành:** Root workspace, pnpm workspaces, Turborepo (session 1).
> **Mục tiêu session này:** Tạo hoàn chỉnh `packages/shared` — pure TypeScript, không phụ thuộc Next.js hay NestJS.
> Kết thúc session, import `@my-app/shared` từ app khác phải resolve được.

---

## Folder tree cần tạo

```
packages/
└── shared/
    ├── src/
    │   ├── interfaces/
    │   │   ├── user.interface.ts
    │   │   ├── auth.interface.ts
    │   │   └── index.ts
    │   ├── dto/
    │   │   ├── auth/
    │   │   │   ├── login.dto.ts
    │   │   │   └── register.dto.ts
    │   │   └── index.ts
    │   ├── enums/
    │   │   ├── role.enum.ts
    │   │   └── index.ts
    │   ├── constants/
    │   │   ├── api-endpoints.ts
    │   │   └── index.ts
    │   ├── api/
    │   │   ├── client.ts
    │   │   ├── auth.api.ts
    │   │   ├── user.api.ts
    │   │   └── index.ts
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

---

## Các file cần tạo

### `packages/shared/package.json`
```json
{
  "name": "@my-app/shared",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  }
}
```

### `packages/shared/tsconfig.json`
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src"]
}
```

---

### `packages/shared/src/enums/role.enum.ts`
```ts
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}
```

### `packages/shared/src/enums/index.ts`
```ts
export * from './role.enum';
```

---

### `packages/shared/src/interfaces/user.interface.ts`
```ts
import { UserRole } from '../enums/role.enum';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### `packages/shared/src/interfaces/auth.interface.ts`
```ts
import { IUser } from './user.interface';

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse extends IAuthTokens {
  user: IUser;
}
```

### `packages/shared/src/interfaces/index.ts`
```ts
export * from './user.interface';
export * from './auth.interface';
```

---

### `packages/shared/src/dto/auth/login.dto.ts`
```ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

### `packages/shared/src/dto/auth/register.dto.ts`
```ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

### `packages/shared/src/dto/index.ts`
```ts
export * from './auth/login.dto';
export * from './auth/register.dto';
```

---

### `packages/shared/src/constants/api-endpoints.ts`
```ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  USERS: {
    LIST: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE_STATUS: (id: string) => `/users/${id}/status`,
  },
} as const;
```

### `packages/shared/src/constants/index.ts`
```ts
export * from './api-endpoints';
```

---

### `packages/shared/src/api/client.ts`
```ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

let _client: AxiosInstance | null = null;

export interface ApiClientConfig {
  baseURL: string;
  getToken: () => string | null;
  onUnauthorized?: () => void;
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const { baseURL, getToken, onUnauthorized } = config;

  const client = axios.create({
    baseURL,
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use((req: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && req.headers) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  });

  client.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        if (onUnauthorized) {
          onUnauthorized();
        } else if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      }
      return Promise.reject(error);
    }
  );

  _client = client;
  return client;
}

export function getApiClient(): AxiosInstance {
  if (!_client) {
    throw new Error(
      '[shared/api] Client chưa được khởi tạo. Gọi createApiClient() ở entry point của app trước.'
    );
  }
  return _client;
}
```

### `packages/shared/src/api/auth.api.ts`
```ts
import { getApiClient } from './client';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import type { IAuthResponse, IAuthTokens } from '../interfaces';
import type { IUser } from '../interfaces';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  get: {
    me: () =>
      getApiClient().get<IUser>(API_ENDPOINTS.AUTH.ME),
  },

  post: {
    login: (payload: LoginPayload) =>
      getApiClient().post<IAuthResponse>(API_ENDPOINTS.AUTH.LOGIN, payload),

    register: (payload: RegisterPayload) =>
      getApiClient().post<IAuthResponse>(API_ENDPOINTS.AUTH.REGISTER, payload),

    logout: () =>
      getApiClient().post<void>(API_ENDPOINTS.AUTH.LOGOUT),

    refreshToken: (refreshToken: string) =>
      getApiClient().post<IAuthTokens>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }),
  },
};
```

### `packages/shared/src/api/user.api.ts`
```ts
import { getApiClient } from './client';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import type { IUser } from '../interfaces';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: string;
}

export const userApi = {
  get: {
    list: (params?: UserListQuery) =>
      getApiClient().get<PaginatedResponse<IUser>>(API_ENDPOINTS.USERS.LIST, { params }),

    byId: (id: string) =>
      getApiClient().get<IUser>(API_ENDPOINTS.USERS.BY_ID(id)),
  },

  post: {
    create: (payload: Partial<IUser>) =>
      getApiClient().post<IUser>(API_ENDPOINTS.USERS.LIST, payload),
  },

  patch: {
    update: (id: string, payload: UpdateUserPayload) =>
      getApiClient().patch<IUser>(API_ENDPOINTS.USERS.BY_ID(id), payload),

    updateStatus: (id: string, isActive: boolean) =>
      getApiClient().patch<IUser>(API_ENDPOINTS.USERS.UPDATE_STATUS(id), { isActive }),
  },

  delete: {
    remove: (id: string) =>
      getApiClient().delete<void>(API_ENDPOINTS.USERS.BY_ID(id)),
  },
};
```

### `packages/shared/src/api/index.ts`
```ts
export { createApiClient, getApiClient } from './client';
export type { ApiClientConfig } from './client';
export { authApi } from './auth.api';
export type { LoginPayload, RegisterPayload } from './auth.api';
export { userApi } from './user.api';
export type { PaginatedResponse, UserListQuery, UpdateUserPayload } from './user.api';
```

### `packages/shared/src/index.ts`
```ts
export * from './interfaces';
export * from './dto';
export * from './enums';
export * from './constants';
export * from './api';
```

---

## Ràng buộc quan trọng

- `packages/shared` **KHÔNG được** import bất kỳ thứ gì từ `next`, `react`, hay `@nestjs/*`
- Chỉ được dùng: `axios`, `class-validator`, `class-transformer`, và các built-in TypeScript types
- Đây là pure TypeScript library, phải chạy được cả ở browser lẫn Node.js

---

## Checkpoint

```bash
# Từ root
pnpm install

# Verify shared package được link
ls node_modules/@my-app/shared
# Phải thấy symlink trỏ về packages/shared
```

Nếu không lỗi → session 2 hoàn thành. Tiếp tục sang **session 3**.
