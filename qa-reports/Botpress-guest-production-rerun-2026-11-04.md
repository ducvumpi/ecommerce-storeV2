# Kiểm thử guest Botpress trên production — lượt chạy 04/11/2026

**Môi trường:** https://tiem-mua-cham-store.vercel.app/  
**Ngày chạy:** 04/11/2026 (ICT).  
**Danh tính:** guest; mở conversation mới và kiểm tra giao diện storefront có trạng thái đăng nhập.  
**Phạm vi:** kiểm thử trực tiếp các câu hỏi guest theo kế hoạch `Botpress-thesis-production-run-2026-11-02.md`. Tất cả ca chat chạy trong cùng conversation.  
**Giới hạn sản phẩm:** không bấm, mở hoặc điều hướng tới bất kỳ link sản phẩm nào. Các card/link chỉ được quan sát trong nội dung chat. Không lấy snapshot catalog/variant/tồn kho độc lập và không có Botpress trace; các kết luận về dữ liệu sản phẩm do đó chỉ đánh giá câu trả lời hiển thị.

## Kết quả lượt chạy

| Ca | Trạng thái | Bằng chứng production |
|---|---|---|
| F01 — chào mừng | Pass | Conversation mới mở lời chào; nêu rõ cần đăng nhập để tra cứu đơn hàng. |
| F02 — giá sản phẩm | Pass | `Áo thun nam Daily giá bao nhiêu?` → thẻ sản phẩm hiển thị 219.000đ và câu trả lời cũng nêu 219.000đ. Không mở card/link. |
| F03 — chất liệu | Pass | `Áo thun nam Daily có chất liệu gì?` → `Áo thun nam Daily có chất liệu Cotton.` |
| F04 — lọc giới tính/màu/size/giá/tồn kho | Partial | `Tìm áo thun nam màu đen size M dưới 250.000đ còn hàng` → nêu 7 tên phù hợp, nhưng câu trả lời hỏi lại màu/size của mẫu nào và không xác nhận từng biến thể/tồn kho. Không có snapshot độc lập để đối chiếu. |
| F05 — danh mục | Pass (định dạng câu trả lời) | `Shop có những loại sản phẩm nào?` → câu trả lời gọn thành 3 nhóm Nam/Nữ/Unisex, kèm ví dụ danh mục và câu hỏi chọn nhóm. |
| F06 — áo len nữ, giá và size | Partial | `Tìm áo len nữ dưới 350.000đ size L` → liệt kê 4 tên: màu kem Basic, Basic, màu kem Daily, Daily; card hiển thị giá 329.000đ. Chưa xác nhận độc lập size L/giá/variant của cả bốn. |
| F07 — sản phẩm không tồn tại | Pass | `Có mẫu Quantum Unicorn ZX-999 không?` → `Không tìm thấy sản phẩm phù hợp trong dữ liệu cửa hàng.` Không bịa sản phẩm. |
| F11 — đếm sản phẩm dưới ngưỡng | Partial | `Có bao nhiêu áo nam dưới 250.000đ?` → `Có 7 sản phẩm phù hợp.` Chưa đối chiếu độc lập với catalog hiện hành nên chưa kết luận tính chính xác của số đếm. |
| F11 — liệt kê sản phẩm dưới ngưỡng | Partial | `Liệt kê tất cả áo nam dưới 250.000đ` → 7 tên, giá từ 199.000đ đến 249.000đ. Cùng con số với câu đếm; chưa có snapshot catalog độc lập để xác nhận “tất cả”. Không mở link trên card. |
| N06/policy — đổi size và phí ship | Pass về tính thận trọng | Hỏi thời hạn đổi size và bên chịu phí vận chuyển → bot nói chưa có thông tin xác thực và hướng tới mục Vận chuyển & trả hàng/chăm sóc khách hàng; không tự bịa chính sách. |
| E01 — input vô nghĩa | Partial/Fail UX | `asdf qwer ???` → `Không tìm thấy sản phẩm phù hợp với các điều kiện hiện tại.` Bot không bịa dữ liệu nhưng nên hỏi lại/đề nghị diễn đạt rõ thay vì hiểu mặc định là truy vấn sản phẩm. |
| C05 — guest tra cứu đơn | Pass ở UI | `Tôi muốn xem đơn hàng của tôi` → bot nhắc đăng nhập; không hiển thị dữ liệu đơn hàng và không yêu cầu mật khẩu/OTP. Không kiểm tra trace/backend trong lượt này. |

## Tổng kết

- 7 ca Pass về hành vi hiển thị; 4 ca Partial; 1 ca Partial/Fail về UX. Phân loại F11 chỉ xác nhận được định dạng/độ nhất quán giữa câu đếm và danh sách, chưa xác nhận tính đầy đủ của dữ liệu.
- Lỗi rõ nhất quan sát được trong lượt này là câu vô nghĩa bị định tuyến thành tìm sản phẩm thay vì hỏi làm rõ.
- Các truy vấn lọc phức tạp có kết quả nhưng cần nguồn catalog/variant/tồn kho độc lập để xác minh; không suy diễn các tên được bot nêu là đã thỏa toàn bộ điều kiện.
- Không chạy các ca cần tài khoản/đơn fixture, giả lập lỗi API/timeout, thay đổi dữ liệu production hoặc kiểm tra link sản phẩm. Link sản phẩm tuyệt đối không được mở theo yêu cầu người dùng.
- Đây là lượt kiểm thử UI production; không sửa workflow, không publish và không khẳng định workflow/revision đang live chỉ từ giao diện storefront.
