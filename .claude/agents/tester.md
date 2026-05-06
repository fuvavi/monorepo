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
