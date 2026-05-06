# Session 1 — Root Workspace & Turborepo

> **Mục tiêu session này:** Tạo skeleton monorepo root với pnpm workspaces + Turborepo.
> Kết thúc session, chạy `pnpm install` thành công từ root là xong.

---

## Toàn bộ folder tree cần tạo ở session này

```
my-app/                        ← tạo folder này
├── apps/                      ← folder rỗng (chứa apps sau)
│   ├── api/                   ← folder rỗng
│   ├── web/                   ← folder rỗng
│   └── admin/                 ← folder rỗng
├── packages/                  ← folder rỗng (chứa shared sau)
│   └── shared/                ← folder rỗng
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

---

## Các file cần tạo

### `pnpm-workspace.yaml`
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### `package.json` (root)
```json
{
  "name": "my-app",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "dev:api": "turbo run dev --filter=api",
    "dev:web": "turbo run dev --filter=web",
    "dev:admin": "turbo run dev --filter=admin"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5.3.0"
  }
}
```

### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    }
  }
}
```

### `tsconfig.base.json`
```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleDetection": "force",
    "isolatedModules": true
  }
}
```

---

## Checkpoint

Sau khi tạo xong, chạy lệnh này từ root:

```bash
pnpm install
```

Nếu không có lỗi → session 1 hoàn thành. Tiếp tục sang **session 2**.
