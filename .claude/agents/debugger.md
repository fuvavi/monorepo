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
