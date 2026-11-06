# Kết quả kiểm thử luồng guest Botpress trên production — 05/11/2026

**Môi trường:** https://tiem-mua-cham-store.vercel.app/collections  
**Bot:** Friendly Duck / Trợ lý Nai Tiệm Mùa Chậm  
**Kế hoạch:** [Kế hoạch kiểm thử hai luồng guest/auth](./Botpress-chat-guest-auth-test-plan-2026-11-05.md)  
**Tham chiếu case:** [Kế hoạch kiểm thử thesis production](./Botpress-thesis-production-run-2026-11-02.md)  
**Thời gian:** khoảng 16:18–16:24 ICT, 05/11/2026.  
**Phiên:** storefront hiển thị Đăng nhập/Đăng ký; chatbot bắt đầu từ conversation mới.  
**Cách gửi:** gửi câu hỏi qua Webchat trên trang production; quan sát phản hồi trong giao diện.  
**Phạm vi an toàn:** không đăng nhập/đăng xuất trong lượt này, không tạo hay sửa đơn, không gọi API ghi dữ liệu, không click link sản phẩm. Không lưu token, cookie, PII hoặc conversation ID.

## Tổng hợp

| Trạng thái | Số case |
|---|---:|
| Pass | 7 |
| Partial | 3 |
| Fail | 0 |
| Blocked / Not Run | 0 |

Đây là lượt chạy guest chọn lọc đủ 10 case G01–G10 trong kế hoạch mới, trên cùng một conversation. Đây là bằng chứng UI; không có Botpress trace, snapshot catalog/variant/tồn kho hoặc đối chiếu backend độc lập. Vì vậy kết quả UI không xác nhận độ đầy đủ/tính chính xác của toàn bộ dữ liệu sản phẩm.

## Kết quả chi tiết

| Case | Trạng thái | Kết quả production |
|---|---|---|
| G01 — lời chào guest | **Pass** | Conversation mới chào: “Tôi có thể giúp tìm hoặc tư vấn sản phẩm. Nếu muốn tra cứu đơn hàng, vui lòng đăng nhập tài khoản trước nhé.” Hiển thị lựa chọn tìm sản phẩm và tư vấn sản phẩm. |
| G02 — giá sản phẩm cụ thể | **Pass (UI)** | `Áo thun nam Daily giá bao nhiêu?` → `Áo thun nam Daily — 219.000đ`. Chưa đối chiếu snapshot catalog. |
| G03 — lọc nhiều điều kiện | **Partial** | `Tìm áo len nữ màu trung tính, size M, dưới 400.000đ` trả các áo len nữ Basic/Daily/Weekend giá 329.000–369.000đ; các biến thể liệt kê màu Be/Nâu/Kem, size M. Bot hiển thị 5 thẻ và nói còn 3 mẫu phù hợp khác. Có tên gần trùng giữa thẻ “màu kem” và tên mẫu cơ bản; chưa xác minh đây là sản phẩm khác nhau hay trùng bản ghi. Màu/tồn kho/độ đầy đủ chưa đối chiếu độc lập. |
| G04 — link xem trước, không mở sản phẩm | **Pass (UI)** | Thẻ sản phẩm có ảnh, tên, giá và liên kết `Xem sản phẩm` với `href` cùng domain storefront. Không click link. Danh sách page trong browser vẫn chỉ gồm storefront và Botpress Studio; không có tab sản phẩm mới. |
| G05 — sản phẩm không tồn tại | **Pass (UI)** | `Quantum Unicorn ZX-999 có không?` → `Không tìm thấy sản phẩm phù hợp trong dữ liệu cửa hàng.` Không thấy sản phẩm/giá/link bịa. |
| G06 — guest hỏi đơn hàng | **Partial** | `Tôi muốn xem đơn hàng của tôi` → `Vui lòng đăng nhập lại để xác thực phiên trước khi tra cứu đơn hàng.` Không trả nội dung đơn. Hành vi bảo vệ dữ liệu đạt ở UI, nhưng chữ “đăng nhập lại” chưa sát trạng thái guest hiện tại. |
| G07 — tư vấn sau khi bị từ chối tra đơn | **Pass (UI)** | Sau G06, `Tư vấn áo len nữ màu kem dưới 400.000đ` trả các mẫu/giá và thẻ sản phẩm. Guest không bị kẹt ở nhánh yêu cầu đăng nhập. Không click link. |
| G08 — hỏi đơn lần nữa sau tư vấn | **Pass (UI)** | `Cho tôi xem các đơn gần đây` tiếp tục yêu cầu đăng nhập; không hiển thị dữ liệu đơn sau câu hỏi tư vấn. |
| G09 — điều kiện giá mâu thuẫn | **Pass (UI)** | `Tìm áo dưới 200.000đ và trên 300.000đ` → bot nhận ra hai điều kiện mâu thuẫn và hỏi muốn tìm dưới 200.000đ hay trên 300.000đ. Phản hồi mất khoảng 18 giây theo thời điểm quan sát gần đúng; chưa đo latency chính xác. |
| G10 — yêu cầu mơ hồ | **Partial** | `Cho tôi cái đẹp nhất` → bot hỏi người dùng đang tìm áo/quần/váy và tiêu chí/giá mong muốn, nhưng mở đầu bằng “Không tìm thấy sản phẩm phù hợp với điều kiện hiện tại” dù chưa nêu điều kiện. Có làm rõ nhưng thông báo đầu gây hiểu nhầm. |

## Nhận xét

- Luồng guest từ chối tra cứu đơn ở cả lần hỏi đầu và sau một lượt tư vấn sản phẩm; không quan sát thấy dữ liệu đơn trong phản hồi.
- Khả năng tư vấn sản phẩm vẫn hoạt động trước và sau yêu cầu tra đơn. Thẻ xem trước có `href`; không có sản phẩm nào được mở.
- G03 cần đối chiếu catalog/variant để xác nhận số lượng, màu và tồn kho; phản hồi hiện nói còn 3 mẫu ngoài 5 thẻ đầu.
- Cải thiện UX nên đổi lời nhắc guest từ “đăng nhập lại” thành “đăng nhập” và bỏ câu “không tìm thấy ... điều kiện hiện tại” trước câu hỏi làm rõ ở G10.
- Không có Botpress trace nên chưa xác nhận bằng chứng node định tuyến hoặc nhánh bảo mật backend. Guest API negative cases và kiểm thử lỗi backend không nằm trong lượt UI này.

## Kết luận

Các case guest cơ bản đạt ở giao diện: chào guest, hỏi giá sản phẩm, sản phẩm không tồn tại, tư vấn sau khi bị từ chối tra đơn, hỏi đơn lại sau tư vấn, làm rõ điều kiện mâu thuẫn và không tự mở link sản phẩm. Ba case Partial là lọc nhiều điều kiện cần đối chiếu dữ liệu độc lập, câu nhắc đăng nhập chưa đúng sắc thái guest, và phản hồi yêu cầu mơ hồ còn thông báo “không tìm thấy” gây hiểu nhầm. Không có Fail UI trong 10 case đã chạy; kết quả này không thay thế xác minh backend/trace hoặc toàn bộ kế hoạch production.
