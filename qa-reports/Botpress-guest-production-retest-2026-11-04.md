# Kiểm thử lại Botpress guest trên production — 04/11/2026

## Phạm vi

- Website: `https://tiem-mua-cham-store.vercel.app/`; storefront hiển thị “Đăng nhập”, xác nhận phiên guest ở mức UI.
- Kiểm thử trực tiếp trong một conversation webchat sau lần publish gần nhất. Không mở hoặc kiểm thử link sản phẩm theo yêu cầu của người dùng.
- Lần này không lấy snapshot catalog/tồn kho mới; F04/F06/C01 chỉ chấm theo phản hồi UI và đối chiếu với tập sản phẩm đã xác nhận ngày 03/11/2026.

## Kết quả

| Ca | Trạng thái | Bằng chứng |
|---|---|---|
| F02 — giá đúng mẫu | **Pass (production)** | “Áo thun nam Daily giá bao nhiêu?” → thẻ **Áo thun nam Daily**, câu trả lời “Áo thun nam Daily — 219.000đ.” Không mở thẻ/link. |
| F03 — chất liệu | **Pass (production)** | Sau publish, lượt guest sạch hỏi “Áo thun nam Daily có chất liệu gì?” → bot trả “Áo thun nam Daily có chất liệu Cotton.” |
| F04 — đen/M/dưới 250.000đ/còn hàng | **Partial** | Trả 7 tên và giá đúng tập đã thấy ngày 03/11. Không có snapshot variant/stock mới hoặc xác nhận từng điều kiện trong câu trả lời. |
| F05 — loại sản phẩm | **Pass (production)** | “Shop có những loại sản phẩm nào?” → bot liệt kê 29 danh mục, mỗi danh mục kèm số lượng. |
| F06 — áo len nữ dưới 350.000đ size L | **Partial** | Trả 4 tên và giá như tập ngày 03/11; chưa đối chiếu product ID/variant size L với snapshot mới. |
| F07 — mẫu không tồn tại | **Pass (production)** | Ngay sau F05, “Có mẫu Quantum Unicorn ZX-999 không?” → “Hiện không tìm thấy sản phẩm phù hợp… Số sản phẩm khớp: 0.” Không lặp lại 29 danh mục. |
| C01 — câu hỏi tiếp nối | **Partial (production)** | Sau khi lọc áo thun nam dưới 250.000đ size M (7 mẫu), hỏi “Trong những mẫu đó còn màu đen không?” → bot trả lại nguyên 7 mẫu nhưng không xác nhận màu/biến thể đen cho mẫu nào. Không mở thẻ/link. |
| C05 — guest hỏi đơn hàng | **Pass ở UI / Partial về backend** | “Tôi muốn xem đơn hàng của tôi” → bot nhắc đăng nhập, không trả dữ liệu đơn và không yêu cầu mật khẩu/OTP. Chưa có trace backend để nghiệm thu nhánh bảo mật. |

F01, F08 và các mã khác của kế hoạch không chạy trong lượt này; F08 bị loại theo chỉ dẫn không kiểm thử link sản phẩm.

## Trạng thái sửa lỗi

Đã sửa và publish các nhánh `Consult AI`/`AI_talk`. Trong lượt production guest mới, F02, F03, F05 và F07 đều pass; F04 trả 7 kết quả theo mô tả tên/giá nhưng chưa xác minh biến thể/tồn kho; C01 vẫn không nêu rõ mẫu nào có màu đen; C05 chặn thông tin đơn hàng bằng yêu cầu đăng nhập ở mức giao diện. Không mở bất kỳ link sản phẩm nào.

## Ưu tiên tiếp theo

1. Sửa câu hỏi tiếp nối C01 để lọc và trả lời rõ biến thể màu đen từ dữ liệu variant; hiện bot lặp nguyên 7 kết quả.
2. Chạy F06 và lấy snapshot tồn kho/variant mới trước khi kết luận size hoặc tình trạng còn hàng.
3. Kiểm tra trace backend cho C05 nếu cần nghiệm thu bảo mật ngoài hành vi giao diện.
