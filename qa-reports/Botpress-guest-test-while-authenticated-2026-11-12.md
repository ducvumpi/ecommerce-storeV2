# Kiểm thử luồng guest khi trình duyệt đang đăng nhập — 12/11/2026

## Kết luận

Không thể chứng nhận đây là phiên guest: navbar hiển thị tài khoản thành viên, chat hiển thị nút **Xem đơn hàng**. Đã gửi sự kiện guest có payload vô danh vào Webchat SDK để thử nhánh guest nhưng không đăng xuất website. Khi hỏi tra cứu đơn bằng email QA giả, bot trả về đơn của người dùng đang đăng nhập trong session. **Dừng kiểm thử đơn ngay tại đây**; không gửi thêm câu hỏi đơn, không sao chép/lưu nội dung, mã, trạng thái hoặc tổng tiền đơn. Đây là kết quả của thử nghiệm guest-event trên session đăng nhập, không phải bằng chứng bot đã xử lý được một phiên guest thực sự.

Website vẫn đăng nhập sau phép thử; không tạo conversation mới, không click nút xem đơn hoặc link sản phẩm, không thao tác trên đơn.

## Các case đã chạy

| Case | Kết quả | Quan sát |
|---|---|---|
| G01 | Pass | Hỏi làm rõ loại áo/đối tượng/ngân sách thay vì đưa số lượng thiếu nguồn. |
| G02 + lượt nối rẻ nhất/mẫu đó | Pass | 8 mẫu phù hợp; chọn áo len Basic 329.000đ; truy vấn tiếp trả đúng màu kem M còn hàng. |
| G03 | Partial | Cập nhật Be/Nâu, giữ áo len và M còn hàng. Không thể nghiệm thu fallback size S vì M vẫn còn; không sửa tồn kho thật để tạo fixture. |
| G04 | Pass | Đổi hẳn sang áo thun nam Đen/M dưới 250.000đ, đếm đúng 7 mẫu. |
| G05 | Pass | Daily 219.000đ; câu hỏi tiếp trả Đen/M còn 20, giá biến thể 219.000đ. |
| G06 | Pass | DOM Webchat có thẻ sản phẩm, ảnh tải được và `href` đúng domain. Không mở liên kết. |
| G07 | Pass | Đếm và liệt kê đúng 7 mẫu Đen/M còn hàng dưới 250.000đ. |
| G08 | Partial | SKU giả không bị bịa; bot hỏi loại sản phẩm để tìm phương án thay thế. Chưa gửi câu trả lời làm rõ tiếp theo. |
| G09 | Pass | Phát hiện giá mâu thuẫn; sau sửa trần 300.000đ trả đúng 23 kết quả. |
| G10 | Partial | Hỏi rõ “đẹp nhất”; giữ giới hạn nữ/ngân sách và hỏi tăng ngân sách hoặc unisex. Lượt hỏi màu đen vẫn lặp lời làm rõ, không tự mở rộng điều kiện. |
| G11 | Blocked | Guest giả lập trong trình duyệt đăng nhập nhận dữ liệu đơn của tài khoản đang hoạt động. Không thể dùng kết quả này để chấm guest gate; dừng nhánh đơn. |
| G12 | Not Run | Dừng sau G11 để tránh tiếp tục gửi nội dung từ session đã lộ dữ liệu đơn vào hội thoại. |

**Tổng:** 7 Pass, 3 Partial, 1 Blocked, 1 Not Run. 16 lượt hỏi đã được gửi trong một conversation; không dùng Restart.

## Ý nghĩa và giới hạn

Webchat dùng `window.botpress.sendEvent` để đồng bộ guest/auth riêng với phiên Supabase của ứng dụng. Gửi event guest không đăng xuất Supabase và không biến trình duyệt đang authenticated thành một browser guest độc lập; bằng chứng nhìn thấy ở navbar cũng xác nhận session còn đăng nhập. Vì vậy G11 bị chặn ở phạm vi kiểm chứng guest, và lần chạy này không chứng minh rằng người chưa đăng nhập có thể truy cập đơn. Các case sản phẩm đã được kiểm tra trong cùng session sau guest-event giả lập, nên kết quả của chúng xác nhận luồng lọc sản phẩm hoạt động, không khẳng định toàn bộ session là guest.

Để nghiệm thu guest order gate cần một session trình duyệt thực sự chưa đăng nhập; không dùng email do người dùng nhập làm danh tính. Lần chạy này không lưu transcript hội thoại đầy đủ vì nó chứa thông tin đơn của tài khoản đang đăng nhập.
