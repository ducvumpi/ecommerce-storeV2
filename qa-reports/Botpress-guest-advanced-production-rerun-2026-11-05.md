# Báo cáo kiểm thử Guest nâng cao — Production (chạy lại)

**Ngày chạy:** 05/11/2026 (ICT)  
**Môi trường:** https://tiem-mua-cham-store.vercel.app/collections  
**Phạm vi:** 12 case guest nâng cao G01–G12 theo [kế hoạch kiểm thử](./Botpress-chat-guest-auth-test-plan-2026-11-05.md). Đây là kiểm thử hộp đen qua giao diện production sau lần publish gần nhất được cung cấp.

## Tổng kết

| Pass | Partial | Fail | Not Run |
|---:|---:|---:|---:|
| 2 | 3 | 7 | 0 |

**Kết luận:** luồng guest chưa đạt cho hội thoại nhiều lượt. Các lỗi tập trung ở truy vấn rộng không hỏi làm rõ, mất ngữ cảnh khi hỏi tiếp/đổi tiêu chí, kết quả lệch bộ lọc và không trả rõ số lượng. Không có thay đổi production nào được thực hiện trong lần chạy này.

## Kết quả theo case

| ID | Kết quả | Quan sát |
|---|---|---|
| G01 | **Fail** | “Shop có áo nào dễ mặc đi làm không?” trả “Không tìm thấy sản phẩm phù hợp với các điều kiện hiện tại”, không hỏi rõ loại áo/ngân sách/size. |
| G02 | **Fail** | Yêu cầu áo len nữ trung tính, size M, ≤400.000đ trả các thẻ áo len. Hỏi “mẫu nào rẻ nhất?” và hỏi tiếp màu/size đều trả không tìm thấy; ngữ cảnh kết quả trước không được dùng. |
| G03 | **Fail** | Khi nới màu sang be/nâu và size sang S nếu hết M, bot chỉ nêu màu kem, size S. Không thể hiện lựa chọn màu thay thế như khách cho phép. |
| G04 | **Fail** | Đổi yêu cầu sang áo thun nam đen size M dưới 250.000đ bị trả không tìm thấy; không xử lý ổn định việc thay nhóm sản phẩm và bỏ tiêu chí cũ. |
| G05 | **Fail** | Bot báo áo thun nam Daily giá 219.000đ. Hỏi tiếp giá và tồn kho size M màu đen thì bot nói chưa tìm thấy mẫu, dù tên mẫu vừa được nêu trong lượt trước. |
| G06 | **Pass** | Thẻ sản phẩm hiển thị cấu trúc ảnh, tên, giá và liên kết **Xem sản phẩm** có href. Không click liên kết; URL vẫn là /collections, không mở trang/tab sản phẩm. Việc ảnh tải thành công từ nguồn không được xác minh độc lập. |
| G07 | **Partial** | Với bộ lọc áo thun nam dưới 250.000đ, màu đen, size M, còn hàng, bot nêu 5 thẻ và “còn 2 mẫu phù hợp khác” nhưng không trả con số tổng rõ ràng và không nêu tên 2 mẫu còn lại. Chưa đối chiếu được tổng với snapshot catalog độc lập. |
| G08 | **Partial** | Với SKU giả Quantum Unicorn ZX-999, bot không bịa ra SKU đó và gợi ý các sản phẩm thay thế. Tuy nhiên không nói rõ SKU gốc không tồn tại; kết quả có mẫu nhiều màu/sáng nên chưa chứng minh đáp ứng tiêu chí màu tối. |
| G09 | **Fail** | Bot nhận ra giới hạn dưới 200.000đ và trên 300.000đ mâu thuẫn, rồi hỏi người dùng chọn. Sau khi người dùng sửa thành tối đa 300.000đ, không có kết quả sản phẩm hữu ích (chỉ hiện lời chào tĩnh). |
| G10 | **Fail** | Với “cái đẹp nhất”, bot có hỏi thêm nhu cầu nhưng mở đầu bằng thông báo không tìm thấy. Sau khi nêu áo nữ mặc hằng ngày khoảng 300.000đ, kết quả trộn váy/quần/áo len và có giá vượt mức; hỏi màu đen tiếp theo làm mất ngữ cảnh nữ/ngân sách. |
| G11 | **Partial** | Guest hỏi đơn hàng với email giả lập guest-test@example.invalid: lần đầu bot chỉ lặp lời chào, chưa hướng dẫn rõ đăng nhập. Sau một lượt tư vấn sản phẩm, hỏi đơn tiếp thì bot yêu cầu đăng nhập để xác thực. Không thấy dữ liệu đơn hàng bị lộ. Chỉ xác nhận hành vi UI, không có trace/backend độc lập. |
| G12 | **Pass** | Bot hỏi làm rõ giữa hai nhóm khách và tiêu chí. Khi chọn “nhóm của chồng” và đổi size XL, bot trả thẻ áo thun nam; không còn giữ nhánh áo nữ. Không click link sản phẩm. |

## Giới hạn và bằng chứng

- Chỉ đánh giá phản hồi và thẻ hiển thị trên giao diện production; không có Botpress Inspector/trace hoặc đối chiếu API/catalog độc lập.
- Không mở hoặc click bất kỳ link sản phẩm nào. Trong lúc chạy, trang vẫn ở /collections.
- Nội dung “còn hàng”, size, màu và tổng số được ghi nhận theo phần bot hiển thị; chưa xác minh trực tiếp với dữ liệu kho.
- Giao diện có lúc phát sinh cảnh báo accessibility về DialogContent thiếu tiêu đề/mô tả khi tạo hội thoại mới; chưa xác định liên quan đến các lỗi trả lời.
- G06 chỉ xác nhận link có href và UI không tự điều hướng trong lần test; không kết luận hành vi khi người dùng chủ động click link.

## Ưu tiên xử lý

1. Lưu và cập nhật bộ lọc/ngữ cảnh qua các câu nối như “mẫu đó”, “mẫu nào rẻ nhất”, đổi màu/size và đổi nhóm khách.
2. Trả câu hỏi làm rõ cho truy vấn rộng; sau khi khách làm rõ phải chạy lại tìm kiếm và trả kết quả, không rơi về lời chào tĩnh.
3. Giữ đúng loại sản phẩm, đối tượng và ngân sách; loại kết quả không khớp hoặc nêu rõ khi không có mẫu.
4. Trả số lượng tổng nhất quán với danh sách và nêu đầy đủ mẫu được đếm.
5. Khi SKU không tồn tại, nói rõ và giải thích tiêu chí dùng để chọn sản phẩm thay thế.
6. Với yêu cầu đơn hàng từ guest, ngay lượt đầu hướng dẫn đăng nhập; tiếp tục bảo đảm không trả dữ liệu đơn khi chưa xác thực.
