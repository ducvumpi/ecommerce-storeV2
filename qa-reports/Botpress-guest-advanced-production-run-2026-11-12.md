# Tái kiểm thử nâng cao luồng Guest — 12/11/2026

**Kết quả: 9 Pass · 3 Partial · 0 Fail · 12/12 case chạy.**

- Môi trường: website production sau khi publish bản sửa Botpress ngày 09/11.
- Guest xác nhận bằng liên kết Đăng nhập/Đăng ký trên navbar; không đăng nhập.
- Giữ một conversation từ lời chào đầu đến G12, không dùng Restart; **20 lượt hỏi**, bao gồm các lượt tiếp nối để kiểm tra ngữ cảnh.
- Gửi câu hỏi qua `window.botpress.sendMessage`, API Webchat chính thức, vì tab trình duyệt chạy ở trạng thái nền (`document.visibilityState = hidden`) khiến thao tác phím không phát sinh tin nhắn. Đọc phản hồi thực tế trong DOM Webchat sau mỗi lượt; không tạo hội thoại mới.
- Transcript và kiểm tra thẻ sản phẩm: [bằng chứng JSON](./botpress-guest-advanced-single-conversation-2026-11-12.json). Không ghi conversation ID, token hoặc cookie.

| Case | Kết quả | Bằng chứng lần này |
|---|---|---|
| G01 — hỏi áo đi làm | Pass | Hỏi làm rõ sơ mi/thun, đối tượng và ngân sách/size; không còn tuyên bố số mẫu đi làm thiếu căn cứ. Có gợi ý thẻ Basic trước câu hỏi làm rõ. |
| G02 — áo len nữ, màu trung tính, M, ≤400.000đ | Pass | Báo 8 kết quả khớp, biến thể M còn 20, giá/chất liệu; giải thích danh mục không xác nhận độ mềm hay mức phù hợp đi làm. |
| G02 nối — mẫu rẻ nhất và “mẫu đó” | Pass | Chọn áo len nữ màu kem Basic 329.000đ; theo câu tham chiếu xác nhận Be/Nâu/Kem, M còn 20. |
| G03 — đổi sang Be/Nâu, S nếu M hết | Partial | Cập nhật màu sang Be/Nâu và giữ giá, size M còn 20. Không sửa tồn kho thật để kích hoạt nhánh dự phòng S khi M hết hàng. |
| G04 — đổi tiêu chí sang áo thun nam Đen/M, <250.000đ | Pass | Đếm đúng 7; hiển thị 5/7. Mỗi biến thể liệt kê Đen/M có tồn 20. |
| G05 — giá Daily, tiếp theo hỏi giá/tồn màu đen size M | Pass | Trả 219.000đ; lượt nối trả Đen/M còn 20 và giá biến thể 219.000đ. |
| G06 — thẻ sản phẩm | Pass | Thẻ trong Webchat có ảnh tải thành công, tên, giá và URL chính thức đúng domain. Chỉ đọc DOM, không click link. |
| G07 — đếm/liệt kê, loại mẫu hết hàng | Pass | Trả và liệt kê đủ 7 mẫu dưới 250.000đ Đen/M còn hàng. |
| G08 — SKU giả và mẫu thay thế | Partial | Không bịa SKU; hỏi loại hàng để chọn sản phẩm thay thế và giữ điều kiện. Chưa trả lời câu hỏi loại sản phẩm tiếp theo. |
| G09 — giá mâu thuẫn rồi sửa | Pass | Phát hiện dưới 200.000đ và trên 300.000đ xung đột; sau sửa trả 23 mẫu ≤300.000đ, nêu 5/23 và còn 18. |
| G10 — “đẹp nhất”, áo nữ khoảng 300.000đ, rồi màu đen | Partial | Hỏi rõ loại hàng; không tự vượt ngân sách/đổi nữ sang unisex. Khi hỏi màu đen, tiếp tục hỏi về ngân sách/nhóm thay vì trả kết quả từ nhóm khác. Chưa kiểm nghiệm màu nếu khách đồng ý đổi điều kiện. |
| G11 — guest hỏi đơn/email giả → tư vấn → hỏi đơn | Pass (UI) | Cả hai câu hỏi đơn bị chặn bằng hướng dẫn đăng nhập; không xuất hiện dữ liệu đơn. Lượt tư vấn giữa trả 8 mẫu áo len kem. Backend ownership/auth không nằm trong phạm vi UI này. |
| G12 — hai người, chọn nhóm chồng và đổi XL | Pass | Hỏi chọn nhóm trước; sau khi chọn trả đúng 15 mẫu áo thun nam Đen/XL, mỗi biến thể có tồn 20, nêu 5/15 và còn 10. |

**Tóm tắt:** Các lỗi trả 0 mẫu sai, rơi giá/tồn biến thể, sai tổng số, trộn nhóm và mất ngữ cảnh giá chưa tái hiện. Ba Partial đều là nhánh không thể khẳng định đầy đủ nếu không tạo trạng thái tồn giả, gửi lượt trả lời cho SKU thay thế, hoặc thay đổi nhóm/ngân sách của G10. Không tạo/sửa/hủy đơn, không đổi tồn kho, không mở link sản phẩm.
