# Báo cáo chạy lại kiểm thử guest Botpress trên production — 04/11/2026

## Phạm vi và cách chạy

- Website production: https://tiem-mua-cham-store.vercel.app/
- Botpress webchat: **Trợ lý Nai Tiệm Mùa Chậm**.
- Trạng thái: guest; giao diện storefront hiển thị Đăng nhập/Đăng ký. Không đăng nhập.
- Chạy lại các case guest chọn lọc trong [kế hoạch production](./Botpress-thesis-production-run-2026-11-02.md).
- Dùng conversation đang mở sẵn trên trang; không bấm Restart Conversation. Các tin nhắn được gửi liên tiếp trong cùng thread, vì vậy các kết quả có thể chịu ảnh hưởng bởi ngữ cảnh trước đó.
- Không bấm hoặc mở link sản phẩm. Chỉ ghi nhận link `href` hiển thị trong các thẻ xem trước.
- Không tạo đơn, sửa dữ liệu cửa hàng, gọi API ghi dữ liệu, hoặc dùng tài khoản QA.
- Thời gian: khoảng 17:45 ICT, 04/11/2026. Không đo latency chính xác và không lưu conversation ID.

## Tổng hợp

| Trạng thái | Số case |
|---|---:|
| Pass | 5 |
| Fail | 2 |
| Partial | 3 |
| Blocked / Not run trong lượt này | Các case còn lại của kế hoạch |

Đây là lượt chạy chọn lọc, không phải nghiệm thu toàn bộ kế hoạch. Các kết luận về tính đầy đủ của danh mục, biến thể và tồn kho cần snapshot dữ liệu độc lập; các nhánh cần tài khoản, trace hoặc giả lập lỗi không được kiểm thử.

## Kết quả chi tiết

| Case | Trạng thái | Kết quả quan sát trên production |
|---|---|---|
| F01 — chào hỏi | **Pass (UI)** | `Chào shop` → lời chào và hai nút `Tìm sản phẩm`, `Tư vấn sản phẩm`. |
| F02 — giá sản phẩm cụ thể | **Pass (UI)** | `Áo thun nam Daily giá bao nhiêu?` → `Áo thun nam Daily — 219.000đ`. Chưa đối chiếu snapshot catalog hiện thời. |
| F05 — hỏi nhóm/danh mục sản phẩm | **Partial** | `Shop có những loại sản phẩm nào?` → 3 nhóm Nam/Nữ/Unisex, kèm ví dụ và bộ sưu tập. Không có snapshot để xác nhận câu trả lời bao quát đầy đủ các danh mục hiện có. |
| F11 — đếm so với liệt kê | **Fail** | `Có bao nhiêu áo nam dưới 250.000đ?` không trả con số; thay vào đó là 5 thẻ sản phẩm Basic/Daily/Weekend và phần chữ lệch ngữ cảnh: `Giá các mẫu Daily phù hợp`. Câu kế tiếp `Liệt kê tất cả áo nam dưới 250.000đ` trả 7 mục: Basic, Daily, Weekend và áo dài tay Basic. Hai cách hỏi không cho cùng một định dạng/kết quả đếm; câu đếm không trả số lượng được hỏi. Không có snapshot catalog để xác nhận 7 là tổng chính xác. |
| F07 — sản phẩm không tồn tại | **Pass (UI)** | `Có mẫu Quantum Unicorn ZX-999 không?` → `Không tìm thấy sản phẩm phù hợp trong dữ liệu cửa hàng.` Không gợi ý giá hay sản phẩm bịa. |
| C05 — guest hỏi đơn hàng | **Partial** | `Tôi muốn xem đơn hàng của tôi` → lời nhắc đăng nhập, không hiển thị dữ liệu đơn hàng và kèm nút tìm/tư vấn. Hành vi giao diện đạt mục tiêu guest; chưa có trace/backend evidence để xác nhận nhánh bảo mật. |
| N06 — điều kiện giá mâu thuẫn | **Pass (UI)** | `Tìm áo dưới 200.000đ và trên 300.000đ` → bot nói hai điều kiện mâu thuẫn và hỏi người dùng muốn giữ điều kiện nào. |
| N02 — lỗi gõ tên Daily | **Pass (UI)** | `Áo thun nam Dail giá bao nhiêu?` → nhận diện thành `Áo thun nam Daily — 219.000đ`. |
| N04 — yêu cầu mơ hồ | **Fail** | `Cho tôi cái đẹp nhất` → `Chưa tìm thấy sản phẩm phù hợp với điều kiện hiện tại.` Bot không hỏi người dùng muốn loại sản phẩm nào hoặc tiêu chí lựa chọn nào. |
| F04 — lọc nhiều điều kiện | **Partial** | `Tìm áo thun nam màu đen, size M, dưới 250.000đ và còn hàng` → thẻ sản phẩm và danh sách nói có 7 mẫu; các mẫu hiển thị nêu màu Đen, size M, tồn kho 20. Chưa đối chiếu SKU/variant và stock với snapshot độc lập; không kết luận độ đầy đủ/tồn kho chính xác. |

## Quan sát về thẻ sản phẩm và link

Trong câu trả lời lọc sản phẩm, giao diện hiển thị carousel gồm ảnh, tên, giá và liên kết `Xem sản phẩm`; snapshot giao diện cho thấy `href` trỏ đến URL sản phẩm trên cùng domain storefront. Không có link nào được click, không quan sát thấy điều hướng hay tab mới trong lượt này. Vì vậy lượt chạy chỉ xác nhận có `href` trong DOM, không xác nhận hành vi khi người dùng bấm.

Ở ca F11, câu hỏi đếm hiển thị 5 thẻ trong carousel; câu liệt kê kế tiếp hiển thị 7 mục dạng danh sách chữ. Cùng thread vẫn còn đoạn trả lời `Giá các mẫu Daily phù hợp` từ ca đếm, cho thấy ngữ cảnh cũ có thể đang ảnh hưởng tới phản hồi. Cần chạy lại F11 trong conversation sạch sau khi có quota phù hợp và sửa logic đếm/ngữ cảnh.

## Kết luận và việc cần làm

Các nhánh chào hỏi, giá Daily, lỗi gõ tên, câu hỏi sản phẩm không tồn tại, guest hỏi đơn và điều kiện giá mâu thuẫn phản hồi hợp lý ở mức giao diện. Hai lỗi tái hiện trong lượt này là **F11 đếm sản phẩm không trả số và lệch ngữ cảnh** và **N04 không làm rõ yêu cầu mơ hồ**. F04/F05/C05 còn thiếu bằng chứng độc lập về dữ liệu hoặc backend.

Ưu tiên xử lý: (1) tách intent đếm khỏi nhánh tư vấn/liệt kê và đảm bảo câu trả lời có số đếm nhất quán với danh sách; (2) khi tiêu chí sản phẩm mơ hồ, hỏi lại thay vì trả kết quả rỗng; (3) sau khi sửa, chạy F11/N04 trong conversation guest mới, rồi xác minh F04/F05 bằng snapshot và C05 bằng trace đã che dữ liệu cá nhân.

Không xác minh Botpress revision/version production trong lượt này. Các case còn lại của kế hoạch không được chạy lại.
