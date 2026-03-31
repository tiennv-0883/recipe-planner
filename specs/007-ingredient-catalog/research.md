# Research: Ingredient Catalog

**Feature**: 007-ingredient-catalog  
**Date**: 2026-03-31  
**Status**: Complete — no NEEDS CLARIFICATION items remain

---

## Findings

### Decision 1: Client-side filtering vs. server-side search

**Decision**: Filter in-memory trên client (data đã load vào CatalogContext).  
**Rationale**: Catalog entries per user là tập dữ liệu nhỏ (< vài trăm records MVP). Load once khi mount, filter với JavaScript là đủ nhanh (< 1ms cho 500 records). Đơn giản hơn nhiều so với debounce API call + race condition handling.  
**Alternatives considered**: Supabase ilike query mỗi lần gõ — thêm latency, cần abort controller, over-engineering cho quy mô hiện tại.

---

### Decision 2: Data model đơn giản — không cần bảng trung gian

**Decision**: Một bảng `catalog_entries` (user_id, name, price, unit, store_name, store_type, seller_phone, notes).  
**Rationale**: Mỗi entry là một record độc lập. Không có quan hệ nhiều-nhiều. Không cần normalization ở mức này vì storeType là enum cố định, không phải entity riêng.  
**Alternatives considered**: Bảng `stores` riêng + FK — over-engineering; người dùng có thể nhập tên chợ tùy ý, không cần enforce uniqueness.

---

### Decision 3: String matching cho Grocery List lookup

**Decision**: So sánh `trim().toLowerCase()` giữa `grocery_items.name` và `catalog_entries.name`.  
**Rationale**: Spec yêu cầu rõ ràng "so sánh chuỗi đơn giản (trim + lowercase), không cần fuzzy matching". Simple is better. Match rate ≥ 95% đạt được nếu người dùng nhất quán trong cách đặt tên.  
**Alternatives considered**: Fuzzy matching (Levenshtein distance) — complexity không justified cho MVP; có thể thêm sau nếu user feedback yêu cầu.

---

### Decision 4: StoreType là enum cố định 5 giá trị

**Decision**: `'fresh' | 'frozen' | 'dry' | 'canned' | 'other'` — lưu bằng tiếng Anh trong DB, dịch qua i18n.  
**Rationale**: Spec chỉ định rõ 5 loại: tươi sống/đông lạnh/khô/đóng hộp/khác. Lưu bằng tiếng Anh để DB không phụ thuộc vào locale. Dịch sang tiếng Việt/Anh qua namespace `storeTypes` trong next-intl.  
**Alternatives considered**: Free-text field — khó filter, không consistent giữa các entries.

---

### Decision 5: Updated_at trigger — tái sử dụng pattern hiện có

**Decision**: Dùng function `public.set_updated_at()` đã có trong DB (được dùng cho `recipes`, `meal_plans`).  
**Rationale**: Không tạo mới. Đây là best practice đã được thiết lập trong migration 001.  
**Alternatives considered**: Application-level update — sẽ bỏ sót nếu có direct DB update; trigger reliable hơn.

---

### Decision 6: Không cần soft-delete cho catalog_entries

**Decision**: Hard delete sau confirmation dialog.  
**Rationale**: Constitution Principle V yêu cầu soft-delete cho `recipes` và `meal_plans` vì người dùng đầu tư nhiều công sức. Catalog entries là metadata tham khảo đơn giản — user không mất công lớn khi xóa nhầm, và không có FK reference cascade (grocery items không foreign key đến catalog). Hard delete đơn giản hơn và phù hợp với yêu cầu spec (FR-004: "xác nhận trước khi xóa").  
**Constitution alignment**: "Soft-delete MUST be used for recipes and meal plans" — không đề cập catalog entries. Quyết định này có documented rationale.
