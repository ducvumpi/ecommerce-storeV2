# Kiểm thử nâng cao luồng Guest — 09/11/2026

- Website: https://tiem-mua-cham-store.vercel.app/
- Thời gian quan sát: khoảng 09:10–09:41 ICT. Snapshot danh mục lúc 09:36:29 ICT.
- Phạm vi: chatbot production, bộ G01–G12 theo [kế hoạch hiện có](./Botpress-chat-guest-auth-test-plan-2026-11-05.md).
- Guest được xác nhận qua navbar “Đăng nhập”/“Đăng ký”; không đăng nhập tài khoản QA.
- Bằng chứng: [hội thoại nguyên văn](./guest-advanced-evidence-2026-11-09.json), [snapshot 145 sản phẩm và biến thể](./guest-catalog-2026-11-09.json).

## Kết quả

| Pass | Partial | Fail | Not Run |
|---:|---:|---:|---:|
| 2 | 5 | 5 | 0 |

Partial nghĩa là một phần yêu cầu đã đáp ứng hoặc bằng chứng chưa đủ để nghiệm thu toàn bộ case; không được tính như Pass. G02 không chạy câu “mẫu nào rẻ nhất” vì lượt đầu không có kết quả, đúng nhánh điều kiện của kế hoạch.

| Case | Kết quả | Quan sát và đối chiếu |
|---|---|---|
| G01 — hỏi áo đi làm | Partial | Bot đưa thẻ Áo thun nam cổ tròn Basic, giá 199.000đ; gợi ý thêm Áo thun nam Basic cùng giá. Giá phù hợp snapshot. Tuy nhiên, khẳng định “95 mẫu phù hợp để mặc đi làm” chưa có cơ sở phân loại công dụng để xác minh. Không yêu cầu làm rõ loại áo/ngân sách. |
| G02 — áo len nữ, màu trung tính, M, ≤400.000đ, còn hàng | **Fail** | Trả “Mình chưa tìm thấy mẫu khớp để báo giá. Bạn cho mình biết thêm loại áo hoặc tên mẫu nhé.” dù đã có loại áo. Snapshot có **8 sản phẩm** đáp ứng các điều kiện cấu trúc loại/giới tính/giá/màu/size/tồn kho. Công dụng đi làm và độ mềm không có trường dữ liệu riêng để xác minh; bot cần nêu giới hạn thay vì hỏi lại loại áo. Chạy xác nhận lần hai sau khi lời chào đã hiển thị vẫn cùng lỗi. |
| G03 — đổi màu be/nâu, cho phép S | **Fail** | Tiếp nối G02, bot lặp nguyên câu không tìm thấy và yêu cầu nêu loại áo. Các biến thể S/M màu Be/Nâu còn hàng trong snapshot; chưa xử lý hữu ích phương án thay thế. |
| G04 — bỏ áo len/nữ, đổi áo thun nam đen/M/<250.000đ | **Fail** | Trả “Không tìm thấy sản phẩm phù hợp trong dữ liệu cửa hàng.” Snapshot có **7 mẫu** đáp ứng. Kết quả chứng minh tìm kiếm sai ở đầu ra; chưa có trace để quy nguyên nhân riêng cho bộ nhớ ngữ cảnh. |
| G05 — giá Daily, hỏi tiếp giá và tồn đen/M | Partial | Giá đầu đúng 219.000đ. Lượt tiếp giữ đúng sản phẩm và giá, nhưng chỉ lặp “Áo thun nam Daily — 219.000đ”, không trả lời về biến thể hay tồn kho. Snapshot xác nhận Đen/M còn 20; không thu thập trường giá biến thể nên chưa kết luận được giá riêng của biến thể. |
| G06 — thẻ sản phẩm | **Pass** | Thẻ có ảnh tải thành công (`complete` và `naturalWidth > 0`), tên, giá, CTA “Xem sản phẩm” và `href` hợp lệ về domain storefront. Đã quan sát thẻ Daily và cổ tròn Basic. Chỉ đọc thuộc tính; không click CTA. URL vẫn là trang chủ. Chưa nghiệm thu đích đến hoặc điều hướng. |
| G07 — đếm và liệt kê đen/M còn hàng, <250.000đ | **Fail** | Bot trả “Có 0 sản phẩm phù hợp.” Đối chiếu snapshot có **7 sản phẩm**, nên lần này đủ bằng chứng xác nhận sai số lượng, thay vì chỉ Partial như báo cáo trước. |
| G08 — SKU giả và phương án thay thế | **Fail** | `Quantum Unicorn ZX-999` trả chung “Không tìm thấy sản phẩm phù hợp trong dữ liệu cửa hàng.” Không bịa sản phẩm, nhưng bỏ qua yêu cầu thay thế dưới 300.000đ/màu tối/M và không hỏi loại sản phẩm để làm rõ “gần giống”. |
| G09 — giá mâu thuẫn rồi sửa ≤300.000đ | **Pass** | Lượt 1 nhận ra dưới 200.000đ và trên 300.000đ mâu thuẫn, hỏi lại. Lượt 2 nhận đúng trần 300.000đ, không giữ mức tối thiểu; báo 23 mẫu và đưa hai mẫu 199.000đ. Snapshot có đúng **23 sản phẩm tên bắt đầu bằng “Áo” giá ≤300.000đ**; hai mẫu được nêu đều tồn tại và đúng giá. |
| G10 — “đẹp nhất”, bổ sung áo nữ ~300.000đ, rồi đen | Partial | Lượt đầu hỏi đúng loại sản phẩm. Hai lượt sau đều không tìm thấy. Snapshot không có áo dành riêng nữ giá ≤300.000đ; có áo unisex trong khoảng này và áo len nữ từ 329.000đ. Vì “khoảng 300 nghìn” và phạm vi nữ/unisex chưa được chốt, không kết luận trả rỗng chắc chắn sai. Bot chưa làm rõ độ linh hoạt ngân sách hay đưa lựa chọn gần phù hợp. |
| G11 — hỏi đơn/email giả → tư vấn → hỏi đơn lại | Partial | Cả hai lượt hỏi đơn không lộ dữ liệu đơn. Lượt đầu lặp lời chào nhưng trong đó có yêu cầu đăng nhập; lượt cuối nói “Vui lòng đăng nhập lại để xác thực phiên trước khi tra cứu đơn hàng.” Lượt tư vấn áo len nữ kem/<400.000đ ở giữa trả rỗng dù có hàng. Phần chặn đơn đạt ở UI; toàn case chưa đạt và chưa có chứng cứ backend ownership. |
| G12 — hai nhóm người, giữ nhóm chồng, đổi XL | Partial | Bot phân biệt hai nhóm và hỏi lọc nhóm nào trước. Lượt sau trả 5 mẫu nam, nêu rõ Đen/XL, mỗi biến thể còn 20; cả 5 đều đúng snapshot. Tuy nhiên, “Còn 3 mẫu phù hợp khác” ngụ ý tổng 8, trong khi snapshot có **15 mẫu áo thun nam Đen/XL còn hàng**. Chưa thể nghiệm thu đầy đủ tập kết quả hoặc quy tắc giới hạn danh sách khi bot không giải thích. |

## Tập đối chiếu cho G04/G07

Lọc trên snapshot: `gender_id = 1`, tên chứa “thun”, `base_price < 250000`, tồn tại **cùng một biến thể** có `size = M`, `color = Đen`, `stock > 0`. Không cộng dồn màu và size từ hai biến thể khác nhau.

| Sản phẩm | Giá | Tồn Đen/M |
|---|---:|---:|
| Áo thun nam Basic | 199.000đ | 20 |
| Áo thun nam Daily | 219.000đ | 20 |
| Áo thun nam Weekend | 239.000đ | 20 |
| Áo thun nam cổ tròn Basic | 199.000đ | 20 |
| Áo thun nam cổ tròn Daily | 219.000đ | 20 |
| Áo thun nam cổ tròn Weekend | 239.000đ | 20 |
| Áo thun nam dài tay Basic | 249.000đ | 20 |

Áo len nữ ≤400.000đ có 8 mẫu: Basic, Daily, Weekend, Urban của hai nhóm tên “Áo len nữ” và “Áo len nữ màu kem”, lần lượt 329.000đ, 349.000đ, 369.000đ, 389.000đ. Mỗi mẫu có biến thể M phù hợp màu trung tính và còn hàng. Không dùng thông tin màu ảnh minh họa để suy ra tồn biến thể.

## Phương pháp và giới hạn

- Các case độc lập dùng conversation mới; G02→G03→G04 chạy liền nhau theo kế hoạch. G05, G09, G10, G11, G12 giữ cùng conversation qua các lượt. Chờ nút gửi trở lại sau xử lý và đọc thêm nội dung sau khoảng 1,8 giây; không đánh giá độ trễ theo SLA vì không ghi đồng hồ đầy đủ cho từng lượt.
- G02 lần đầu gửi sát lúc khởi tạo conversation. Đã loại trừ nhiễu này bằng lần chạy xác nhận sau khi lời chào/nút tìm kiếm sẵn sàng; lỗi vẫn tái hiện.
- Snapshot đọc bằng anonymous role từ REST API công khai, chỉ chọn tên/giá/giới tính/chất liệu và màu/size/tồn kho. Dùng cấu hình public của workspace; không lưu khóa, token, cookie hoặc dữ liệu khách hàng. Chưa xác minh trực tiếp nguồn dữ liệu mà workflow Botpress dùng có cùng snapshot này hay không; chênh lệch là lỗi quan sát được giữa chatbot và catalog của web, chưa phải kết luận nguyên nhân nội bộ workflow.
- Không tạo/sửa/hủy đơn, không sửa hồ sơ, không click link sản phẩm. Không có backend trace, không kiểm thử tài khoản đăng nhập, checkout hay phân quyền giữa hai tài khoản. Không thay đổi mã ứng dụng hoặc publish bot.
- Khi restart thấy `initialize` bị `ERR_ABORTED` và cảnh báo accessibility về `DialogContent` thiếu title/description. Chưa chứng minh các log này gây lỗi hội thoại. Ảnh sản phẩm trong thẻ có `alt` rỗng; nên kiểm tra thêm với trình đọc màn hình.
- Hội thoại nguyên văn nằm trong JSON bằng chứng; timestamp của G02–G04 đầu tiên không được đo riêng, không suy ra thời gian phản hồi từ khoảng nghỉ giữa các ca.

## Ưu tiên xử lý

1. **Cao:** điều tra bộ lọc nhiều điều kiện/tồn kho và sự đồng bộ catalog; dùng G04/G07 cùng tập 7 mẫu làm tiêu chí tái kiểm thử.
2. **Cao:** xử lý câu hỏi tiếp nối và phương án thay thế, giữ điều kiện đã có; không yêu cầu khách lặp lại loại áo ở G02/G03, trả lời đủ giá và tồn kho ở G05.
3. **Trung bình:** thống nhất số lượng với tập kết quả; giải thích giới hạn danh sách ở G01/G12, không đưa số lượng không kiểm chứng.
4. **Trung bình:** sau SKU không tồn tại, hỏi loại sản phẩm để tiếp tục tìm mẫu thay thế; làm rõ ngân sách xấp xỉ và khả năng chấp nhận unisex ở G10.

So với [lượt 06/11](./Botpress-guest-advanced-production-run-2026-11-06.md), G09 đã xử lý được câu sửa giá; G05 giữ được sản phẩm nhưng còn thiếu câu trả lời tồn kho; G12 đã nêu được biến thể và số tồn. G07 chuyển từ Partial sang Fail nhờ có snapshot độc lập, không diễn giải thành hồi quy mới nếu chưa có bằng chứng thay đổi triển khai.
