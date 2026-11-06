# Báo cáo kiểm thử Guest nâng cao — Production

**Ngày chạy:** 05/11/2026 (ICT)  
**Môi trường:** https://tiem-mua-cham-store.vercel.app/collections  
**Bot:** Trợ lý Nai Tiệm Mùa Chậm / Friendly Duck  
**Kế hoạch:** [Botpress Guest/Auth test plan](./Botpress-chat-guest-auth-test-plan-2026-11-05.md)  
**Phạm vi:** Guest nâng cao; không kiểm thử auth/backend ownership.

## Tóm tắt

| Pass | Partial | Fail | Not Run |
|---:|---:|---:|---:|
| 1 | 3 | 7 | 1 |

Đã chạy 11/12 case Guest. Tab production xác nhận trạng thái guest qua nút **Đăng nhập/Đăng ký** và lời chào yêu cầu đăng nhập để xem đơn. Không có dữ liệu đơn nào được trả về. Các lỗi nổi bật là bot trả “không tìm thấy” thay vì làm rõ, mất ngữ cảnh khi khách đổi/thu hẹp tiêu chí, và đôi lúc trả lời FAQ vận chuyển không liên quan. G03 chưa chạy đúng kịch bản nên để Not Run.

## Kết quả theo case

| ID | Trạng thái | Kết quả quan sát |
|---|---|---|
| G01 | **Fail** | `Shop có áo nào dễ mặc đi làm không?` → “Không tìm thấy sản phẩm phù hợp với các điều kiện hiện tại.” Không hỏi làm rõ loại áo/ngân sách/size dù câu hỏi còn rộng. |
| G02 | **Fail** | Yêu cầu áo len nữ trung tính, size M, ≤400.000đ, còn hàng trả 5 thẻ áo len màu kem với giá 329.000–369.000đ, nhưng không chứng minh được đủ điều kiện màu/size/tồn kho trong thẻ. Câu nối “mẫu nào rẻ nhất?” và câu hỏi màu/size đều trả “Không tìm thấy sản phẩm phù hợp trong dữ liệu cửa hàng”, không giữ tập kết quả trước. |
| G03 | **Not Run** | Case nới màu/size chưa chạy đúng: tin nhắn nối tiếp đã bị gửi trong conversation mới nên thiếu ngữ cảnh chủ định. Một lần thử cho câu `Nếu không có màu kem…` trả nội dung FAQ đổi size/vận chuyển, không phải tìm sản phẩm; không tính là hoàn tất G03. |
| G04 | **Fail** | Trong cùng conversation, đổi từ áo len nữ sang áo thun nam đen size M ≤250.000đ. Bot trả “Các mẫu phù hợp” nhưng liệt kê lại áo len nữ màu kem size M, sau đó có thêm phản hồi không tìm thấy. Kết quả giữ bộ lọc cũ và có phản hồi không nhất quán. |
| G05 | **Fail** | `Áo thun nam Daily giá bao nhiêu?` → đúng giá 219.000đ. Hỏi tiếp giá/tồn kho size M màu đen → “Mình chưa tìm thấy mẫu khớp… cho biết thêm loại áo hoặc tên mẫu”, dù tên mẫu đã có ngay lượt trước. |
| G06 | **Pass** | Thẻ kết quả hiển thị tên, giá và liên kết `Xem sản phẩm` có `href`. Không click link; trang vẫn ở `/collections`, không có tab sản phẩm mới được mở trong lúc kiểm tra. Ảnh được render trong cấu trúc thẻ nhưng chưa xác minh tải ảnh từ nguồn bên ngoài. |
| G07 | **Fail** | Hỏi số lượng áo thun nam dưới 250.000đ, màu đen, size M còn hàng → bot trả 5 mẫu/giá nhưng không trả con số, không lọc rõ màu/size/tồn kho. Câu nối “liệt kê các mẫu đó” trả “Không tìm thấy sản phẩm phù hợp”. |
| G08 | **Partial** | Với SKU giả `Quantum Unicorn ZX-999` và yêu cầu mẫu thay thế tối màu, size M, dưới 300.000đ, bot đưa các mẫu áo thun nam và vài sản phẩm khác với giá/variant. Không nói rõ không tìm thấy SKU gốc; không giải thích lý do chọn loại áo thun khi khách chưa chỉ định loại. Không thấy bịa ra SKU gốc. |
| G09 | **Partial** | Điều kiện dưới 200.000đ và trên 300.000đ được phát hiện là mâu thuẫn, bot hỏi chọn ngưỡng. Sau khi sửa thành tối đa 300.000đ, bot trả các mẫu áo thun 199.000–239.000đ nhưng tiếp tục thêm một phản hồi `Mình chưa rõ bạn đang tìm sản phẩm nào` sau danh sách. Phần lọc giá đúng, chuỗi phản hồi cuối không nhất quán. |
| G10 | **Fail** | `Cho mình cái đẹp nhất` có câu hỏi làm rõ nhưng mở đầu bằng “Không tìm thấy sản phẩm”. Sau khi khách nêu áo nữ hằng ngày khoảng 300.000đ và hỏi tiếp màu đen, bot đưa kết quả hỗn hợp nam/nữ và các mẫu không đáp ứng rõ giới hạn giá/ngữ cảnh. Câu nối không giữ đúng tiêu chí. |
| G11 | **Partial** | Guest hỏi đơn và cung cấp email giả lập: bot không trả dữ liệu đơn, nhưng phản hồi chỉ lặp lời chào chung thay vì hướng dẫn đăng nhập trực tiếp. Sau đó yêu cầu tư vấn áo len được xử lý bằng thẻ sản phẩm; hỏi đơn lần nữa nhận yêu cầu đăng nhập để xác thực. Không có dữ liệu đơn bị lộ. |
| G12 | **Fail** | Yêu cầu tách hai nhóm áo nữ và áo thun nam cho hai người → “Không tìm thấy sản phẩm”. Câu tiếp “chỉ giữ nhóm của chồng, đổi size XL” lại trả FAQ đổi size/vận chuyển, không xử lý truy vấn sản phẩm hoặc giữ ngữ cảnh. |

## Quan sát UI và giới hạn

- Không mở link sản phẩm và không có điều hướng ra khỏi trang bộ sưu tập do các thao tác kiểm thử.
- Trên một số truy vấn bot trả nhiều phản hồi khác loại hoặc câu cuối mâu thuẫn với kết quả đã liệt kê. Đánh giá dựa trên nội dung hiển thị; không có Botpress Inspector/API trace độc lập trong lần chạy này.
- Một số thẻ có tên gần trùng nhau (ví dụ mẫu Basic và biến thể/collection Basic). Không có snapshot catalog đầy đủ để khẳng định cách đếm SKU hay tồn kho ngoài dữ liệu mà bot hiển thị.
- Khi khởi động conversation mới, request `initialize` cũ bị hủy (`ERR_ABORTED`) xuất hiện trong log trình duyệt; giao diện vẫn tạo conversation mới. Ngoài ra có cảnh báo accessibility `DialogContent` thiếu `DialogTitle`/Description và một số 404 tài nguyên. Chưa xác định các cảnh báo này có liên quan đến lỗi định tuyến chatbot.

## Kết luận

Luồng Guest hiện chưa đạt cho các hội thoại nhiều lượt. Ưu tiên sửa: (1) giữ và cập nhật bộ lọc khi khách đổi tiêu chí; (2) xử lý câu nối/tham chiếu “mẫu đó”, “mấy mẫu trên”; (3) trả số lượng khớp với danh sách; (4) chỉ hỏi làm rõ khi cần, không gắn thêm phản hồi FAQ hoặc kết quả cũ; (5) hướng dẫn đăng nhập trực tiếp cho mọi yêu cầu xem đơn của guest. G06 đạt ở mức UI; G11 xác nhận không thấy lộ dữ liệu đơn.
