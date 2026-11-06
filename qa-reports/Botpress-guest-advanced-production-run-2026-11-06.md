# Báo cáo kiểm thử Guest nâng cao – Production

**Ngày chạy:** 06/11/2026 (ICT)  
**Môi trường:** https://tiem-mua-cham-store.vercel.app/  
**Bot:** Friendly Duck / Trợ lý Nai Tiệm Mùa Chậm  
**Kế hoạch:** [Botpress chat guest/auth test plan](./Botpress-chat-guest-auth-test-plan-2026-11-05.md)  
**Phạm vi:** G01–G12, luồng guest; không kiểm thử backend ownership/authenticated orders.

## Tổng kết

| Pass | Partial | Fail | Not Run |
|---:|---:|---:|---:|
| 1 | 4 | 7 | 0 |

Luồng thẻ sản phẩm sau khi bỏ carousel card trống đã hiển thị được trên production. Các vấn đề chính còn lại thuộc truy vấn đa điều kiện, giữ ngữ cảnh khi sửa bộ lọc, số lượng sản phẩm và phản hồi đầu tiên với yêu cầu đơn hàng guest.

## Kết quả theo case

| ID | Trạng thái | Kết quả quan sát |
|---|---|---|
| G01 | **Partial** | Với “Shop có áo nào dễ mặc đi làm không?”, bot hỏi làm rõ sơ mi hay áo thun, nhưng đồng thời nói có 5 mẫu mà không liệt kê tên/giá. Câu hỏi làm rõ phù hợp; con số và mô tả kết quả chưa đủ căn cứ. |
| G02 | **Fail** | Yêu cầu áo len nữ, màu trung tính, size M, tối đa 400.000đ và còn hàng trả “chưa tìm thấy mẫu khớp” rồi yêu cầu cung cấp lại loại áo/tên mẫu, dù loại áo và nhiều bộ lọc đã có. Không có danh sách để so sánh mẫu rẻ nhất. |
| G03 | **Fail** | Khi cho phép đổi màu kem sang be/nâu và size M sang S, bot vẫn lặp lại “chưa tìm thấy mẫu khớp” và yêu cầu nêu lại loại áo/tên mẫu; không thể hiện đã áp dụng phương án thay thế. |
| G04 | **Fail** | Sau khi chuyển sang áo thun nam đen, size M, dưới 250.000đ và bỏ bộ lọc áo len/nữ, bot trả “Không tìm thấy sản phẩm phù hợp”. Không xác nhận được việc làm mới bộ lọc trong hội thoại. |
| G05 | **Fail** | Câu đầu về áo thun nam Daily trả thẻ sản phẩm và giá 219.000đ. Câu hỏi tiếp về giá/tồn kho size M màu đen lại báo không tìm thấy mẫu và yêu cầu nêu lại tên/loại áo, không trả lời được thuộc tính biến thể. |
| G06 | **Pass** | Thẻ production hiển thị ảnh tải thành công, tên, giá và liên kết “Xem sản phẩm” có `href`. Không click link; URL trang vẫn ở storefront, không mở trang/tab sản phẩm trong lúc kiểm thử. |
| G07 | **Partial** | Với bộ lọc áo thun nam dưới 250.000đ, màu đen, size M còn hàng, bot trả “Có 0 sản phẩm phù hợp” nhưng không đưa danh sách hoặc giải thích giới hạn tồn kho. Không có snapshot catalog/stock độc lập để xác nhận con số 0. |
| G08 | **Fail** | SKU giả `Quantum Unicorn ZX-999` trả “Không tìm thấy sản phẩm phù hợp trong dữ liệu cửa hàng”; bot không nói rõ không tìm thấy SKU gốc, không hỏi thêm loại sản phẩm và không đưa gợi ý thay thế theo các tiêu chí đã nêu. |
| G09 | **Fail** | Bot nhận ra xung đột “dưới 200.000đ và trên 300.000đ” và hỏi lại khoảng giá. Sau khi người dùng sửa thành tối đa 300.000đ, bot quay về lời chào chung thay vì chạy lại tìm kiếm. |
| G10 | **Fail** | Với “Cho mình cái đẹp nhất”, bot hỏi thêm kiểu/màu. Sau khi khách nêu áo nữ mặc hằng ngày, dễ phối, khoảng 300.000đ, bot báo không tìm thấy; câu bổ sung “màu đen” tiếp tục trả không tìm thấy, không giữ bộ lọc/ngữ cảnh hữu ích. |
| G11 | **Partial** | Guest đưa email giả `guest-test@example.invalid` để hỏi đơn. Bot không trả dữ liệu đơn nhưng lượt đầu chỉ lặp lời chào thay vì hướng dẫn đăng nhập rõ ràng. Câu tư vấn áo len sau đó không tìm thấy sản phẩm; câu hỏi đơn lần hai được chặn bằng “Vui lòng đăng nhập lại để xác thực phiên…”. Không thấy dữ liệu đơn bị lộ. |
| G12 | **Partial** | Bot nhận ra có hai nhóm khách và hỏi muốn lọc nhóm nào trước. Sau khi chọn nhóm nam và đổi size XL, bot trả thẻ áo thun nam cổ tròn Basic giá 199.000đ. Nội dung hiển thị không xác nhận màu đen, size XL hay tồn kho, nên chưa đủ bằng chứng để kết luận bộ lọc được đáp ứng. |

## Ghi chú quan sát

- Các lượt kiểm tra sản phẩm chỉ đọc nội dung thẻ và thuộc tính `href`; không mở link sản phẩm. Trang production vẫn ở URL storefront.
- UI trả lời đôi lúc chèn lời chào chung sau câu hỏi của khách; thấy rõ ở G09 và G11. Khi tạo conversation mới, log trình duyệt có `initialize` bị `ERR_ABORTED` và cảnh báo accessibility của `DialogContent` thiếu title/description. Chưa có trace độc lập để kết luận các log này gây lỗi định tuyến.
- Các đánh giá về số lượng/tồn kho là đánh giá theo UI. Không có catalog/variant/stock snapshot độc lập trong lượt chạy này; vì vậy G07 để Partial thay vì khẳng định số 0 sai.
- Không kiểm tra backend/API, không dùng tài khoản thật, không tạo/sửa/hủy đơn.

## Ưu tiên xử lý

1. Giữ loại sản phẩm, màu, size, giá và giới tính qua các câu nối; cập nhật đúng bộ lọc khi khách đổi yêu cầu.
2. Sau câu làm rõ, chạy lại tìm kiếm và trả kết quả thay vì lời chào chung hoặc yêu cầu lặp tiêu chí đã có.
3. Chỉ báo số lượng khi đồng nhất với danh sách sản phẩm và dữ liệu variant/tồn kho; nếu thiếu dữ liệu thì nói rõ giới hạn.
4. Với guest hỏi đơn, lượt đầu cần hướng dẫn đăng nhập ngay; tiếp tục không tiết lộ đơn từ email hoặc ngữ cảnh guest.
