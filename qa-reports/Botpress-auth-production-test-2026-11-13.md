# Kiểm thử luồng auth Botpress trên production — 2026-11-13

## Phạm vi và trạng thái phiên

Kiểm thử trên storefront production bằng phiên đã đăng nhập sẵn. Header hiển thị tài khoản `ducvumpi3107` với vai trò Thành viên. Dùng lại cửa sổ chat đang có; không restart hội thoại, không tạo/hủy/cập nhật đơn.

## Kết quả

| Case | Kết quả | Bằng chứng |
| --- | --- | --- |
| Nhận diện trạng thái đăng nhập | **PASS** | Header hiển thị tài khoản Thành viên; chat có nút `📦 Xem đơn hàng`. |
| Tra cứu lịch sử đơn qua nút chat | **PASS** | Chat truy xuất được 2 đơn thuộc tài khoản đang đăng nhập, gồm trạng thái hoàn tất và đang đóng gói. |
| Lọc theo trạng thái đơn | **PARTIAL** | Hỏi “đơn nào đang được đóng gói?” nhưng bot vẫn trả cả hai đơn, gồm cả đơn hoàn tất. |
| Tra theo mã đơn | **PARTIAL** | Yêu cầu tra một mã đơn cụ thể nhưng bot vẫn trả cả hai đơn thay vì chỉ đơn khớp mã. |
| Chuyển từ đơn hàng sang tư vấn sản phẩm | **PASS** | Sau nhánh đơn, yêu cầu áo len nữ màu nâu size M dưới 400.000đ trả 8 sản phẩm phù hợp; các kết quả hiển thị giữ đúng màu, size và giá. |
| Không tạo dữ liệu giao dịch | **PASS** | Không tạo/cập nhật/hủy đơn hàng trong kiểm thử. |

## Kết luận

Xác thực và truy xuất đơn của tài khoản hoạt động. Phần lọc lịch sử theo trạng thái hoặc mã đơn chưa đáp ứng ý định cụ thể và cần được sửa riêng; hiện tại bot vẫn đưa toàn bộ danh sách đơn trong các câu hỏi lọc hẹp.
