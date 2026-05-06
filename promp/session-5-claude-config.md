# Session 5 — Claude Code Configuration & Agents

> **Đã hoàn thành:** Sessions 1-4 — monorepo chạy đầy đủ.
> **Mục tiêu session này:** Tạo các file config cho Claude Code để mọi session sau đều nhất quán,
> nhanh hơn, và không cần giải thích lại project structure.

---

## Folder tree cần tạo

```
my-app/
├── .claude/
│   ├── agents/
│   │   ├── be-module.md       # Agent tạo NestJS module
│   │   ├── fe-page.md         # Agent tạo NextJS page/component
│   │   ├── debugger.md        # Agent fix bug & debug
│   │   └── tester.md          # Agent viết unit test
│   └── settings.json          # Claude Code settings
├── CLAUDE.md                  # File chính — Claude đọc đầu tiên
└── ...existing files
```

---

## 1. CLAUDE.md — File quan trọng nhất

> Claude Code tự động đọc file này khi khởi động. Đây là "bộ nhớ" của project.

### `CLAUDE.md`
```markdown
# Project: My App — Monorepo

## Stack

| Layer | Tech |
|---|---|
| Backend | NestJS 10, MongoDB (Mongoose), Passport JWT |
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
- Schema: `feature.schema.ts` — class `Feature`, export `FeatureDocument`, `FeatureSchema`
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
- MongoDB: local port 27017 hoặc Atlas URI từ .env
- Chạy dev: `pnpm dev:api`, `pnpm dev:web`, `pnpm dev:admin`
- Chạy tất cả: `pnpm dev`

## Khi thêm feature mới cần checklist

- [ ] DTO mới → thêm vào `packages/shared/src/dto/`
- [ ] Interface mới → thêm vào `packages/shared/src/interfaces/`
- [ ] API endpoint mới → thêm vào file api tương ứng trong `packages/shared/src/api/`
- [ ] Export từ `packages/shared/src/index.ts`
- [ ] NestJS: tạo module → import vào `app.module.ts`
- [ ] NextJS: tạo page trong đúng route group `(auth)` hoặc `(dashboard)`
```

---

## 2. Claude Code Settings

### `.claude/settings.json`
```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm install*)",
      "Bash(pnpm dev*)",
      "Bash(pnpm build*)",
      "Bash(pnpm lint*)",
      "Bash(pnpm test*)",
      "Bash(git status)",
      "Bash(git diff*)",
      "Bash(git log*)",
      "Bash(cat *)",
      "Bash(ls *)"
    ],
    "deny": [
      "Bash(git push*)",
      "Bash(git commit*)",
      "Bash(rm -rf*)",
      "Bash(drop*)",
      "Bash(mongo* --eval *drop*)"
    ]
  }
}
```

> `deny` list ngăn Claude Code tự ý commit, push, hay xóa data. Mọi git action phải do bạn làm thủ công.

---

## 3. Agents

Agents là các file prompt chuyên biệt. Gọi bằng lệnh:
`claude --agent .claude/agents/be-module.md "Tạo module products"`

---

### `.claude/agents/be-module.md`

```markdown
# Agent: NestJS Module Creator

## Nhiệm vụ
Tạo một NestJS module hoàn chỉnh theo đúng cấu trúc của project.

## Đọc trước khi làm
- Đọc `CLAUDE.md` để nắm rules và conventions
- Đọc `apps/api/src/app.module.ts` để biết cách import module
- Đọc một module đã có (ví dụ `apps/api/src/modules/auth/`) để làm mẫu

## Các bước BẮT BUỘC theo thứ tự

### Bước 1 — Propose plan (PHẢI làm trước, chờ confirm)
Output plan theo format:
```
## Plan: Tạo module [tên]

**Files sẽ tạo trong packages/shared:**
- [ ] packages/shared/src/interfaces/[name].interface.ts
- [ ] packages/shared/src/dto/[name]/create-[name].dto.ts
- [ ] packages/shared/src/dto/[name]/update-[name].dto.ts
- [ ] packages/shared/src/api/[name].api.ts
- [ ] Cập nhật packages/shared/src/api/index.ts
- [ ] Cập nhật packages/shared/src/index.ts

**Files sẽ tạo trong apps/api:**
- [ ] apps/api/src/modules/[name]/[name].module.ts
- [ ] apps/api/src/modules/[name]/[name].controller.ts
- [ ] apps/api/src/modules/[name]/[name].service.ts
- [ ] apps/api/src/modules/[name]/schemas/[name].schema.ts
- [ ] Cập nhật apps/api/src/app.module.ts

**API endpoints sẽ tạo:**
- GET    /api/v1/[name]         — lấy danh sách (có phân trang)
- GET    /api/v1/[name]/:id     — lấy theo id
- POST   /api/v1/[name]         — tạo mới
- PATCH  /api/v1/[name]/:id     — cập nhật
- DELETE /api/v1/[name]/:id     — xóa
```
**Chờ user confirm trước khi viết code.**

### Bước 2 — Shared package trước
Luôn tạo shared package trước để BE có thể import DTO.

Thứ tự:
1. Interface → `packages/shared/src/interfaces/`
2. DTOs → `packages/shared/src/dto/[name]/`
3. API functions → `packages/shared/src/api/[name].api.ts`
4. Cập nhật barrel exports

### Bước 3 — NestJS files
Thứ tự:
1. Schema (Mongoose)
2. Service
3. Controller
4. Module
5. Import vào `app.module.ts`

### Bước 4 — Verify
Chạy: `pnpm --filter api build`
Nếu lỗi → fix trước khi báo hoàn thành.

## Template chuẩn

### Schema
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type [Name]Document = [Name] & Document;

@Schema({ timestamps: true })
export class [Name] {
  @Prop({ required: true })
  // fields...
}

export const [Name]Schema = SchemaFactory.createForClass([Name]);
```

### Service — luôn có CRUD đầy đủ
```typescript
@Injectable()
export class [Name]Service {
  constructor(@InjectModel([Name].name) private model: Model<[Name]Document>) {}

  async findAll(query: [Name]ListQuery): Promise<PaginatedResponse<I[Name]>> { }
  async findById(id: string): Promise<I[Name]> { }
  async create(dto: Create[Name]Dto): Promise<I[Name]> { }
  async update(id: string, dto: Update[Name]Dto): Promise<I[Name]> { }
  async remove(id: string): Promise<void> { }
}
```

### Controller — dùng JwtAuthGuard cho mọi route cần auth
```typescript
@Controller('[name]')
@UseGuards(JwtAuthGuard)
export class [Name]Controller {
  constructor(private [name]Service: [Name]Service) {}
  // CRUD methods...
}
```

## Lưu ý
- Mọi DTO đặt trong `packages/shared`, KHÔNG trong `apps/api`
- Dùng `PaginatedResponse<T>` từ `@my-app/shared` cho list endpoint
- Mongoose schema dùng `{ timestamps: true }` — luôn có `createdAt`, `updatedAt`
- Service ném `NotFoundException` khi không tìm thấy theo id
```

---

### `.claude/agents/fe-page.md`

```markdown
# Agent: NextJS Page & Component Creator

## Nhiệm vụ
Tạo page hoặc component cho `apps/web` hoặc `apps/admin`.

## Đọc trước khi làm
- Đọc `CLAUDE.md` để nắm rules
- Đọc `apps/web/src/app/(auth)/login/page.tsx` để hiểu pattern form
- Đọc `apps/web/src/app/(dashboard)/page.tsx` để hiểu pattern dashboard page
- Xác định task thuộc app nào: `web` hay `admin`

## Các bước BẮT BUỘC theo thứ tự

### Bước 1 — Propose plan (PHẢI làm trước, chờ confirm)
```
## Plan: Tạo [page/component] [tên]

**App:** [web | admin]
**Loại:** [Page | Component | Hook]
**Route:** [nếu là page — ví dụ: /dashboard/orders]
**Route group:** [(auth) | (dashboard)]

**Files sẽ tạo:**
- [ ] apps/[app]/src/app/([group])/[route]/page.tsx
- [ ] apps/[app]/src/components/[name]/[Name].tsx  (nếu cần)
- [ ] apps/[app]/src/hooks/use[Name].ts            (nếu cần)

**API calls cần dùng:**
- [tên function từ @my-app/shared]

**Shared package cần thêm:** [có/không — lý do]
```
**Chờ confirm.**

### Bước 2 — Kiểm tra API function
Trước khi viết page, kiểm tra `packages/shared/src/api/` đã có function cần dùng chưa.
Nếu chưa có → đề xuất thêm vào shared trước.

### Bước 3 — Tạo file

**Checklist bắt buộc cho mọi file:**
- [ ] `'use client'` ở đầu nếu dùng hooks, event handlers, browser API
- [ ] Form dùng `useForm` + `zodResolver` — KHÔNG dùng `useState` cho input
- [ ] API call dùng functions từ `@my-app/shared`
- [ ] Loading state và error state đều được handle
- [ ] Tailwind cho toàn bộ styling — không inline style
- [ ] TypeScript strict — không dùng `any`

### Bước 4 — Verify
Chạy: `pnpm --filter [web|admin] build`

## Pattern chuẩn

### List page (có fetch data)
```tsx
'use client';
import { useEffect, useState } from 'react';
import { [name]Api, I[Name] } from '@my-app/shared';

export default function [Name]Page() {
  const [items, setItems] = useState<I[Name][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    [name]Api.get.list()
      .then(res => setItems(res.data.data))
      .catch(err => setError(err.response?.data?.message ?? 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Đang tải...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return ( /* UI */ );
}
```

### Form page (tạo/sửa)
```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({ /* fields */ });
type FormData = z.infer<typeof schema>;

export default function [Name]FormPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await [name]Api.post.create(data);
      // redirect hoặc show success
    } catch (err: any) {
      setError('root', { message: err?.response?.data?.message ?? 'Có lỗi xảy ra' });
    }
  };

  return ( /* form UI */ );
}
```

## Lưu ý
- Page trong `(dashboard)` mặc định đã được protect bởi auth (layout check token)
- Dùng `redirect()` từ `next/navigation` cho server component, `router.push()` cho client component
- Component tái sử dụng đặt trong `components/ui/`, component của feature đặt trong `components/[feature]/`
```

---

### `.claude/agents/debugger.md`

```markdown
# Agent: Bug Debugger

## Nhiệm vụ
Phân tích, tìm nguyên nhân, và fix bug trong project.

## Đọc trước khi làm
- Đọc `CLAUDE.md` để nắm architecture
- KHÔNG fix ngay — luôn phân tích nguyên nhân trước

## Quy trình BẮT BUỘC

### Bước 1 — Thu thập thông tin
Nếu user chưa cung cấp đủ, hỏi:
- Bug xảy ra ở đâu? (api / web / admin / shared)
- Error message / stack trace cụ thể là gì?
- Reproduce steps?
- Bug xảy ra sau thay đổi nào gần đây không?

### Bước 2 — Phân tích (TRƯỚC KHI fix)
```
## Phân tích bug

**Triệu chứng:** [mô tả]
**Layer bị ảnh hưởng:** [api | web | admin | shared]
**Nguyên nhân có thể:**
1. [nguyên nhân 1 — xác suất cao/thấp]
2. [nguyên nhân 2]

**Files cần kiểm tra:**
- [ ] path/to/file.ts — [lý do]

**Giả thuyết chính:** [nguyên nhân khả năng cao nhất]
```

### Bước 3 — Propose fix (chờ confirm)
```
## Fix plan

**Root cause:** [nguyên nhân xác định]
**Thay đổi:**
- [ ] file.ts dòng X: [mô tả thay đổi]

**Không thay đổi:** [những gì KHÔNG sửa để tránh side effect]
**Test sau fix:** [cách verify bug đã fix]
```
**Chờ confirm.**

### Bước 4 — Fix và verify

Sau khi fix:
1. Chạy build: `pnpm build`
2. Chạy lint: `pnpm lint`
3. Mô tả cách tự test thủ công

## Các bug pattern phổ biến trong project này

### CORS error
- Kiểm tra `apps/api/src/main.ts` → `enableCors` có đúng origin không
- Kiểm tra port của web/admin có khớp với `WEB_URL`, `ADMIN_URL` trong `.env` không

### 401 Unauthorized
- Kiểm tra `localStorage.getItem('accessToken')` có giá trị không
- Kiểm tra `createApiClient()` đã được gọi trong `layout.tsx` chưa
- Kiểm tra `Authorization: Bearer` header có được đính vào request không (xem Network tab)

### Import error từ @my-app/shared
- Kiểm tra `pnpm install` đã chạy từ root chưa
- Kiểm tra `next.config.js` có `transpilePackages: ['@my-app/shared']` không
- Kiểm tra export trong `packages/shared/src/index.ts`

### Zustand persist không sync
- `setAuth()` trong store phải gọi `localStorage.setItem()` thủ công — không chỉ dựa vào persist middleware
- Kiểm tra `admin` dùng key `admin_accessToken`, không phải `accessToken`

### Type error strict mode
- Không cast `as any` — tìm đúng type
- Kiểm tra interface trong `packages/shared/src/interfaces/`
```

---

### `.claude/agents/tester.md`

```markdown
# Agent: Unit Test Writer

## Nhiệm vụ
Viết unit test cho NestJS service hoặc NextJS hook/utility.

## Đọc trước khi làm
- Đọc `CLAUDE.md`
- Đọc file cần test để hiểu logic
- Xác định test framework: Jest (cả api lẫn web)

## Quy trình BẮT BUỘC

### Bước 1 — Propose plan (chờ confirm)
```
## Test plan: [tên file]

**File cần test:** path/to/file.ts
**Test file sẽ tạo:** path/to/file.spec.ts
**Số test cases:** ~[N]

**Test cases:**
- [ ] [tên case 1] — [happy path / edge case / error case]
- [ ] [tên case 2]
- ...

**Cần mock:**
- [ ] [dependency 1] — [lý do mock]
```
**Chờ confirm.**

### Bước 2 — Viết test

## Pattern chuẩn cho NestJS Service

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { [Name]Service } from './[name].service';
import { [Name] } from './schemas/[name].schema';

const mockModel = {
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

describe('[Name]Service', () => {
  let service: [Name]Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        [Name]Service,
        { provide: getModelToken([Name].name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<[Name]Service>([Name]Service);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return paginated list', async () => {
      // arrange
      mockModel.find.mockReturnValue({ lean: () => Promise.resolve([]) });
      // act
      const result = await service.findAll({});
      // assert
      expect(result.data).toEqual([]);
      expect(mockModel.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockReturnValue({ lean: () => Promise.resolve(null) });
      await expect(service.findById('invalid-id')).rejects.toThrow('NotFoundException');
    });
  });
});
```

## Quy tắc viết test
- Mỗi `describe` là một method của service
- Mỗi `it` là một scenario: happy path, not found, conflict, validation fail
- Mock tất cả external dependency (Model, JwtService, ConfigService...)
- KHÔNG test implementation detail — test behavior (input → output)
- Tên test: `should [expected behavior] when [condition]`
- Chạy verify: `pnpm --filter api test --testPathPattern=[name].service`
```

---

## 4. Cách dùng trong thực tế

Sau khi tạo xong các file trên, workflow hàng ngày với Claude Code:

```bash
# Khởi động Claude Code tại root project
claude

# Claude tự đọc CLAUDE.md → biết toàn bộ context
# Sau đó gõ task bình thường, ví dụ:

> Tạo module products cho NestJS, có tên, mô tả, giá, số lượng tồn kho

# Claude sẽ propose plan → bạn confirm → Claude implement

# Hoặc gọi agent chuyên biệt:
claude --agent .claude/agents/be-module.md "Tạo module orders"
claude --agent .claude/agents/fe-page.md "Tạo trang danh sách đơn hàng cho admin"
claude --agent .claude/agents/debugger.md "Fix lỗi 401 khi gọi API từ admin"
claude --agent .claude/agents/tester.md "Viết test cho AuthService"
```

---

## Checkpoint

Verify cấu trúc:
```bash
ls .claude/
# agents/  settings.json

ls .claude/agents/
# be-module.md  debugger.md  fe-page.md  tester.md

cat CLAUDE.md | head -5
# # Project: My App — Monorepo
```

Session 5 hoàn thành khi tất cả file trên tồn tại đúng vị trí.

---

## Toàn bộ monorepo đã hoàn thiện!

```
Session 1 ✅  Root workspace + Turborepo
Session 2 ✅  packages/shared (interfaces, DTOs, API functions)
Session 3 ✅  apps/api — NestJS + MongoDB + Auth
Session 4 ✅  apps/web + apps/admin — NextJS + Tailwind + Zustand + react-hook-form
Session 5 ✅  Claude Code config — CLAUDE.md + agents + settings
```
