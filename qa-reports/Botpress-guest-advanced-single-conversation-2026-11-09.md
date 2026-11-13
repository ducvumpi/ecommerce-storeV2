# Tái kiểm thử Guest nâng cao trong một conversation — 09/11/2026

**Kết quả: 9 Pass · 3 Partial · 0 Fail · 12/12 case chạy.**

Website production: https://tiem-mua-cham-store.vercel.app/ · Botpress Friendly Duck đã publish bản sửa ở lượt làm việc trước. Lần này bắt đầu từ lời chào guest trong một conversation duy nhất, gửi **19 lượt hỏi liên tiếp**, không bấm Restart và không tạo conversation khác. Các thay đổi nhu cầu mới được nói rõ trong chính câu hỏi; câu hỏi nối tiếp dùng kết quả ngay trước đó.

| Case | Kết quả | Xác nhận trong cùng conversation |
|---|---|---|
| G01 — hỏi áo đi làm | Pass | Hỏi rõ sơ mi/thun, giới tính, ngân sách/size thay vì khẳng định số lớn không có nguồn. Thẻ Basic vẫn được đưa trước câu hỏi làm rõ. |
| G02 — áo len nữ, màu trung tính, size M, ≤400.000đ | Pass | Trả 8 mẫu và biến thể M còn hàng; nêu rõ catalog không có tiêu chí đánh giá “mềm/đi làm”. |
| G02 nối — mẫu rẻ nhất và “mẫu đó” | Pass | Chọn Basic 329.000đ; lượt kế xác nhận mẫu đó có Be/Nâu/Kem, size M còn 20. |
| G03 — đổi sang Be/Nâu, size S nếu M hết | Partial | Cập nhật đúng Be/Nâu và giữ giá/loại áo; trả M còn 20 nên nhánh dự phòng size S không được kích hoạt. Không sửa tồn kho thật để giả lập M hết. |
| G04 — đổi hẳn sang thun nam đen/M, ≤250.000đ | Pass | Trả đúng 7 mẫu; hiển thị 5/7, mỗi biến thể khớp tồn 20. |
| G05 — giá Daily, hỏi tiếp đen/M và tồn | Pass | 219.000đ; màu Đen, size M còn 20, giá biến thể 219.000đ. |
| G06 — thẻ/link sản phẩm | Pass | Trong cùng transcript có thẻ với ảnh tải được, tên, giá và `href` đúng domain storefront. Chỉ đọc DOM, không click link. |
| G07 — đếm/liệt kê, loại hàng hết | Pass | 7 mẫu, liệt kê đủ tên và tồn theo đúng Đen/M. |
| G08 — SKU giả và yêu cầu thay thế | Partial | Không bịa mẫu; nói không tìm thấy và hỏi loại sản phẩm để tiếp tục, đồng thời giữ điều kiện. Chưa gửi lượt trả lời loại sản phẩm sau câu hỏi làm rõ. |
| G09 — khoảng giá mâu thuẫn rồi sửa | Pass | Nhận ra xung đột, hỏi lại; sau sửa trả 23 mẫu ≤300.000đ, nêu 5/23. |
| G10 — “đẹp nhất”, thêm áo nữ khoảng 300.000đ rồi hỏi màu đen | Partial | Hỏi loại sản phẩm; giải thích áo nữ trong ngân sách không khớp và đề nghị tăng ngân sách hoặc xem unisex. Khi hỏi màu đen, giữ nguyên câu làm rõ ngân sách/nhóm thay vì tự mở rộng tập kết quả. Chưa xác minh được màu đen trong nhóm nữ/unisex nếu khách chấp nhận đổi điều kiện. |
| G11 — hỏi đơn/email QA giả, tư vấn, hỏi đơn lại | Pass (UI) | Hai lần hỏi đơn đều yêu cầu đăng nhập lại, không lộ đơn. Lượt tư vấn xen giữa trả 8 mẫu áo len kem ≤400.000đ. |
| G12 — hai nhóm người, chọn nhóm chồng, đổi size XL | Pass | Hỏi chọn nhóm trước; sau khi chọn trả 15 sản phẩm Đen/XL, hiển thị đúng 5/15 và còn 10. |

## Bằng chứng và giới hạn

Toàn bộ transcript của conversation production, URL hiện tại, guest-login indicator, và thuộc tính các thẻ được lưu tại [JSON bằng chứng](./botpress-guest-single-conversation-run-2026-11-09.json). Transcript giữ cả nội dung giữa các lượt để xem cách context đi qua G02→G03→G04, G05 và G11→G12.

Đây là kiểm tra UI trên production bằng guest; không tạo/sửa/hủy đơn, không mở link sản phẩm, không dùng email thật. Bằng chứng giao diện không thay thế kiểm thử quyền sở hữu đơn phía backend. Dữ liệu kho đang dương nên không xác nhận nhánh size dự phòng/hết hàng bằng cách thay đổi inventory. Không dùng lượt này để kết luận các câu trả lời ở phạm vi ngoài 12 case nêu trên.
