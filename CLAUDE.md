# Project: My App — Monorepo

## Stack

| Layer | Tech |
|---|---|
| Backend | NestJS 10, PostgreSQL (TypeORM), Passport JWT |
| Frontend | NextJS 14 App Router, Tailwind CSS, Zustand, react-hook-form + zod |
| Admin | NextJS 14 App Router (giống web, khác port + token key) |
| Shared | Pure TypeScript — interfaces, DTOs, enums, axios API functions |
| Tooling | pnpm workspaces, Turborepo |

## Cấu trúc monorepo

```
apps/api/        NestJS — port 4000, prefix /api/v1
apps/web/        NextJS — port 3000, user-facing
apps/admin/      NextJS — port 3001, admin panel
packages/shared/ Pure TS — @my-app/shared
```

## Quy tắc KHÔNG ĐƯỢC vi phạm

1. `packages/shared` KHÔNG import từ `next`, `react`, `@nestjs/*`
2. Mọi form dùng `react-hook-form` + `zodResolver` + `zod schema` — không dùng useState cho input
3. Mọi API call dùng functions từ `@my-app/shared` — không tự tạo axios instance mới
4. `apps/admin` dùng localStorage key `admin_accessToken`, KHÔNG phải `accessToken`
5. NestJS controller chỉ nhận DTO từ `@my-app/shared` — không tự định nghĩa interface riêng ở BE
6. Tất cả file TypeScript bật strict mode — không dùng `any` trừ khi cực kỳ cần thiết

## Quy ước đặt tên

### Backend (NestJS)
- Module: `feature.module.ts` — class `FeatureModule`
- Controller: `feature.controller.ts` — class `FeatureController`, decorator `@Controller('feature')`
- Service: `feature.service.ts` — class `FeatureService`
- Entity: `feature.entity.ts` — class `Feature` với `@Entity('features')` (TypeORM)
- DTO: đặt trong `packages/shared/src/dto/feature/`

### Frontend (NextJS)
- Page: `app/(group)/route/page.tsx` — default export, tên file luôn là `page.tsx`
- Component: `components/feature/FeatureName.tsx` — PascalCase, named export
- Hook: `hooks/useFeatureName.ts` — camelCase, prefix `use`
- Store: `stores/feature.store.ts` — export `useFeatureStore`

### Shared
- Interface: prefix `I` — `IUser`, `IOrder`
- DTO class: suffix `Dto` — `LoginDto`, `CreateOrderDto`
- Enum: PascalCase — `UserRole`, `OrderStatus`
- API object: suffix `Api` — `authApi`, `userApi`

## Workflow khi nhận task

Trước khi viết bất kỳ dòng code nào, Claude PHẢI:

1. **Đọc hiểu task** — xác định task thuộc loại nào (feature mới / bug fix / test)
2. **Propose plan** theo format:
   ```
   ## Plan
   **Task:** [mô tả ngắn]
   **Loại:** [NestJS module | NextJS page | Bug fix | Test]
   **Files sẽ tạo/sửa:**
   - [ ] path/to/file1.ts — [lý do]
   - [ ] path/to/file2.ts — [lý do]
   **Shared package cần update:** [có/không — lý do]
   **Thứ tự thực hiện:** [1→2→3]
   ```
3. **Chờ confirm** — chỉ bắt đầu code sau khi user gõ "ok", "confirm", hoặc "làm đi"
4. **Implement** theo đúng plan đã confirm
5. **Báo cáo** những gì đã làm, file nào đã tạo/sửa

## Thông tin môi trường

- Node.js: >= 18
- pnpm: >= 8
- PostgreSQL: local port 5432 hoặc `DATABASE_URL` từ .env
- Chạy dev: `pnpm dev:api`, `pnpm dev:web`, `pnpm dev:admin`
- Chạy tất cả: `pnpm dev`

## Khi thêm feature mới cần checklist

- [ ] DTO mới → thêm vào `packages/shared/src/dto/`
- [ ] Interface mới → thêm vào `packages/shared/src/interfaces/`
- [ ] API endpoint mới → thêm vào file api tương ứng trong `packages/shared/src/api/`
- [ ] Export từ `packages/shared/src/index.ts`
- [ ] NestJS: tạo module → import vào `app.module.ts`
- [ ] NextJS: tạo page trong đúng route group `(auth)` hoặc `(dashboard)`
