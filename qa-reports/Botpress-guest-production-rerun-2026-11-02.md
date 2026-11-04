# Báo cáo kiểm thử Botpress production — Guest và Auth — 02/11/2026

## Tóm tắt

- **Môi trường:** storefront production, `https://tiem-mua-cham-store.vercel.app/collections`.
- **Thời gian kiểm thử guest:** khoảng 17:53–18:01 ICT, ngày 02/11/2026.
- **Trạng thái guest:** có liên kết đăng nhập, không có nút đăng xuất.
- **Hội thoại:** hai hội thoại guest mới; các câu hỏi nối tiếp được giữ cùng một hội thoại trong từng chuỗi thử nghiệm.
- **Kết quả guest:** 6 Pass, 2 Partial, 13 Fail (21 ca).
- **Kết luận:** **Fail**. Các lỗi lặp lại ở khám phá danh mục, tìm theo tên chính xác, độ chính xác giá/bộ lọc, tính đầy đủ của đếm/liệt kê và liên kết sản phẩm.
- **Kết quả auth:** 2 Pass, 1 Partial, 3 Fail (6 ca); các lỗi F11 và link vẫn tái hiện sau đăng nhập.
- **An toàn dữ liệu:** Supabase chỉ được truy vấn bằng `SELECT`; không lưu truy vấn và không thay đổi dữ liệu production. Không đọc đơn hàng hoặc dữ liệu cá nhân của tài khoản thật.

## Catalog snapshot used for comparison

Snapshot queries were run during this test. Product counts below are rows in `products`; the jeans results include two records with the same “Quần jeans nam Basic” name.

| Product group | Product rows | Price range |
|---|---:|---:|
| Quần jeans nam | 10 | 399.000–479.000đ |
| Chân váy nữ | 5 | 299.000–379.000đ |
| Đầm trắng nữ | 5 | 499.000–579.000đ |
| Đồ ngủ nữ satin | 5 | 389.000–469.000đ |
| Áo blazer nữ | 5 | 599.000–679.000đ |
| Áo khoác bomber unisex | 5 | 549.000–629.000đ |
| Bộ đồ thể thao unisex | 5 | 599.000–679.000đ |
| Áo hoodie nam | 5 | 399.000–479.000đ |

The queried Basic product records had sizes S/M/L/XL and 20 units per variant. The F11 comparison query found **7** product rows whose names matched `Áo%nam%` and whose base price was below 250.000đ.

## Guest conversation results

| Case | Prompt / behavior checked | Result | Evidence |
|---|---|---|---|
| G01 | “Chào shop” | **Pass** | Friendly greeting; says order lookup requires login. |
| G02 | Ask which clothing groups the shop sells | **Fail** | Bot says it cannot find a suitable product instead of answering the available groups. |
| P01 | Ask price and sizes of “Quần jeans nam Basic” | **Fail** | Exact product not found, although matching Basic records exist in the catalog. |
| P02 | Ask general price of men’s jeans | **Fail** | Lists four models and 399.000–459.000đ; snapshot has 10 rows and prices through 479.000đ. |
| P03 | Ask price of “Chân váy nữ Basic” | **Fail** | Returns a different floral maxi skirt at 459.000đ; the named Basic product is 299.000đ. |
| P04 | Ask whether women’s skirts are available | **Fail** | Says five models cost 459.000–539.000đ; catalog’s five “Chân váy nữ” rows are 299.000–379.000đ. |
| P05 | Ask price and size of “Đầm trắng nữ Basic” | **Pass** | Gives 499.000đ, sizes S/M/L/XL, 20 per size; matches the queried record. |
| P06 | Ask women’s white dresses and size L | **Partial** | Lists five models at 499.000–579.000đ, matching the catalog range. The variant snapshot directly verified size L only for Basic, not every model in the answer. |
| P07 | Ask about “Bộ đồ ngủ nữ satin Basic” | **Fail** | Says the named product is not found; the matching Basic record exists at 389.000đ. |
| P08 | Ask for satin sleepwear below 450.000đ | **Fail** | Returns one model at 409.000đ, omitting the Basic model at 389.000đ that also meets the filter. |
| P09 | Ask price of “Áo blazer nữ Basic” | **Fail** | Exact product not found, despite the matching 599.000đ catalog record. |
| P10 | Ask general blazer price range | **Pass** | Gives 599.000–679.000đ, matching the catalog range. |
| P11 | Ask about “Áo khoác bomber unisex Basic” | **Fail** | Does not find the named product and substitutes an unrelated unisex sweatshirt at 299.000đ. |
| P12 | Ask whether bomber jackets have size L | **Partial** | Lists five models and prices in the catalog range; the variant snapshot directly verified size L/stock only for Basic, not every listed model. |
| P13 | Ask whether unisex sportswear has size L | **Fail** | Says no suitable item was found, although the Basic sportswear record has size L with stock. |
| P14 | Ask price of “Áo hoodie nam Basic” | **Pass** | Returns 399.000đ, matching the catalog. |
| P15 | Ask general hoodie price range | **Pass** | Lists five models at 399.000–479.000đ, matching the catalog. |
| F11-A | Count men’s shirts under 250.000đ | **Fail** | Bot says 3; the contemporaneous catalog query found 7 matching rows. |
| F11-B | List all men’s shirts under 250.000đ | **Fail** | Lists only 3; omits four matching rows. |
| L01 | Inspect and click “Xem sản phẩm” links from F11 results | **Fail** | All three anchors had `href=null`; clicking one left the browser on the same collection page. |
| G03 | Ask “Đơn hàng của tôi đang ở đâu?” as guest | **Pass (access guard)** | Bot returned its greeting/login prompt and exposed no order details. |

Responses completed in approximately 2–9 seconds; no response timeout was observed.

## Findings and interpretation

1. **High-priority correctness issue:** the same catalog item can be missed by exact name while a broad query works, or be replaced with a different product. The skirt substitution and bomber-to-sweatshirt substitution are factual errors, not merely a limitation of conversational AI.
2. **Filter completeness is unreliable:** the under-450.000đ sleepwear query omits a qualifying 389.000đ item. F11 count and listing both return 3 against 7 matching catalog rows.
3. **Category coverage is inconsistent:** broad category discovery fails, and the skirt category answer gives a price range inconsistent with all five matching catalog rows. Other broad categories (dress, blazer, hoodie) did match the snapshot.
4. **Product navigation is broken in the tested response:** “Xem sản phẩm” is rendered as an anchor without an `href` and is not navigable. This contradicts the earlier user-confirmed working link, so it should be retested after any relevant publish/config change.
5. **Guest order protection behaved as intended:** no order data was returned while unauthenticated. No authenticated order lookup was attempted.

These are repeatable data retrieval, filtering, and output-link defects; they should not be dismissed as the chatbot being unable to answer every possible phrasing. Other cases such as transfer to a human, backend-error handling, and prompt-safety probes were not run in this guest pass.

## Notes

- The prior report remains unchanged: [Botpress-thesis-production-run-2026-11-02.md](./Botpress-thesis-production-run-2026-11-02.md).
- The historical test-plan file was absent from the current working tree, so this report records the concrete guest checks performed and their evidence without restoring that deleted file.
- The browser showed a dialog accessibility warning (`DialogContent` missing a title/description) during conversation restart. Restart still succeeded; this warning was not counted as a chatbot test failure.
- This report contains both guest and authenticated checks. Reading orders remains untested until a QA account with test orders is confirmed; real order data must not be accessed.

## Kết quả kiểm thử khi đã đăng nhập

- **Thời gian:** khoảng 18:04–18:08 ICT, 02/11/2026.
- **Xác nhận đăng nhập:** storefront hiển thị nút tài khoản và “Đăng xuất”; không còn liên kết “Đăng nhập”.
- **Giới hạn dữ liệu:** tài khoản chưa được xác nhận là tài khoản QA, vì vậy không mở chức năng “Xem đơn hàng”, không đọc đơn hàng, giỏ hàng hay thông tin cá nhân.
- **Kết quả:** 2 Pass, 1 Partial, 3 Fail (6 kiểm tra).

| Ca | Nội dung kiểm tra | Kết quả | Bằng chứng |
|---|---|---|---|
| A01 | Xác nhận trạng thái đăng nhập trên storefront | **Pass** | Nút tài khoản và “Đăng xuất” hiển thị; không có “Đăng nhập”. |
| A02 | Lời chào/điểm vào chức năng auth | **Partial** | Bot chào và hiển thị nút “Xem đơn hàng”. Không bấm nút vì có thể truy cập đơn hàng thật; luồng đọc đơn chưa được kiểm thử. |
| A03 | Hỏi giá “Áo hoodie nam Basic” | **Pass** | Bot trả lời 399.000đ, khớp snapshot catalog. |
| A04 | Hỏi giá và size “Quần jeans nam Basic” | **Fail** | Bot nói không tìm thấy, dù snapshot trước đó có sản phẩm cùng tên. |
| A05 | Liệt kê áo nam dưới 250.000đ | **Fail** | Bot chỉ liệt kê 3 mẫu; truy vấn `SELECT` lúc 18:07 ICT trả về 7 sản phẩm phù hợp. Lỗi vẫn tái hiện sau đăng nhập. |
| A06 | Kiểm tra liên kết “Xem sản phẩm” trong câu trả lời | **Fail** | Cả 3 liên kết đều là anchor không có `href`; không có điều hướng sản phẩm. |

### Kết luận chung

Đăng nhập không khắc phục được các lỗi truy xuất sản phẩm đã thấy ở guest: truy vấn jeans theo tên chính xác vẫn không tìm thấy, F11 vẫn trả thiếu 4/7 sản phẩm, và liên kết sản phẩm vẫn không điều hướng. Truy vấn catalog để đối chiếu chỉ dùng `SELECT`, không lưu SQL và không ghi dữ liệu.

**Chưa kiểm thử:** xem danh sách/chi tiết đơn hàng, trạng thái đơn, hoặc bất kỳ dữ liệu cá nhân nào. Cần tài khoản QA có đơn giả lập và xác nhận rõ tài khoản đó trước khi chạy các ca này.
