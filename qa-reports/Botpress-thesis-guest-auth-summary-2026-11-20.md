# Tổng kết kiểm thử luồng Guest và Auth — 20/11/2026

## Kết quả chung

| Nhóm kiểm thử | Đạt | Đạt một phần | Không đạt | Bị chặn / chưa chạy |
|---|---:|---:|---:|---|
| Guest — chức năng F01–F12 | 10 | 2 | 0 | 0 |
| Guest — phân quyền/tích hợp | — | 2 | 0 | Các case còn lại cần tài khoản QA hoặc môi trường staging |
| Smoke test production F13/F14/F15/I10 | 1 | 1 | 2 | Kiểm tra chéo AUTH-A/AUTH-B của I10 vẫn bị chặn |
| Auth — giao diện A01–A09 sau retest production | 8 | 1 | 0 | 0 |
| Auth — tích hợp/bảo mật | 1 (I08) | 2 (I01/I03) | 1 (I10: xử lý mạo danh) | I04–I07; I05 chưa chạy; kiểm tra chéo AUTH-A/AUTH-B của I10 vẫn bị chặn |

Kết quả Auth gồm các case A01/A03/A04/A08/A09 đã kiểm tra trước đó và kết quả production mới của A05/A06/A07. Kiểm tra reload thực hiện một lần trong hội thoại Auth hiện có, không tạo hội thoại mới.

## Kết quả Guest

- Các case đạt bao gồm làm rõ yêu cầu, lọc danh mục, giới hạn giá/tồn kho, cập nhật tiêu chí, xem chi tiết sản phẩm và duy trì ngữ cảnh hội thoại.
- **F01 — Đạt một phần:** từng ghi nhận lời chào bị trùng do tranh chấp thời điểm khởi tạo hội thoại.
- **F05 — Đạt một phần:** production chưa có dữ liệu kiểm thử để làm size M hết hàng và xác nhận chatbot chuyển sang size dự phòng.
- **I01/I02 — Đạt một phần:** bằng chứng giao diện và API phù hợp với hành vi Guest, nhưng thiếu trace Botpress; có một lượt hỏi đơn ngay đầu hội thoại nhận lời chào trùng trước khi thử lại.
- Các case thêm giỏ hàng có xác thực, cách ly giữa các tài khoản và mô phỏng lỗi API cần tài khoản QA/môi trường staging. Không thay đổi giỏ hàng hoặc đơn hàng production trong đợt chạy này.

## Kết quả Auth

- **A01, A03, A04, A08, A09 — Đạt** theo kết quả đã ghi nhận trước đó. A03 hiển thị 2 đơn; hội thoại giữ được thứ tự trao đổi đơn hàng → tư vấn sản phẩm → đơn hàng.
- **Retest mới:** A05/A06 chuyển người dùng đã đăng nhập về trang chủ và không hiển thị form login/register; A07 chuyển `/settings` tới `/info`.
- **A02 — Đạt một phần:** hồ sơ tải được email, nhưng tài khoản không có dữ liệu tên, số điện thoại hoặc ngày sinh để hiển thị. Không còn giá trị ngày sinh giả.
- **I01/I03 — Đạt một phần:** chưa có trace Botpress hoặc tài khoản fixture AUTH-A được chỉ định. I04–I07/I10 cần tài khoản riêng hoặc staging. I05 chưa chạy để giữ nguyên phiên đăng nhập đang dùng; khi thiếu tài khoản QA cô lập, case này cần được xem là bị chặn cho đến khi có fixture.

## Reload và thông báo tìm sản phẩm

Sau khi deploy, một lần reload trang production đang đăng nhập vẫn giữ nguyên lịch sử hội thoại. Lịch sử chỉ có một lời chào và không xuất hiện thêm câu “Không tìm thấy sản phẩm khớp chính xác trong dữ liệu cửa hàng.” khi chưa có tin nhắn người dùng mới. Kết quả chỉ xác nhận lần reload trên hội thoại hiện có; chưa kiểm tra hội thoại mới hoặc các nhánh flow khác.

## Kiểm tra thăm dò F13–F15/I10 trên tài khoản hiện tại

Theo yêu cầu của người dùng, đã chạy một smoke test production bằng tài khoản đang đăng nhập. Giỏ ban đầu trống; áo thun nam Daily Đen/M được thêm từ chatbot, sau đó món thử đã bị xóa và reload xác nhận giỏ trống. Không đặt hàng/thanh toán.

- **F13 — Đạt trong smoke test:** sản phẩm/biến thể được thêm đúng. Ban đầu chưa chọn checkbox nên tổng là 0đ; sau khi chọn, tạm tính là 219.000đ và tổng gồm giao hàng là 249.000đ. Đã xóa món thử.
- **F14 — Không đạt trong lượt thử:** bot tư vấn được quần jeans và liệt kê tồn, nhưng không gắn câu trả lời màu/size với sản phẩm đang chờ; không hoàn tất ba loại hàng. Danh mục phụ kiện cũng không được tìm thấy trong lượt hỏi.
- **F15 — Đạt một phần:** bot có hỏi làm rõ màu/size nhưng không nhận câu trả lời làm lựa chọn; nhánh variant hết hàng chưa thử vì không chỉnh tồn kho production.
- **I10 — Không đạt về xử lý mạo danh:** prompt dùng user ID/email giả không trả đơn của tài khoản giả, nhưng bot trả đơn của phiên hiện tại thay vì từ chối. Chưa có AUTH-B để xác nhận cách ly chéo.
- **I05 vẫn chưa chạy:** không đăng xuất vì chưa có thông tin để khôi phục phiên production sau kiểm thử.

Đây là kiểm tra thăm dò có một thay đổi giỏ hàng tạm thời, không thay thế lần chạy controlled trên staging; chi tiết ở [báo cáo rà soát case bị chặn/chưa chạy](./Botpress-thesis-blocked-cases-review-2026-11-20.md).

## Báo cáo và kế hoạch chi tiết

- [Báo cáo chạy Guest](./Botpress-thesis-guest-test-run-2026-11-20.md)
- [Báo cáo chạy Auth ban đầu](./Botpress-thesis-auth-test-run-2026-11-20.md)
- [Khắc phục và retest Auth trên production](./Botpress-thesis-auth-remediation-2026-11-20.md)
- [Rà soát case bị chặn/chưa chạy](./Botpress-thesis-blocked-cases-review-2026-11-20.md)
- [Kế hoạch kiểm thử](./Botpress-thesis-test-cases-v2-2026-11-20.md)
