# Báo cáo kiểm thử luồng auth Botpress trên production — 04/11/2026

## Phạm vi và cách chạy

- Website production: https://tiem-mua-cham-store.vercel.app/
- Kế hoạch tham chiếu: [Botpress thesis production run](./Botpress-thesis-production-run-2026-11-02.md).
- Trạng thái storefront: đã đăng nhập; UI hiển thị tên tài khoản `ducvumpi3107`, nhãn Thành viên và nút Đăng xuất. Không ghi email hoặc thông tin xác thực.
- Thời gian: khoảng 17:55 ICT, 04/11/2026.
- Chỉ đọc dữ liệu đơn; không tạo, sửa, hủy đơn, không mở trang chi tiết đơn và không đăng xuất.
- Đã dùng CTA `📦 Xem đơn hàng` trong Botpress; sau đó thử câu hỏi tự nhiên trong cùng conversation. Không tạo conversation mới.

## Kết quả tổng hợp

| Case | Trạng thái |
|---|---|
| C06 — tài khoản đã đăng nhập xem đơn của mình | **Partial** |
| C07 — ngăn truy cập đơn của tài khoản khác | **Blocked / Not run** |
| C08 — xác thực endpoint với phiên đăng nhập | **Not run** |
| C09 — đăng xuất rồi hỏi đơn trong cùng conversation | **Not run** |

## Kết quả chi tiết

| Case | Trạng thái | Bằng chứng production |
|---|---|---|
| C06 — xem đơn đã đăng nhập | **Partial** | Bấm CTA `📦 Xem đơn hàng` trả về **2 đơn**, có ngày, trạng thái, tổng tiền và dòng sản phẩm. ID đơn và chi tiết nhận diện đã được lược khỏi báo cáo. Không mở link/chi tiết đơn. Nhưng gửi câu tự nhiên `Xem đơn hàng của tôi` trong cùng thread lại nhận `Are you sure you want to cancel?` với nút Yes/No, thay vì xử lý ý định xem đơn. Chọn No; không có thao tác hủy. CTA hoạt động, nhưng cách hỏi tự nhiên bị định tuyến sai, nên chưa đạt end-to-end. |
| C07 — truy cập chéo giữa tài khoản | **Blocked / Not run** | Không có tài khoản thứ hai hoặc đơn fixture được xác nhận trong phiên này. Không thử đoán hoặc truy cập dữ liệu người khác. |
| C08 — endpoint auth | **Not run** | Lượt này chỉ dùng UI chatbot; không gửi request API trực tiếp và không trích xuất token/cookie. |
| C09 — logout trong cùng conversation | **Not run** | Không đăng xuất phiên người dùng. Báo cáo kiểm thử trước ghi nhận thao tác logout QA từng làm các tab storefront đang mở cùng chuyển sang guest; không lặp lại rủi ro đó trong phiên người dùng hiện tại. |

## Kết luận

Đường đi qua CTA xem đơn xác thực được và trả danh sách đơn của tài khoản đang đăng nhập. Đường đi bằng ngôn ngữ tự nhiên bị định tuyến sai sang xác nhận hủy đơn, do đó C06 là **Partial** và lỗi điều hướng ý định cần được xử lý. Không nhấn Yes; không thay đổi trạng thái đơn hay phiên đăng nhập. C07–C09 cần fixture/tài khoản kiểm thử và môi trường phù hợp trước khi chạy.
