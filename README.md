# My App — Monorepo

Monorepo gồm backend NestJS, frontend NextJS (user + admin) và một package shared chứa types/DTOs/API client dùng chung.

## Stack

| Layer    | Tech                                                                  |
| -------- | --------------------------------------------------------------------- |
| Backend  | NestJS 10, PostgreSQL (TypeORM), Passport JWT, bcryptjs               |
| Frontend | Next.js 14 (App Router), Tailwind CSS, Zustand, react-hook-form + zod |
| Admin    | Next.js 14 (App Router) — giống web nhưng port + token key khác       |
| Shared   | Pure TypeScript — interfaces, DTOs, enums, axios API client           |
| Tooling  | pnpm workspaces, Turborepo, TypeScript strict mode                    |

## Cấu trúc

```
monorepo/
├── apps/
│   ├── api/         NestJS — port 4000, prefix /api/v1
│   ├── web/         Next.js — port 3000, user-facing
│   └── admin/       Next.js — port 3001, admin panel
├── packages/
│   └── shared/      @my-app/shared — types, DTOs, API client
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Yêu cầu môi trường

- Node.js >= 20
- pnpm >= 8
- PostgreSQL chạy local trên `5432` (hoặc `DATABASE_URL` qua biến môi trường)

## Cài đặt

```bash
pnpm install
```

## Khởi động PostgreSQL

`apps/api` cần Postgres chạy ở `localhost:5432`, DB `monorepo`, user/pass `postgres/postgres` (theo `apps/api/.env`). Chọn 1 trong các cách dưới đây.

### Cách 1: Docker (khuyến nghị)

```bash
docker run -d \
  --name monorepo-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=monorepo \
  -p 5432:5432 \
  -v monorepo-pgdata:/var/lib/postgresql/data \
  postgres:16
```

Quản lý container:

```bash
docker start monorepo-postgres    # khởi động lại
docker stop  monorepo-postgres    # dừng
docker logs  monorepo-postgres    # xem log
```

### Cách 2: Homebrew (macOS)

```bash
brew install postgresql@16
brew services start postgresql@16

# tạo DB + user (chạy 1 lần)
createuser -s postgres 2>/dev/null
createdb -O postgres monorepo
```

### Cách 3: Postgres.app (macOS GUI)

Tải tại https://postgresapp.com → mở app → tạo database tên `monorepo`.

### Kiểm tra kết nối

```bash
psql postgres://postgres:postgres@localhost:5432/monorepo -c '\conninfo'
```

TypeORM được cấu hình `synchronize: true` ở dev — schema sẽ được tạo tự động khi `apps/api` start lần đầu.

## Chạy dev

```bash
pnpm dev          # chạy tất cả apps song song qua Turbo
pnpm dev:api      # chỉ NestJS API     → http://localhost:4000/api/v1
pnpm dev:web      # chỉ web app        → http://localhost:3000
pnpm dev:admin    # chỉ admin panel    → http://localhost:3001
```

## Build & Lint

```bash
pnpm build        # turbo run build (tôn trọng dependsOn ^build)
pnpm lint         # turbo run lint
```

## Package `@my-app/shared`

Package nội bộ, link qua `workspace:*`. Chỉ chứa TypeScript thuần — **không** import `next`, `react`, hoặc `@nestjs/*`.

Dùng cho:

- `interfaces/` — interface dùng chung (prefix `I`, ví dụ `IUser`)
- `dto/` — DTO class với `class-validator` (suffix `Dto`)
- `enums/` — enum dùng chung (PascalCase)
- `api/` — axios API functions (suffix `Api`, ví dụ `authApi`)

Mọi thứ export qua `packages/shared/src/index.ts`.

## Quy ước đặt tên

### Backend (NestJS)

- Module: `feature.module.ts` → `FeatureModule`
- Controller: `feature.controller.ts` → `@Controller('feature')`
- Service: `feature.service.ts` → `FeatureService`
- Schema: `feature.schema.ts` → export `Feature`, `FeatureDocument`, `FeatureSchema`
- DTO: đặt tại `packages/shared/src/dto/feature/`

### Frontend (Next.js)

- Page: `app/(group)/route/page.tsx` (default export)
- Component: `components/feature/FeatureName.tsx` (PascalCase, named export)
- Hook: `hooks/useFeatureName.ts` (camelCase, prefix `use`)
- Store: `stores/feature.store.ts` → export `useFeatureStore`

## Quy tắc bắt buộc

1. `packages/shared` không import `next`, `react`, `@nestjs/*`.
2. Mọi form dùng `react-hook-form` + `zodResolver` + zod schema — không dùng `useState` cho input.
3. Mọi API call dùng functions từ `@my-app/shared` — không tự tạo axios instance mới.
4. `apps/admin` dùng `localStorage` key `admin_accessToken`, **không** phải `accessToken`.
5. Controller NestJS chỉ nhận DTO từ `@my-app/shared`.
6. TypeScript strict mode bật toàn bộ — tránh dùng `any`.

## Khi thêm feature mới

- [ ] DTO mới → `packages/shared/src/dto/`
- [ ] Interface mới → `packages/shared/src/interfaces/`
- [ ] API endpoint mới → file tương ứng trong `packages/shared/src/api/`
- [ ] Re-export từ `packages/shared/src/index.ts`
- [ ] NestJS: tạo module và import vào `app.module.ts`
- [ ] Next.js: đặt page trong route group đúng (`(auth)` / `(dashboard)`)
