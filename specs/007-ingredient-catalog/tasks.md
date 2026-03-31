# Tasks: Ingredient Catalog

**Input**: Design documents from `specs/007-ingredient-catalog/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/catalog-api.md ✅, quickstart.md ✅  
**Branch**: `007-ingredient-catalog`

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Có thể chạy song song (file khác nhau, không phụ thuộc task chưa xong)
- **[Story]**: User story liên quan (US1/US2/US3)
- Mỗi task có đường dẫn file cụ thể

---

## Phase 1: Setup (Shared Infrastructure)

**Mục đích**: Thiết lập nền tảng schema + types + i18n trước khi viết code tính năng.

- [X] T001 Tạo migration `supabase/migrations/004_catalog_entries.sql` với bảng `catalog_entries`, index, RLS policy và updated_at trigger
- [X] T002 [P] Thêm `StoreType` type và `CatalogEntry` interface vào `src/types/index.ts`
- [X] T003 [P] Thêm namespace `ingredientCatalog` và `storeTypes` vào `messages/vi.json`
- [X] T004 [P] Thêm namespace `ingredientCatalog` và `storeTypes` vào `messages/en.json`

**Checkpoint**: Schema và types sẵn sàng — có thể bắt đầu Phase 2.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Mục đích**: Infrastructure cốt lõi mà tất cả user stories đều cần — API routes, Context, service layer.

**⚠️ CRITICAL**: Tất cả US phụ thuộc vào phase này. Hoàn thành trước khi implement UI.

- [X] T005 Tạo `src/app/api/catalog/route.ts` — GET (list sorted A–Z) + POST (create, validate name required)
- [X] T006 Tạo `src/app/api/catalog/[id]/route.ts` — PUT (update) + DELETE (hard delete), cả hai kiểm tra ownership qua RLS
- [X] T007 [P] Tạo `src/services/catalog.ts` với functions `lookupByName(itemName, entries)` và `sortByName(entries)`
- [X] T008 Tạo `src/context/CatalogContext.tsx` — state (`entries`, `loading`, `error`), reducer (SET_ENTRIES/ADD_ENTRY/UPDATE_ENTRY/DELETE_ENTRY), provider với `apiDispatch`, và `useCatalog()` hook
- [X] T009 Bọc `CatalogProvider` vào `src/app/layout.tsx` (cùng vị trí với `GroceryProvider`)

**Checkpoint**: API routes + Context hoạt động — US1, US2, US3 có thể implement song song.

---

## Phase 3: User Story 1 — Thêm và quản lý thông tin nguyên liệu (Priority: P1) 🎯 MVP

**Goal**: Người dùng có thể thêm, xem, sửa, xóa nguyên liệu. Đây là MVP độc lập.

**Independent Test**: Vào `/ingredient-catalog`, nhấn "Thêm nguyên liệu", điền form (tên + tùy chọn), lưu → entry xuất hiện trong danh sách. Nhấn Sửa → form prefill. Nhấn Xóa + xác nhận → entry biến mất.

### Implementation for User Story 1

- [X] T010 [P] [US1] Tạo `src/components/catalog/CatalogForm.tsx` — form với 7 trường (name*, price, unit, storeName, storeType select, sellerPhone, notes), validation name required, submit gọi `apiDispatch`
- [X] T011 [P] [US1] Tạo `src/components/catalog/CatalogCard.tsx` — hiển thị name, price/unit, storeName, storeType badge, nút Sửa + Xóa với confirmation dialog
- [X] T012 [P] [US1] Tạo `src/components/catalog/CatalogEmptyState.tsx` — empty state với CTA "Thêm nguyên liệu đầu tiên"
- [X] T013 [US1] Tạo `src/components/catalog/CatalogList.tsx` — render danh sách `CatalogCard`, hiển thị `CatalogEmptyState` khi rỗng (phụ thuộc T011, T012)
- [X] T014 [US1] Tạo `src/app/ingredient-catalog/page.tsx` — trang chính: lấy data từ `useCatalog()`, nút "Thêm nguyên liệu" mở `CatalogForm` (Add mode), render `CatalogList` (phụ thuộc T010, T013)
- [X] T015 [US1] Thêm nav item "Nguyên liệu" vào `src/components/layout/Sidebar.tsx` — sau "Grocery List", dùng `t('nav.ingredientCatalog')`

**Checkpoint**: US1 hoàn chỉnh — người dùng có thể CRUD nguyên liệu từ trang `/ingredient-catalog`.

---

## Phase 4: User Story 2 — Tìm kiếm và lọc nguyên liệu (Priority: P2)

**Goal**: Người dùng có thể tìm theo tên (debounce 300ms) và lọc theo loại hàng. Clear filter trả về full list.

**Independent Test**: Có 5+ entries, gõ "mực" → chỉ thấy entries chứa "mực" trong tên. Chọn "Đông lạnh" → chỉ thấy frozen entries. Nhấn "Xóa bộ lọc" → danh sách đầy đủ. 0 kết quả → hiển thị "Không tìm thấy".

### Implementation for User Story 2

- [X] T016 [US2] Tạo `src/components/catalog/CatalogSearch.tsx` — input text (debounce 300ms), StoreType filter `<select>`, nút "Xóa bộ lọc"; nhận `onSearch(query)` + `onFilter(storeType)` callbacks
- [X] T017 [US2] Cập nhật `src/app/ingredient-catalog/page.tsx` — thêm state `searchQuery` + `filterStoreType`, pass vào `CatalogSearch`; filter entries in-memory trước khi pass vào `CatalogList`; thêm empty state message "Không tìm thấy nguyên liệu phù hợp" khi filter trả về 0 (phụ thuộc T016)

**Checkpoint**: US2 hoàn chỉnh — tìm kiếm và lọc hoạt động real-time.

---

## Phase 5: User Story 3 — Xem thông tin nguyên liệu trong Grocery List (Priority: P3)

**Goal**: Grocery List hiển thị thêm giá tham khảo + nơi mua cho mỗi item có trong Catalog. Graceful fallback nếu không tìm thấy.

**Independent Test**: Thêm "Mực tươi" vào Catalog (180k/kg, Chợ Bến Thành). Tạo meal plan có recipe dùng "Mực tươi", generate Grocery List. Vào Grocery List → thấy "Mực tươi" hiển thị thêm "~180.000đ/kg · Chợ Bến Thành". Nguyên liệu không có trong Catalog hiển thị bình thường.

### Implementation for User Story 3

- [X] T018 [US3] Cập nhật `src/components/grocery/GroceryCategory.tsx` — thêm prop `catalogEntries?: CatalogEntry[]`, gọi `lookupByName(item.name, catalogEntries)`, hiển thị dòng phụ `~{price}đ/{unit} · {storeName}` nếu có match (phụ thuộc T007)
- [X] T019 [US3] Cập nhật `src/app/grocery-list/page.tsx` — lấy `entries` từ `useCatalog()`, pass xuống `GroceryCategory` qua prop `catalogEntries` (phụ thuộc T018)

**Checkpoint**: US3 hoàn chỉnh — Grocery List hiển thị enriched data từ Catalog.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Mục đích**: Loading states, error handling, responsive layout, kiểm tra toàn bộ flow.

- [X] T020 [P] Thêm loading skeleton cho `CatalogList` khi `CatalogContext.loading === true`
- [X] T021 [P] Thêm error toast/banner trong `src/app/ingredient-catalog/page.tsx` khi `CatalogContext.error !== null`
- [X] T022 Kiểm tra responsive layout của trang `/ingredient-catalog` trên mobile (< 640px) và desktop
- [X] T023 Kiểm tra toàn bộ flow end-to-end: thêm nguyên liệu → tìm kiếm → lọc → xem trong Grocery List

---

## Dependencies (User Story completion order)

```
Phase 1 (T001–T004)
  └── Phase 2 (T005–T009)  [BLOCKING — tất cả US cần]
        ├── Phase 3: US1 (T010–T015)  [MVP — có thể implement trước]
        ├── Phase 4: US2 (T016–T017)  [phụ thuộc US1 page đã có]
        └── Phase 5: US3 (T018–T019)  [phụ thuộc T007 từ Phase 2]
              └── Phase 6: Polish (T020–T023)
```

## Parallel Execution Examples

### Ngay sau Phase 2 hoàn thành, có thể chạy song song:
- **Developer A**: T010 (CatalogForm) + T011 (CatalogCard) + T012 (CatalogEmptyState)
- **Developer B**: T015 (Sidebar nav)
- **Developer C**: T016 (CatalogSearch) — chuẩn bị sẵn cho US2

### Sau T013 (CatalogList) và T014 (page.tsx) xong:
- **Developer A**: T016 → T017 (US2 search/filter)
- **Developer B**: T018 → T019 (US3 Grocery integration)

## Implementation Strategy (MVP-first)

| Increment | Tasks | Deliverable |
|-----------|-------|------------|
| **MVP** | T001–T015 | Trang Ingredient Catalog đầy đủ CRUD, sidebar nav |
| **Search** | T016–T017 | Tìm kiếm + lọc theo loại hàng |
| **Integration** | T018–T019 | Grocery List hiển thị catalog hints |
| **Polish** | T020–T023 | Loading states, error handling, responsive |

**Suggested MVP scope**: Phase 1 + Phase 2 + Phase 3 (US1) — đủ để demo và collect feedback.

## Task Count Summary

| Phase | Task Count | User Story |
|-------|-----------|-----------|
| Phase 1: Setup | 4 (T001–T004) | — |
| Phase 2: Foundational | 5 (T005–T009) | — |
| Phase 3: US1 CRUD | 6 (T010–T015) | US1 P1 |
| Phase 4: US2 Search | 2 (T016–T017) | US2 P2 |
| Phase 5: US3 Grocery | 2 (T018–T019) | US3 P3 |
| Phase 6: Polish | 4 (T020–T023) | — |
| **TOTAL** | **23 tasks** | 3 user stories |
