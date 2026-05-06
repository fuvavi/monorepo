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
