# Feature Specification: Ingredient Catalog

**Feature Branch**: `007-ingredient-catalog`  
**Created**: 2026-03-31  
**Status**: Draft  
**Input**: User description: "Thêm chức năng quản lý nguyên liệu (Ingredient Catalog): người dùng nhập và lưu thông tin nguyên liệu gồm tên, giá theo đơn vị (kg/lít/cái...), nơi mua (tên chợ/siêu thị), loại hàng (tươi/đông lạnh/khô/đóng hộp), số điện thoại người bán, ghi chú. Có tìm kiếm theo tên, lọc theo loại hàng. Tích hợp với Grocery List để hiển thị thông tin giá và nguồn mua khi xem danh sách mua sắm."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Thêm và quản lý thông tin nguyên liệu (Priority: P1)

Người dùng muốn lưu lại thông tin chi tiết về một nguyên liệu họ thường mua: tên, giá, đơn vị tính, nơi mua, loại hàng, số điện thoại người bán, và ghi chú tự do. Khi cần mua lại, họ có thể tra cứu ngay thay vì phải nhớ hoặc hỏi lại.

**Why this priority**: Đây là chức năng cốt lõi. Không có khả năng thêm/xem nguyên liệu thì các tính năng khác không có dữ liệu để hoạt động.

**Independent Test**: Vào trang Ingredient Catalog, thêm một nguyên liệu mới (ví dụ: "Mực tươi, 180.000đ/kg, chợ Bến Thành, tươi sống, 0909123456"), lưu lại và thấy hiển thị trong danh sách.

**Acceptance Scenarios**:

1. **Given** người dùng đã đăng nhập, **When** vào trang Ingredient Catalog và nhấn "Thêm nguyên liệu", **Then** form nhập liệu hiện ra với các trường: tên, giá, đơn vị, nơi mua, loại hàng, SĐT người bán, ghi chú.
2. **Given** người dùng điền tên nguyên liệu và nhấn Lưu, **Then** nguyên liệu xuất hiện trong danh sách với đầy đủ thông tin đã nhập.
3. **Given** một nguyên liệu đã lưu, **When** người dùng nhấn Sửa, **Then** form hiện lại với dữ liệu cũ, cho phép chỉnh sửa và lưu lại.
4. **Given** một nguyên liệu đã lưu, **When** người dùng nhấn Xóa và xác nhận, **Then** nguyên liệu bị xóa khỏi danh sách.
5. **Given** người dùng để trống trường Tên, **When** nhấn Lưu, **Then** form báo lỗi "Vui lòng nhập tên nguyên liệu".

---

### User Story 2 — Tìm kiếm và lọc nguyên liệu (Priority: P2)

Khi danh sách nguyên liệu đã lớn (hàng chục mục), người dùng cần tìm nhanh một nguyên liệu theo tên hoặc lọc theo loại hàng để không phải cuộn qua toàn bộ danh sách.

**Why this priority**: Tính năng tìm/lọc biến danh sách từ "khó dùng khi nhiều dữ liệu" thành "dễ sử dụng hằng ngày". Phụ thuộc vào P1 (phải có dữ liệu trước).

**Independent Test**: Thêm 5+ nguyên liệu thuộc các loại khác nhau, gõ từ khóa vào ô tìm kiếm → chỉ thấy nguyên liệu khớp tên. Chọn filter "Đông lạnh" → chỉ thấy nguyên liệu loại đông lạnh.

**Acceptance Scenarios**:

1. **Given** danh sách có nhiều nguyên liệu, **When** người dùng gõ "mực" vào ô tìm kiếm, **Then** chỉ hiển thị các nguyên liệu có tên chứa "mực".
2. **Given** người dùng chọn filter loại "Đông lạnh", **Then** chỉ hiển thị nguyên liệu có loại là "Đông lạnh".
3. **Given** tìm kiếm trả về 0 kết quả, **Then** hiển thị thông báo "Không tìm thấy nguyên liệu phù hợp".
4. **Given** đang có filter/tìm kiếm, **When** người dùng nhấn "Xóa bộ lọc", **Then** danh sách trở về trạng thái đầy đủ.

---

### User Story 3 — Xem thông tin nguyên liệu trong Grocery List (Priority: P3)

Khi người dùng xem Grocery List, mỗi mục nguyên liệu có trong Ingredient Catalog sẽ hiển thị thêm thông tin tham khảo: giá ước tính, nơi mua gợi ý. Giúp người dùng chuẩn bị ngân sách và biết mua ở đâu ngay trong trang mua sắm.

**Why this priority**: Tính năng tích hợp mang lại giá trị thực tế cao nhất, nhưng phụ thuộc P1 và P2 hoàn chỉnh. Nếu không có dữ liệu Catalog thì Grocery List vẫn hoạt động bình thường (graceful fallback).

**Independent Test**: Lên kế hoạch bữa ăn có dùng "Mực tươi", tạo Grocery List, vào trang Grocery List → thấy mục "Mực tươi" hiển thị thêm "~180.000đ/kg · Chợ Bến Thành".

**Acceptance Scenarios**:

1. **Given** nguyên liệu "Mực tươi" đã có trong Catalog với giá và nơi mua, **When** "Mực tươi" xuất hiện trong Grocery List, **Then** hiển thị thêm dòng phụ: giá tham khảo và nơi mua.
2. **Given** một nguyên liệu trong Grocery List không có trong Catalog, **Then** không hiển thị thêm thông tin gì (graceful fallback).
3. **Given** nguyên liệu trong Catalog được cập nhật giá mới, **Then** Grocery List hiển thị giá mới ở lần xem tiếp theo.

---

### Edge Cases

- Người dùng nhập SĐT không đúng định dạng → hệ thống cảnh báo nhưng vẫn cho lưu (SĐT là thông tin tham khảo).
- Tên nguyên liệu trùng nhau → hệ thống cho phép (cùng tên nhưng khác nguồn là hợp lệ).
- Giá bằng 0 hoặc để trống → hợp lệ, hiển thị "Chưa có giá".
- Danh sách trống → hiển thị empty state với CTA "Thêm nguyên liệu đầu tiên".
- Xóa nguyên liệu đang được tham chiếu trong Grocery List → Grocery List fallback về không hiển thị thông tin bổ sung (không báo lỗi).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Người dùng PHẢI có thể thêm một nguyên liệu mới với các trường: tên (bắt buộc), giá, đơn vị tính (kg/lít/cái/bó/...), nơi mua, loại hàng, số điện thoại người bán, ghi chú tự do.
- **FR-002**: Người dùng PHẢI có thể xem danh sách tất cả nguyên liệu đã lưu, sắp xếp theo tên A–Z mặc định.
- **FR-003**: Người dùng PHẢI có thể chỉnh sửa bất kỳ trường nào của nguyên liệu đã lưu.
- **FR-004**: Người dùng PHẢI có thể xóa một nguyên liệu sau khi xác nhận.
- **FR-005**: Hệ thống PHẢI hỗ trợ tìm kiếm nguyên liệu theo tên (tức thì, debounced, không cần nhấn Enter).
- **FR-006**: Hệ thống PHẢI hỗ trợ lọc danh sách theo loại hàng (tươi sống / đông lạnh / khô / đóng hộp / khác).
- **FR-007**: Dữ liệu Ingredient Catalog PHẢI được lưu trữ riêng biệt cho từng người dùng.
- **FR-008**: Khi xem Grocery List, mỗi mục nguyên liệu có trong Catalog PHẢI hiển thị thêm giá tham khảo và nơi mua (nếu có).
- **FR-009**: Trường Tên là bắt buộc; tất cả trường còn lại là tùy chọn.
- **FR-010**: Mục Ingredient Catalog PHẢI có thể truy cập từ sidebar navigation.

### Key Entities

- **CatalogEntry**: Thông tin chi tiết một nguyên liệu do người dùng tự nhập. Thuộc tính: id, userId, name (bắt buộc), price (số thực, tùy chọn), unit (chuỗi: "kg"/"lít"/"cái"/"bó"/v.v.), storeName (tên chợ/siêu thị), storeType (enum: tươi sống/đông lạnh/khô/đóng hộp/khác), sellerPhone (chuỗi, tùy chọn), notes (văn bản tự do), createdAt, updatedAt.
- **CatalogLookup**: Quan hệ tra cứu giữa tên nguyên liệu trong GroceryItem và CatalogEntry. Khớp theo tên (trim + lowercase), không phân biệt hoa thường.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng hoàn thành thêm một nguyên liệu mới (điền đầy đủ tất cả trường) trong dưới 60 giây.
- **SC-002**: Kết quả tìm kiếm cập nhật trong dưới 300ms sau khi người dùng dừng gõ.
- **SC-003**: Lọc theo loại hàng trả về đúng 100% nguyên liệu thuộc loại đó.
- **SC-004**: Thông tin giá và nơi mua hiển thị đúng trong Grocery List với tỷ lệ khớp tên ≥ 95% so với dữ liệu đã nhập.
- **SC-005**: Người dùng hoàn thành toàn bộ luồng (thêm → tìm kiếm → xem trong Grocery List) mà không cần hướng dẫn thêm.

---

## Assumptions

- Người dùng nhập giá theo đồng Việt Nam (VNĐ); không cần hỗ trợ đa tiền tệ ở phiên bản này.
- Khớp tên giữa GroceryItem và CatalogEntry dùng so sánh chuỗi đơn giản (trim + lowercase), không cần fuzzy matching.
- Không giới hạn số lượng CatalogEntry mỗi người dùng trong phạm vi MVP.
- Loại hàng (storeType) dùng danh sách cố định 5 giá trị: tươi sống, đông lạnh, khô, đóng hộp, khác.
- Không có tính năng chia sẻ catalog giữa các người dùng.
- Sidebar navigation thêm mục "Nguyên liệu" sau "Grocery List".
