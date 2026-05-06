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
