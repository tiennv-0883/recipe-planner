# Data Model: Ingredient Catalog

**Feature**: 007-ingredient-catalog  
**Date**: 2026-03-31

---

## Entities

### CatalogEntry

Thông tin chi tiết về một nguyên liệu do người dùng tự nhập.

| Field | Type | Required | Constraint | Description |
|-------|------|----------|-----------|-------------|
| `id` | uuid | yes | PK, auto-gen | Unique identifier |
| `userId` | uuid | yes | FK → auth.users | Owner — RLS enforced |
| `name` | string | **yes** | trim length ≥ 1 | Tên nguyên liệu |
| `price` | number | no | integer ≥ 0 | Giá theo đơn vị (VNĐ) |
| `unit` | string | no | free text | "kg", "lít", "cái", "bó", ... |
| `storeName` | string | no | free text | Tên chợ hoặc siêu thị |
| `storeType` | StoreType enum | no | one of 5 values | Loại hàng |
| `sellerPhone` | string | no | free text | SĐT người bán (không validate format) |
| `notes` | string | no | free text | Ghi chú tự do |
| `createdAt` | timestamp | yes | auto | Thời điểm tạo |
| `updatedAt` | timestamp | yes | auto trigger | Thời điểm cập nhật cuối |

### StoreType Enum

| Value (DB) | Display (vi) | Display (en) |
|-----------|------------|-------------|
| `fresh` | Tươi sống | Fresh |
| `frozen` | Đông lạnh | Frozen |
| `dry` | Khô | Dry |
| `canned` | Đóng hộp | Canned |
| `other` | Khác | Other |

---

## Relationships

```
auth.users (1) ──< catalog_entries (N)
  user_id FK, cascaded delete, RLS

grocery_items (N) ──? catalog_entries (1)
  LOGICAL only — no FK
  Lookup: trim(lower(grocery_items.name)) == trim(lower(catalog_entries.name))
  Match returns: price, unit, storeName (displayed as hint)
  If no match: no hint shown (graceful fallback)
```

> Không có FK vật lý giữa `grocery_items` và `catalog_entries`. Đây là enrichment lookup thuần logic, đảm bảo Grocery List không phụ thuộc vào Catalog (Principle I).

---

## Validation Rules

| Rule | Field | Behavior |
|------|-------|---------|
| Name required | `name` | Frontend + backend: reject if empty after trim |
| Price non-negative | `price` | Frontend: min=0; backend: check |
| StoreType valid | `storeType` | Backend: must be one of enum values or null |
| SellerPhone | `sellerPhone` | No format validation — stored as-is |
| Duplicates allowed | `name` | Same name from different sources is valid |

---

## State Transitions

```
(empty)
   │ FR-001: Add
   ▼
[CatalogEntry created]
   │ FR-003: Edit any field
   ▼
[CatalogEntry updated]
   │ FR-004: Delete + confirm
   ▼
[Deleted]
```

No complex state machine — entries are simple data records.

---

## Default Sort Order

All list views sort by `name ASC` (case-insensitive, locale-aware for Vietnamese).
