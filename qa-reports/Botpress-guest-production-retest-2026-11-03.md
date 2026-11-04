# Kiểm thử lại Botpress guest trên production — 03/11/2026

## Phạm vi và cách kiểm tra

- Môi trường: `https://tiem-mua-cham-store.vercel.app/`, widget Botpress Friendly Duck, phiên storefront đang ở trạng thái guest (hiện “Đăng nhập”).
- Thời gian: khoảng 17:53–17:59 ICT, sau lần publish người dùng báo.
- Kiểm thử trực tiếp trong một conversation guest; đối chiếu các kết quả sản phẩm với snapshot đọc từ catalog/variant Supabase tại thời điểm chạy (145 sản phẩm, không ghi dữ liệu).
- Theo yêu cầu người dùng, **không mở hoặc kiểm thử liên kết sản phẩm**. F08 được loại khỏi lần chạy này; xác nhận link của người dùng được giữ nguyên, không suy ra kết quả mới.
- Bản `Botpress-thesis-test-plan.md` hiện bị xóa khỏi working tree trước lượt này; tiêu chí F01–F08/C01/C05 được đọc từ bản Git HEAD. Không khôi phục hoặc thay đổi file đó.

## Kết quả

| Ca | Kết quả | Bằng chứng quan sát |
|---|---|---|
| F01 — chào | **Pass** | “Chào shop” → bot chào và hướng dẫn tìm/tư vấn sản phẩm; nhắc đăng nhập nếu tra đơn. |
| F02 — giá sản phẩm cụ thể | **Fail** | Hỏi “Áo thun nam Daily giá bao nhiêu?” → bot đưa thẻ **Áo thun nam cổ tròn Daily**, không đúng bản ghi “Áo thun nam Daily”. Cả hai cùng giá 219.000đ nên giá đúng không bù được lỗi định danh. |
| F03 — chất liệu | **Fail** | Hỏi chất liệu “Áo thun nam Daily” → bot liệt kê ba áo Daily và giá, không trả thuộc tính Cotton hiện có trong catalog. Có thêm thông điệp sản phẩm lặp lại. |
| F04 — lọc đen/M/dưới 250.000đ/còn hàng | **Pass ở mức tập kết quả** | Bot liệt kê 7 sản phẩm; snapshot catalog xác nhận 7 sản phẩm riêng biệt có variant đen, size M, giá dưới 250.000đ và stock dương. Câu trả lời chỉ hiện tên/giá, chưa nêu rõ variant/stock từng mẫu. |
| F05 — loại sản phẩm | **Fail** | “Shop có những loại sản phẩm nào?” → bot hiện thẻ một áo thun và nói có 29 sản phẩm khớp, không tóm tắt các loại/danh mục. |
| F06 — áo len nữ dưới 350.000đ size L | **Pass ở mức tập kết quả** | Bot liệt kê 4 mẫu, đúng 4 product ID thỏa điều kiện trong snapshot; không có dấu hiệu cắt danh sách. Câu trả lời chưa nhắc lại size L. |
| F07 — sản phẩm không tồn tại | **Fail, tái hiện 2 lần** | “Có mẫu Quantum Unicorn ZX-999 không?” → cả hai lần bot lặp thẻ và danh sách bốn áo len nữ từ lượt F06, không trả lời rằng không tìm thấy. Lần thứ hai được gửi khi lượt trước đã kết thúc. |
| C01 — giữ bộ lọc khi hỏi tiếp | **Fail** | Sau khi bot liệt kê 7 áo thun nam dưới 250.000đ size M, hỏi “Trong những mẫu đó còn màu đen không?” → bot nói không tìm thấy sản phẩm nào. Snapshot và F04 xác nhận 7 mẫu có variant đen/M còn hàng. |
| C05 — guest hỏi đơn hàng | **Partial** | “Tôi muốn xem đơn hàng của tôi” → bot yêu cầu đăng nhập, không trả dữ liệu đơn, không hỏi mật khẩu/OTP. Chỉ quan sát UI; chưa có trace xác nhận route và backend. |
| F08 — liên kết sản phẩm | **Không chạy theo yêu cầu** | Người dùng đã xác nhận link sản phẩm ổn và yêu cầu không tự mở link. |

**Tổng hợp trong 9 ca đã chạy:** 3 Pass, 5 Fail, 1 Partial. F08 không nằm trong mẫu số. Những ca còn lại của kế hoạch chưa được chạy trong lượt retest này; không kế thừa trạng thái của các đợt trước thành kết quả mới.

## Việc cần xử lý

1. Sửa truy xuất đúng product ID khi tên gần giống nhau (F02) và trả đúng thuộc tính material có trong nguồn (F03).
2. Phân biệt câu hỏi tổng quan danh mục với truy vấn lọc sản phẩm (F05).
3. Xóa/ngăn trạng thái tìm kiếm cũ chi phối câu hỏi không liên quan; bảo đảm truy vấn không có kết quả trả “không tìm thấy” (F07).
4. Giữ bộ lọc của lượt trước khi câu hỏi tiếp bổ sung màu, hoặc hỏi lại nếu thiếu ngữ cảnh (C01).
5. Nếu cần nghiệm thu bảo mật C05, bổ sung trace hoặc kiểm thử backend bằng fixture guest riêng.

Không có thao tác tạo đơn, sửa dữ liệu hay nhấp liên kết sản phẩm trong lượt kiểm thử.
