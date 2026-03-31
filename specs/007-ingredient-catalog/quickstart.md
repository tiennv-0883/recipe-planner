# Quickstart: Ingredient Catalog

**Feature**: 007-ingredient-catalog  
**Date**: 2026-03-31

---

## Mục tiêu

Sau khi đọc tài liệu này, developer mới có thể hiểu và phát triển tính năng Ingredient Catalog mà không cần hỏi thêm.

---

## 1. Chạy migration

```sql
-- Chạy trực tiếp trên Supabase SQL Editor hoặc push qua Supabase CLI
\i supabase/migrations/004_catalog_entries.sql
```

> Nếu dùng Supabase CLI: `supabase db push`

---

## 2. Luồng dữ liệu

```
User action (UI)
  → CatalogContext.apiDispatch({ type: 'ADD_ENTRY', ... })
    → fetch('POST /api/catalog', body)
      → Route Handler: auth check → insert into catalog_entries (RLS)
        → returns CatalogEntry JSON
      → CatalogContext reducer: ADD_ENTRY → state.entries updated
        → CatalogList re-renders với entry mới
```

---

## 3. Thêm một entry mới (code flow)

```tsx
// src/context/CatalogContext.tsx
const { apiDispatch } = useCatalog()
apiDispatch({
  type: 'ADD_ENTRY',
  payload: {
    name: 'Mực tươi',
    price: 180000,
    unit: 'kg',
    storeName: 'Chợ Bến Thành',
    storeType: 'fresh',
    sellerPhone: '0909123456',
    notes: ''
  }
})
```

---

## 4. Tra cứu trong Grocery List

```ts
// src/services/catalog.ts
import { lookupByName } from '@/src/services/catalog'
import { useCatalog } from '@/src/context/CatalogContext'

// Trong GroceryCategory component:
const { state: { entries } } = useCatalog()
const match = lookupByName(groceryItem.name, entries)
// match?.price, match?.storeName → hiển thị hint
```

---

## 5. Thêm translation key

Mọi string UI phải có trong `messages/vi.json` và `messages/en.json` dưới namespace `ingredientCatalog` hoặc `storeTypes`. Xem phần "Integration Points → i18n" trong `plan.md`.

---

## 6. Files cần tạo mới

| File | Mục đích |
|------|---------|
| `supabase/migrations/004_catalog_entries.sql` | Schema migration |
| `src/types/index.ts` (modify) | Thêm `CatalogEntry`, `StoreType` |
| `src/context/CatalogContext.tsx` | State management |
| `src/services/catalog.ts` | `lookupByName`, `sortByName` |
| `src/app/api/catalog/route.ts` | GET + POST |
| `src/app/api/catalog/[id]/route.ts` | PUT + DELETE |
| `src/app/ingredient-catalog/page.tsx` | Trang chính |
| `src/components/catalog/*.tsx` | UI components |

## 7. Files cần sửa

| File | Thay đổi |
|------|---------|
| `src/components/layout/Sidebar.tsx` | Thêm nav item |
| `src/app/grocery-list/page.tsx` | Pass `catalogEntries` prop |
| `src/components/grocery/GroceryCategory.tsx` | Hiển thị catalog hint |
| `messages/vi.json` | Thêm `ingredientCatalog`, `storeTypes`, `nav.ingredientCatalog` |
| `messages/en.json` | Same |
