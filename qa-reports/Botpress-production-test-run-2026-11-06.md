# Báo cáo kiểm thử Botpress production — Guest và Auth

**Ngày chạy:** 06/11/2026 (ICT; thời lượng từng lượt không được bấm giờ)  
**Môi trường:** [Production storefront](https://tiem-mua-cham-store.vercel.app/)  
**Kế hoạch:** [Botpress chat guest/auth test plan](./Botpress-chat-guest-auth-test-plan-2026-11-05.md)  
**Bot:** Friendly Duck / Trợ lý Nai Tiệm Mùa Chậm  
**Trạng thái storefront:** Guest, chưa đăng nhập.  
**Phạm vi chạy:** G01–G12; không chạy luồng Auth do không có phiên/tài khoản QA được xác nhận. Không mở link sản phẩm.

## Tóm tắt

| Trạng thái | Số case |
|---|---:|
| Pass (UI-only) | 1 |
| Partial | 5 |
| Fail | 6 |
| Blocked / Not Run | 0 trong nhóm guest |

Các case guest được nhập tuần tự trong thread đang mở để hạn chế tạo conversation mới. Kế hoạch yêu cầu conversation sạch giữa các case; đây là sai lệch cần lưu ý vì ngữ cảnh cũ có thể ảnh hưởng kết quả. Riêng chuỗi follow-up trong từng case vẫn được chạy liên tục. Kết quả chỉ phản ánh UI production tại thời điểm chạy, chưa có trace Botpress hoặc snapshot catalog/variant/stock độc lập để đối chiếu.

## Kết quả từng case

| ID | Trạng thái | Câu hỏi / bằng chứng production | Nhận xét |
|---|---|---|---|
| G01 | Partial | `Shop có áo nào dễ mặc đi làm không?` → “Shop có 5 mẫu áo phù hợp để đi làm. Hiện mình chưa có tên và giá từng mẫu…” Không thấy danh sách thẻ sản phẩm ở lượt này. | Bot không bịa tên/giá, nhưng không hỏi tiêu chí làm rõ và không cung cấp danh sách để khách so sánh. |
| G02 | **Fail** | `Mình tìm áo len nữ mặc đi làm, màu trung tính như be, kem hoặc nâu, size M, giá tối đa 400 nghìn; ưu tiên loại mềm và còn hàng nhé.` → “Mình chưa tìm thấy mẫu khớp… Bạn cho mình biết thêm loại áo hoặc tên mẫu nhé.” | Khách đã nói rõ áo len nữ, màu, size, giá và còn hàng; phản hồi lại hỏi loại áo. Không xác nhận được chất liệu mềm. |
| G03 | **Fail** | `Nếu không có màu kem thì chuyển sang be hoặc nâu cũng được, miễn dưới 400 nghìn. Size S cũng được nếu không còn M.` → tiếp tục “chưa tìm thấy mẫu khớp” và hỏi lại loại áo/tên mẫu. | Không giữ tiêu chí từ G02 và không áp dụng màu/size dự phòng. |
| G04 | **Fail** | `Thôi tìm áo thun nam màu đen size M dưới 250 nghìn cho chồng mình; bỏ tiêu chí áo len và nữ nhé.` → “Không tìm thấy sản phẩm phù hợp trong dữ liệu cửa hàng.” | Yêu cầu mới không mang lại danh sách; không thể xác nhận bộ lọc nam/đen/M/giá được thực thi đúng. |
| G05 | **Fail** | `Áo thun nam Daily giá bao nhiêu?` → thẻ “Áo thun nam Daily”, 219.000đ. Follow-up `Nếu lấy size M màu đen thì giá có khác không và hiện shop xác nhận còn hàng không?` → “chưa tìm thấy mẫu khớp”, hỏi lại loại áo/tên mẫu. | Trả giá câu đầu đúng theo nội dung UI, nhưng follow-up không giữ mẫu Daily và không trả lời giá variant/tồn kho. |
| G06 | Pass (UI-only) | Các lượt có kết quả hiển thị thẻ tên/giá và nút `Xem sản phẩm` có `href`. URL vẫn là storefront trong suốt lượt chạy; không nhấn link. | Chỉ xác nhận cấu trúc hiển thị và thuộc tính link, không xác minh đích link. |
| G07 | Partial | `Có bao nhiêu áo thun nam dưới 250 nghìn màu đen còn size M? Liệt kê giúp mình các mẫu đó, nhưng đừng tính mẫu hết hàng.` → “Có 0 sản phẩm phù hợp.” Không có danh sách kèm theo. | Count khớp với danh sách rỗng trên UI, nhưng không có snapshot catalog/variant/stock độc lập để xác nhận số 0 là đúng. |
| G08 | Partial | `Mình tìm Quantum Unicorn ZX-999, nếu hết thì cho mẫu gần giống nhất dưới 300 nghìn, màu tối, size M.` → “Không tìm thấy sản phẩm phù hợp trong dữ liệu cửa hàng.” | Không bịa SKU, nhưng cũng không hỏi rõ loại sản phẩm hoặc đưa fallback thay thế dù người dùng đã nêu điều kiện. |
| G09 | **Fail** | `Tìm áo vừa dưới 200 nghìn vừa trên 300 nghìn.` → bot nhận ra mâu thuẫn và hỏi khoảng giá. Trả lời `Ý mình là tối đa 300 nghìn, không cần mức tối thiểu.` → “hiện chưa tìm thấy mẫu áo phù hợp.” | Làm rõ mâu thuẫn đạt; lượt sửa không tiếp tục tìm kiếm. Trong cùng thread, trước đó bot đã trả áo thun nam Daily giá 219.000đ, nên phản hồi không nhất quán; không có snapshot độc lập để kết luận đầy đủ catalog. |
| G10 | **Fail** | `Cho mình cái đẹp nhất.` → hỏi thêm kiểu dáng/màu/tầm giá (đạt bước làm rõ). Sau `Áo nữ mặc hàng ngày, dễ phối, khoảng 300 nghìn; mình chưa chọn màu.` → không tìm thấy. Sau `Có mẫu nào màu đen không?` → vẫn không tìm thấy. | Không giữ và áp dụng các tiêu chí đã được làm rõ qua ba lượt. |
| G11 | Partial | Guest nhập email giả `guest-test@example.invalid` để hỏi đơn gần nhất → bot từ chối dữ liệu đơn và nhắc xác thực/đăng nhập. Hỏi tư vấn áo len nữ → “không tìm thấy”; hỏi đơn lần hai → tiếp tục yêu cầu xác thực. | Không lộ dữ liệu đơn và lần hỏi đơn thứ hai vẫn bị chặn. Lượt tư vấn sản phẩm xen giữa không hoạt động, nên chuỗi guest chưa đạt đầy đủ. |
| G12 | Partial | Hỏi tách nhóm nữ và nhóm chồng → bot hỏi muốn lọc nhóm nào trước. Trả lời chỉ giữ nhóm chồng, đổi size XL → danh sách áo thun nam màu đen size XL, giá 199.000–239.000đ. | Làm rõ nhóm và cập nhật size có vẻ đúng trên UI; không có snapshot độc lập để xác nhận tính đầy đủ/tồn kho. |

## Auth và kiểm tra kỹ thuật

- A01–A12: **Not Run**. Storefront hiển thị trạng thái guest; không có tài khoản/đơn QA được xác nhận cho lượt chạy này. Không đăng nhập, không đoán thông tin xác thực và không dùng dữ liệu đơn thật.
- Không truy cập backend/API, không lấy catalog/stock snapshot, không dùng Botpress trace/Inspector. Các kết quả về variant, số lượng và tồn kho ngoài quan sát UI vì vậy chưa được xác nhận độc lập.
- Không tạo, sửa hoặc hủy đơn; không thay đổi hồ sơ.
- Không nhấn link sản phẩm. Các thẻ có `href` được quan sát trong chat; trang không điều hướng khỏi storefront.
- Trong browser có các log 404 và cảnh báo accessibility của dialog từ những lần tải trước. Chưa có bằng chứng nối chúng với các lỗi chatbot trong lượt chạy này.

## Kết luận

Production chưa đạt bộ guest nâng cao: 6/12 case Fail, nổi bật là truy vấn nhiều điều kiện G02–G04, follow-up giá/tồn kho G05, tìm kiếm sau khi sửa điều kiện G09 và hội thoại làm rõ G10. G01, G07, G08, G11 và G12 chỉ Partial do phản hồi chưa đủ hoặc thiếu dữ liệu/trace độc lập. Chỉ G06 Pass ở mức UI.

Nên ưu tiên sửa và chạy lại trên production các chuỗi G02→G03→G04, G05, G09 và G10 trong một thread mới; sau đó chạy lại G07 với snapshot catalog/variant/stock để xác minh count. A01–A12 cần phiên và fixture QA được phê duyệt trước khi kiểm thử.
