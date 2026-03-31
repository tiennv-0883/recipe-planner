# Implementation Plan: Ingredient Catalog

**Branch**: `007-ingredient-catalog` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/007-ingredient-catalog/spec.md`

## Summary

Xây dựng trang Ingredient Catalog cho phép người dùng lưu trữ thông tin nguyên liệu (tên, giá, đơn vị, nơi mua, loại hàng, SĐT người bán, ghi chú), tìm kiếm theo tên (debounced), lọc theo loại hàng, và tích hợp với Grocery List để hiển thị thông tin giá + nơi mua bên cạnh mỗi mục nguyên liệu.

Cách tiếp cận: thêm bảng `catalog_entries` vào Supabase Postgres (kèm RLS), tạo REST API route handler tại `/api/catalog`, tạo `CatalogContext` theo pattern hiện có, trang `/ingredient-catalog`, và sửa `GroceryCategory` để tra cứu catalog.

## Technical Context

**Language/Version**: TypeScript 5 + Next.js 15.2.2 (App Router)
**Primary Dependencies**: @supabase/supabase-js 2.x, @supabase/ssr, next-intl 4.8.3, Tailwind CSS 3
**Storage**: Supabase Postgres — bảng mới `catalog_entries` với RLS `auth.uid() = user_id`
**Testing**: Jest 29 + @testing-library/react 16
**Target Platform**: Web — macOS/Windows/Mobile browsers
**Project Type**: Web application (Next.js App Router, monolith — không có backend/ riêng)
**Performance Goals**: Tìm kiếm debounced ≤ 300ms; CRUD response ≤ 500ms p95
**Constraints**: Per-user data isolation qua RLS; offline không required; VNĐ only
**Scale/Scope**: MVP — số lượng entry không giới hạn; single-user catalog per người dùng

## Constitution Check

*GATE: Evaluated pre-design và post-design.*

| Gate | Principle | Status | Notes |
|------|-----------|--------|-------|
| Module boundaries respected? | I — Module Cohesion | ✅ PASS | Ingredient Catalog là module độc lập. Grocery List chỉ tra cứu catalog qua service function — không query chéo DB trực tiếp |
| Recipe data flows qua Recipe Manager? | II — Single Source of Truth | ✅ PASS | `catalog_entries` là dữ liệu người dùng tự nhập (không phải recipe ingredients). Không vi phạm: grocery list vẫn tổng hợp từ recipe → meal plan, catalog chỉ cung cấp metadata tham khảo (giá, nơi mua) |
| Tests viết trước implementation? | III — Test-First | ✅ PASS (bắt buộc) | Tasks.md sẽ yêu cầu viết unit tests cho service functions và API routes trước khi implement UI |
| Schema change có migration script? | V — Data Integrity | ✅ PASS | Sẽ tạo `supabase/migrations/004_catalog_entries.sql` |

**Kết luận**: Không có vi phạm Constitution. Plan có thể tiến hành.

> **Lưu ý về Principle II**: `catalog_entries.name` là dữ liệu do người dùng nhập độc lập, không phải ingredient từ recipe. Việc Grocery List tra cứu catalog theo tên là enrichment/hint — không thay thế nguồn gốc ingredient từ recipe. Đây là additive integration, không vi phạm Single Source of Truth.

## Project Structure

### Documentation (this feature)

```text
specs/007-ingredient-catalog/
├── plan.md          ← file này
├── research.md      ← Phase 0
├── data-model.md    ← Phase 1
├── contracts/       ← Phase 1
│   └── catalog-api.md
├── quickstart.md    ← Phase 1
└── tasks.md         ← Phase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   └── catalog/
│   │       ├── route.ts            ← GET (list) / POST (create)
│   │       └── [id]/
│   │           └── route.ts        ← PUT (update) / DELETE
│   └── ingredient-catalog/
│       └── page.tsx                ← Trang chính (client component)
├── components/
│   ├── catalog/                    ← Thư mục mới
│   │   ├── CatalogList.tsx         ← Danh sách entries
│   │   ├── CatalogCard.tsx         ← Một entry card
│   │   ├── CatalogForm.tsx         ← Form thêm/sửa
│   │   ├── CatalogSearch.tsx       ← Search + filter bar
│   │   └── CatalogEmptyState.tsx   ← Empty state
│   ├── grocery/
│   │   └── GroceryCategory.tsx     ← MODIFIED: hiển thị catalog hint
│   └── layout/
│       └── Sidebar.tsx             ← MODIFIED: thêm nav item
├── context/
│   └── CatalogContext.tsx          ← State + API dispatch (pattern từ GroceryContext)
├── services/
│   └── catalog.ts                  ← lookupByName(), sortByName()
└── types/
    └── index.ts                    ← MODIFIED: thêm CatalogEntry, StoreType

supabase/migrations/
└── 004_catalog_entries.sql         ← Migration mới

messages/
├── vi.json                         ← MODIFIED: thêm namespace `ingredientCatalog`, `storeTypes`
└── en.json                         ← MODIFIED: same
```

**Structure Decision**: Single Next.js App Router monolith — theo đúng kiến trúc hiện có của project. Không tạo thêm tầng abstraction. API route handlers giao tiếp trực tiếp với Supabase theo pattern của tất cả routes hiện tại.

---

## Architecture Decisions

### AD-001: REST API Route Handlers (không dùng Server Actions)

**Decision**: Dùng `/api/catalog/route.ts` + `/api/catalog/[id]/route.ts` cho CRUD.

**Rationale**: Toàn bộ CRUD trong project đều dùng REST API route handlers (xem `api/recipes`, `api/grocery-lists`). Server Actions chỉ được dùng cho `setLocale()`. Duy trì pattern nhất quán để onboarding dễ dàng.

**Alternative rejected**: Server Actions — sẽ tạo ra pattern không nhất quán với 12 API routes hiện có.

---

### AD-002: CatalogContext cho client-state management

**Decision**: Tạo `CatalogContext.tsx` theo đúng cấu trúc `GroceryContext.tsx`.

**Rationale**: Project dùng React Context + `useReducer` cho client state, kết hợp optimistic updates. Pattern đã hoạt động cho Recipes và Grocery. Không cần thư viện state management mới.

**Alternative rejected**: Zustand/Jotai — over-engineering cho quy mô hiện tại; thêm dependency không cần thiết.

---

### AD-003: Debounce tìm kiếm ở client (không phải server)

**Decision**: Search filter chạy trên client-side với data đã load vào CatalogContext. Debounce 300ms.

**Rationale**: Catalog entries là dữ liệu nhỏ (< vài trăm entries). Load toàn bộ vào context khi mount, filter in-memory là đủ nhanh và tránh round-trip network mỗi lần gõ.

**Alternative rejected**: Server-side search với debounce API call — phức tạp hơn, cần xử lý race condition, không cần thiết cho quy mô MVP.

---

### AD-004: Grocery List enrichment qua service function (không phải JOIN)

**Decision**: Khi Grocery List page load, `CatalogContext` đã có data. Component `GroceryCategory` nhận thêm `catalogEntries` prop và gọi `lookupByName(itemName, entries)` từ `services/catalog.ts`.

**Rationale**: Tránh thay đổi Grocery List API và Grocery List Context — giữ nguyên existing code. Enrichment là read-only và chỉ cần khi render. Graceful fallback: nếu `catalogEntries` không có entry nào khớp, không hiển thị gì thêm.

**Alternative rejected**: JOIN trong grocery API — vi phạm module boundary (Principle I); làm phức tạp grocery generation logic.

---

## Database Schema

### Migration: `supabase/migrations/004_catalog_entries.sql`

```sql
-- catalog_entries: per-user ingredient catalog
create table public.catalog_entries (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  name         text        not null check (length(trim(name)) >= 1),
  price        numeric(12,0),                         -- VNĐ, nullable
  unit         text,                                  -- 'kg','lít','cái','bó', free text
  store_name   text,                                  -- tên chợ/siêu thị
  store_type   text check (
    store_type is null or store_type in (
      'fresh','frozen','dry','canned','other'
    )
  ),
  seller_phone text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Index for fast name search (case-insensitive)
create index catalog_entries_user_name_idx
  on public.catalog_entries (user_id, lower(name));

-- RLS
alter table public.catalog_entries enable row level security;

create policy "Users can manage own catalog entries"
  on public.catalog_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- updated_at trigger (reuse existing pattern)
create trigger set_catalog_entries_updated_at
  before update on public.catalog_entries
  for each row execute function public.set_updated_at();
```

### Updated TypeScript Types (`src/types/index.ts`)

```ts
export type StoreType = 'fresh' | 'frozen' | 'dry' | 'canned' | 'other'

export interface CatalogEntry {
  id: string
  userId: string
  name: string
  price?: number        // VNĐ, undefined = not set
  unit?: string
  storeName?: string
  storeType?: StoreType
  sellerPhone?: string
  notes?: string
  createdAt: string
  updatedAt: string
}
```

---

## Component Design

### Trang `/ingredient-catalog`

```
IngredientCatalogPage (client)
├── CatalogSearch          ← input text (debounce 300ms) + StoreType filter dropdown + "Xóa bộ lọc" button
├── Button "Thêm nguyên liệu" → mở CatalogForm (Add mode)
├── CatalogList
│   ├── CatalogCard × N    ← name, price/unit, storeName, storeType badge
│   │   ├── Button "Sửa"   → mở CatalogForm (Edit mode, pre-filled)
│   │   └── Button "Xóa"   → confirm dialog → DELETE
│   └── CatalogEmptyState  ← khi list rỗng hoặc filter trả về 0 kết quả
└── CatalogForm (modal/slide-over)
    ├── name* (required)
    ├── price (number)
    ├── unit (text)
    ├── storeName (text)
    ├── storeType (select: 5 options)
    ├── sellerPhone (text)
    └── notes (textarea)
```

### State trong CatalogContext

```ts
interface CatalogState {
  entries: CatalogEntry[]
  loading: boolean
  error: string | null
}

type CatalogAction =
  | { type: 'SET_ENTRIES'; payload: CatalogEntry[] }
  | { type: 'ADD_ENTRY'; payload: CatalogEntry }
  | { type: 'UPDATE_ENTRY'; payload: CatalogEntry }
  | { type: 'DELETE_ENTRY'; payload: { id: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
```

### Service: `src/services/catalog.ts`

```ts
// Tra cứu catalog theo tên (case-insensitive, trim)
export function lookupByName(
  itemName: string,
  entries: CatalogEntry[]
): CatalogEntry | undefined

// Sắp xếp A-Z theo name
export function sortByName(entries: CatalogEntry[]): CatalogEntry[]
```

---

## Integration Points

### 1. Sidebar Navigation

**File**: `src/components/layout/Sidebar.tsx`
**Change**: Thêm item vào `NAV_ITEMS`:

```ts
{ href: '/ingredient-catalog', labelKey: 'ingredientCatalog', icon: <BookOpenIcon /> }
```

Đặt sau `groceryList`. Thêm key `nav.ingredientCatalog` vào `vi.json` và `en.json`.

---

### 2. Grocery List Integration

**File**: `src/components/grocery/GroceryCategory.tsx`
**Change**: Nhận thêm prop `catalogEntries: CatalogEntry[]`, gọi `lookupByName()` cho mỗi item. Nếu tìm thấy, hiển thị dòng phụ:

```tsx
{match && (
  <span className="text-xs text-gray-400">
    {match.price ? `~${match.price.toLocaleString('vi-VN')}đ` : ''}
    {match.price && match.storeName ? ' · ' : ''}
    {match.storeName ?? ''}
  </span>
)}
```

**File**: `src/app/grocery-list/page.tsx`
**Change**: Lấy `entries` từ `CatalogContext` và pass xuống `GroceryCategory`.

**Fallback contract**: Nếu `CatalogContext` chưa load xong hoặc không có entry khớp → không render dòng phụ. Grocery List vẫn hoạt động hoàn toàn bình thường.

---

### 3. i18n Namespaces mới

Thêm vào `messages/vi.json` và `messages/en.json`:

```json
// vi.json
"ingredientCatalog": {
  "title": "Nguyên liệu",
  "addButton": "Thêm nguyên liệu",
  "empty": {
    "title": "Chưa có nguyên liệu nào",
    "cta": "Thêm nguyên liệu đầu tiên"
  },
  "noResults": "Không tìm thấy nguyên liệu phù hợp",
  "clearFilter": "Xóa bộ lọc",
  "search": { "placeholder": "Tìm theo tên..." },
  "form": {
    "titleAdd": "Thêm nguyên liệu",
    "titleEdit": "Sửa nguyên liệu",
    "name": "Tên nguyên liệu",
    "namePlaceholder": "VD: Mực tươi",
    "nameRequired": "Vui lòng nhập tên nguyên liệu",
    "price": "Giá (VNĐ)",
    "unit": "Đơn vị",
    "unitPlaceholder": "VD: kg, lít, cái",
    "storeName": "Nơi mua",
    "storeNamePlaceholder": "VD: Chợ Bến Thành",
    "storeType": "Loại hàng",
    "sellerPhone": "SĐT người bán",
    "notes": "Ghi chú",
    "save": "Lưu",
    "cancel": "Hủy"
  },
  "deleteConfirm": "Bạn có chắc muốn xóa nguyên liệu này?",
  "priceNotSet": "Chưa có giá"
},
"storeTypes": {
  "all": "Tất cả",
  "fresh": "Tươi sống",
  "frozen": "Đông lạnh",
  "dry": "Khô",
  "canned": "Đóng hộp",
  "other": "Khác"
}
```

---

## Phase Summary

| Phase | Deliverable | Ghi chú |
|-------|-------------|---------|
| Phase 0 | `research.md` | Đã resolve: không có NEEDS CLARIFICATION |
| Phase 1 | `data-model.md`, `contracts/catalog-api.md`, `quickstart.md` | Sinh ngay trong plan này |
| Phase 2 | `tasks.md` | `/speckit.tasks` command |
