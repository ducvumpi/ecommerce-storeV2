# Kết quả chạy Guest test case — 20/11/2026

- **Kế hoạch:** [Botpress-thesis-test-cases-v2-2026-11-20.md](./Botpress-thesis-test-cases-v2-2026-11-20.md)
- **Môi trường:** production — `https://tiem-mua-cham-store.vercel.app`
- **Vai trò:** guest thật; navbar hiện Đăng nhập/Đăng ký; GET `/api/chat/orders` với credentials omit trả 401.
- **Kết quả F01–F12:** **10 Pass · 2 Partial · 0 Fail**.
- **Conversation:** giữ lượt nối tiếp trong cùng conversation ở các chuỗi nhiều bước. Một số case độc lập được reset để không kế thừa tiêu chí cũ; trong lần đầu sau restart đã quan sát race greeting, ghi ở F01/I01.

## Functional cases

| ID | Kết quả | Quan sát |
|---|---|---|
| F01 | Partial | Guest greeting và navbar đúng; reload rồi mở widget có một greeting. Tuy nhiên, ngay sau khởi tạo conversation mới, lần gửi đầu từng nhận greeting trùng thay vì xử lý câu hỏi; gửi lại sau khi widget ổn định thì được xử lý. |
| F02 | Pass | Câu hỏi về áo đi làm được làm rõ về loại sản phẩm, kiểu dáng hoặc ngân sách trước khi tìm. |
| F03 | Pass | Áo len nữ Be/Kem/Nâu, M, tối đa 400.000đ, còn hàng trả 8 mẫu; biến thể M, giá và tồn được hiển thị. |
| F04 | Pass | Trong tập F03, bot chọn Áo len nữ màu kem Basic giá 329.000đ; giá là thấp nhất trong tập và các biến thể cùng size được liệt kê. |
| F05 | Partial | Với câu dự phòng, bot giữ size M và trả sản phẩm còn hàng. Không có fixture production để làm size M hết và xác nhận nhánh chuyển sang S. |
| F06 | Pass | Yêu cầu đổi sang áo thun nam đen M dưới 250.000đ bỏ được điều kiện áo len/nữ; trả 7 mẫu đúng tiêu chí. |
| F07 | Pass | Áo thun nam Daily trả giá 219.000đ; Đen/M còn 24; câu hỏi chất liệu giữ đúng Daily và trả Cotton. |
| F08 | Pass | Đếm/liệt kê trả 7 sản phẩm áo thun nam đen M dưới 250.000đ có tồn; danh sách khớp số đếm, nói rõ 5/7 mẫu đang hiển thị. |
| F09 | Pass | SKU Quantum Unicorn ZX-999 không bị bịa; bot hỏi loại sản phẩm; sau “Áo thun nam” trả 13 kết quả trong giới hạn 300.000đ, màu tối, M. |
| F10 | Pass | Mâu thuẫn dưới 200.000đ/trên 300.000đ được phát hiện; sau sửa thành tối đa 300.000đ trả 23 sản phẩm, không giữ giá sàn cũ. |
| F11 | Pass | “Cái đẹp nhất” được hỏi làm rõ; với áo nữ khoảng 300.000đ bot báo chưa có kết quả và không tự nới; hỏi màu đen vẫn giữ nhóm nữ/ngân sách. |
| F12 | Pass | Hai nhóm được làm rõ; “Chỉ giữ nhóm của chồng” trả 15 áo thun nam đen; đổi L→XL cho 15 kết quả chỉ có variant XL đen. |

## Auth boundary và phạm vi ngoài guest phase

| ID | Kết quả | Quan sát |
|---|---|---|
| I01 | Partial | UI guest đúng và greeting hiển thị; không có Botpress event/trace để xác minh identity routing. Có một lần greeting trùng khi gửi ngay sau khởi tạo conversation. |
| I02 | Partial | GET `/api/chat/orders` với `credentials: omit` trả HTTP 401, không trả dữ liệu đơn. “Tra cứu đơn hàng của tôi bằng email …invalid” được yêu cầu đăng nhập; nhưng “Mình muốn xem đơn gần nhất; email …invalid” ngay sau khởi tạo conversation chỉ nhận greeting trùng, chưa có hướng dẫn đăng nhập. |
| F13–F15 | Blocked | Các case cần AUTH-A, staging/cart fixture; không thực hiện thao tác giỏ hàng trên production trong guest phase. |
| I03–I07 | Blocked | Cần AUTH-A/AUTH-B hoặc staging/fault injection; không giả lập quyền bằng guest event. |

## Giới hạn bằng chứng

- Giá và tồn kho được đối chiếu với dữ liệu variant bot hiển thị; chưa có snapshot catalog/database độc lập cùng timestamp.
- F05 chưa kiểm chứng được nhánh size M hết hàng do không có fixture phù hợp trên production.
- I01 chỉ có bằng chứng UI; cần Botpress trace để kết luận việc đồng bộ identity event. Cần kiểm tra thêm nhận diện câu tra đơn ngay sau khi khởi tạo conversation.
