# API Contract: Ingredient Catalog

**Feature**: 007-ingredient-catalog  
**Date**: 2026-03-31  
**Base URL**: `/api/catalog`  
**Auth**: All endpoints require valid Supabase session cookie (401 if not authenticated)

---

## Endpoints

### GET /api/catalog

Trả về tất cả catalog entries của user hiện tại, sắp xếp A–Z theo name.

**Request**: No body, no query params.

**Response 200**:
```json
{
  "entries": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Mực tươi",
      "price": 180000,
      "unit": "kg",
      "storeName": "Chợ Bến Thành",
      "storeType": "fresh",
      "sellerPhone": "0909123456",
      "notes": "Mua buổi sáng sớm",
      "createdAt": "2026-03-31T07:00:00Z",
      "updatedAt": "2026-03-31T07:00:00Z"
    }
  ]
}
```

**Response 401**: `{ "error": "Unauthorized" }`

---

### POST /api/catalog

Tạo một catalog entry mới.

**Request body**:
```json
{
  "name": "Mực tươi",           // required, string, min 1 char after trim
  "price": 180000,              // optional, number ≥ 0
  "unit": "kg",                 // optional, string
  "storeName": "Chợ Bến Thành", // optional, string
  "storeType": "fresh",         // optional, one of: fresh|frozen|dry|canned|other
  "sellerPhone": "0909123456",  // optional, string
  "notes": "Mua sáng sớm"       // optional, string
}
```

**Response 201**:
```json
{
  "entry": { ...CatalogEntry }
}
```

**Response 400**: `{ "error": "name is required" }`  
**Response 401**: `{ "error": "Unauthorized" }`

---

### PUT /api/catalog/[id]

Cập nhật một catalog entry. Chỉ owner mới được sửa (RLS enforce).

**Request body**: Same shape as POST (all fields optional, name required if included).

**Response 200**:
```json
{
  "entry": { ...CatalogEntry }
}
```

**Response 400**: `{ "error": "name is required" }`  
**Response 401**: `{ "error": "Unauthorized" }`  
**Response 404**: `{ "error": "Not found" }`

---

### DELETE /api/catalog/[id]

Xóa một catalog entry. Hard delete.

**Request**: No body.

**Response 200**: `{ "success": true }`  
**Response 401**: `{ "error": "Unauthorized" }`  
**Response 404**: `{ "error": "Not found" }`

---

## Field Mapping: DB → TypeScript

| DB column | TS field |
|-----------|---------|
| `id` | `id` |
| `user_id` | `userId` |
| `name` | `name` |
| `price` | `price` |
| `unit` | `unit` |
| `store_name` | `storeName` |
| `store_type` | `storeType` |
| `seller_phone` | `sellerPhone` |
| `notes` | `notes` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |
