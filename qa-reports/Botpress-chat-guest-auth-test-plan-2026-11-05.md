# Kế hoạch kiểm thử nâng cao hai luồng chat Botpress: Guest và Auth

**Ngày lập:** 05/11/2026  
**Phiên bản:** 2 — hội thoại nhiều lượt, câu hỏi theo ngữ cảnh và đổi tiêu chí  
**Môi trường mục tiêu:** Production storefront — https://tiem-mua-cham-store.vercel.app/  
**Bot:** Friendly Duck / Trợ lý Nai Tiệm Mùa Chậm  
**Tham chiếu:** [Kế hoạch kiểm thử thesis production](./Botpress-thesis-production-run-2026-11-02.md)

## Mục tiêu

Xác nhận chatbot xử lý được cách hỏi tự nhiên như một khách mua hàng thật: gộp nhiều điều kiện trong một câu, nhớ ngữ cảnh qua câu hỏi nối tiếp, cập nhật hoặc bỏ điều kiện khi khách đổi ý, làm rõ yêu cầu mâu thuẫn, và chuyển qua lại giữa tư vấn sản phẩm với tra cứu đơn hàng. Đồng thời xác nhận quyền guest/auth được giữ đúng trong suốt hội thoại và không làm lộ đơn của tài khoản khác.

Đây là kế hoạch chạy kiểm thử, chưa phải báo cáo kết quả. Ghi trạng thái từng case là **Pass**, **Fail**, **Partial**, **Blocked** hoặc **Not Run** kèm bằng chứng và giới hạn quan sát.

## Quy tắc chạy và bảo vệ dữ liệu

- Chỉ dùng tài khoản và đơn QA được chủ dự án chỉ định; không đoán tài khoản, không dùng đơn của khách thật.
- Luồng guest chạy khi storefront hiển thị trạng thái đăng xuất. Luồng auth chạy trong phiên đăng nhập QA đã được xác nhận.
- Mỗi luồng bắt đầu bằng một conversation mới. Các case kiểm tra ngữ cảnh trong cùng luồng phải tiếp tục trên đúng conversation đó.
- Không tạo, sửa, hủy đơn hoặc thay đổi hồ sơ. Không đăng xuất tài khoản dùng chung; case logout chỉ chạy trên tài khoản QA/browser được cô lập.
- Không sao chép token, cookie, email, số điện thoại, conversation ID hoặc dữ liệu nhận diện vào báo cáo. Khi đối chiếu đơn, che/mã hóa ID đơn.
- Không click link sản phẩm. Chỉ xác nhận giao diện có ảnh/tên/giá và thuộc tính `href`; không mở trang sản phẩm, không kiểm tra hành vi điều hướng.
- Ghi câu hỏi nguyên văn, phản hồi bot, trạng thái UI, thời gian phản hồi gần đúng và môi trường. Không coi câu trả lời UI là bằng chứng backend nếu chưa có API/trace độc lập.
- Nếu xuất hiện yêu cầu xác nhận hủy đơn, thông tin cá nhân không dự kiến, lỗi lặp, hoặc tài khoản không đúng QA, dừng case và ghi Blocked/Fail; không xác nhận hành động phá hủy.

## Chuẩn bị

1. Mở production storefront, ghi ngày/giờ ICT và xác nhận đúng domain.
2. Ghi trạng thái đăng nhập mà không lưu thông tin bí mật.
3. Mở chatbot, tạo conversation mới bằng nút Restart Conversation nếu phù hợp; xác nhận lời chào ban đầu.
4. Với auth, xác nhận trước có ít nhất một đơn QA thuộc tài khoản QA. Ghi số đơn hoặc tổng số dòng đã che định danh để dùng đối chiếu.
5. Sau mỗi case, chờ phản hồi hoàn tất; kiểm tra không có phản hồi thứ hai/trễ làm thay đổi kết quả.

## Quy ước chạy case nâng cao

- Chạy đúng thứ tự các lượt trong một case trên cùng conversation; không khởi động lại giữa các lượt trừ khi case yêu cầu. Khởi động conversation mới giữa hai case để tránh nhiễm ngữ cảnh.
- Các tiêu chí như màu, size, giới tính, giá và tồn kho phải được đối chiếu với catalog/variant hiện hành nếu có quyền đọc. Không chấm Pass chỉ vì câu trả lời nghe hợp lý.
- Câu trả lời có thể hỏi lại để làm rõ khi dữ liệu/ý định chưa đủ. Không bắt bot đoán; đánh giá xem câu hỏi làm rõ có nhắm đúng điểm thiếu và có tiếp tục được sau khi khách trả lời hay không.
- Với kết quả sản phẩm, xác minh chỉ số lượng thẻ và thuộc tính hiển thị/`href`; tuyệt đối không click hoặc điều hướng tới link sản phẩm.

## Bộ case Guest nâng cao

Mỗi hàng là một kịch bản liên tục. Ghi phản hồi riêng cho từng lượt, không chỉ kết quả cuối cùng.

| ID | Hội thoại / thao tác theo thứ tự | Kết quả mong đợi theo lượt | Bằng chứng cần ghi |
|---|---|---|---|
| G01 | Mở conversation mới. Hỏi: `Shop có áo nào dễ mặc đi làm không?` | Chào và trả lời theo phạm vi cửa hàng. Nếu “dễ mặc” quá rộng, hỏi một tiêu chí hữu ích (loại áo, ngân sách, màu hoặc size), không nhảy thẳng sang dữ liệu đơn/auth. | Lời chào và câu hỏi làm rõ/đề xuất |
| G02 | 1) `Mình tìm áo len nữ mặc đi làm, màu trung tính như be, kem hoặc nâu, size M, giá tối đa 400 nghìn; ưu tiên loại mềm và còn hàng nhé.` 2) Nếu có kết quả: `Trong mấy mẫu đó mẫu nào rẻ nhất?` 3) `Mẫu đó còn màu kem size M không, hay chỉ còn be/nâu?` | Lượt 1 áp dụng đồng thời loại, đối tượng, màu, size, trần giá và tồn kho; nêu giới hạn nếu chất liệu/variant không có dữ liệu. Lượt 2 chỉ so sánh tập kết quả trước. Lượt 3 giữ đúng sản phẩm và biến thể; nếu không có thông tin tồn kho thì nói rõ, không suy đoán. | Từng phản hồi; tập sản phẩm và giá; bằng chứng catalog/variant nếu có; không click thẻ |
| G03 | Tiếp nối G02: `Nếu không có màu kem thì đổi sang be hoặc nâu cũng được, miễn dưới 400 nghìn. À size S cũng được nếu không còn M.` | Cập nhật màu/size theo phương án dự phòng, giữ các điều kiện còn lại (áo len nữ, đi làm, giá tối đa). Bot phải tìm lại theo tiêu chí đã nới, không tiếp tục khẳng định chỉ size M/màu kem. | Tiêu chí trước/sau; phản hồi; đối chiếu biến thể |
| G04 | Tiếp nối G03: `Thôi tìm áo thun nam màu đen size M dưới 250 nghìn cho chồng mình; bỏ tiêu chí áo len và nữ nhé.` | Nhận ra đây là yêu cầu mới: bỏ loại/đối tượng/tiêu chí cũ, áp dụng áo thun nam, đen, M, dưới 250 nghìn. Không rò hoặc trộn kết quả của G02–G03. | Kết quả và tiêu chí được áp dụng; không click link |
| G05 | Hỏi lần lượt trong cùng conversation: `Áo thun nam Daily giá bao nhiêu?`; sau đó `Nếu lấy size M màu đen thì giá có khác không và hiện shop có xác nhận còn hàng không?` | Nhận diện mẫu cụ thể; phân biệt giá sản phẩm với giá biến thể nếu catalog có. Chỉ xác nhận màu/size/tồn kho khi nguồn dữ liệu hỗ trợ; không suy từ giá chung. | Tên/SKU đã đối chiếu, giá chung và giá biến thể, câu trả lời tồn kho |
| G06 | Với một câu trả lời có sản phẩm: kiểm tra thẻ trong UI, gồm ảnh, tên, giá, nút `Xem sản phẩm` và `href`. | Thẻ hiển thị đúng cấu trúc đã triển khai. Không tự điều hướng, không mở tab/cửa sổ sản phẩm. Chỉ quan sát thuộc tính link và số tab hiện có. | Số thẻ, ảnh/tên/giá, href; xác nhận URL/tab hiện tại không đổi |
| G07 | `Có bao nhiêu áo thun nam dưới 250 nghìn màu đen còn size M? Liệt kê giúp mình các mẫu đó, nhưng đừng tính mẫu hết hàng.` | Nếu dữ liệu đủ, trả số lượng nhất quán với danh sách; mọi mẫu phải thỏa toàn bộ lọc và không tính hàng hết. Nếu không xác nhận được variant/tồn kho, nêu rõ giới hạn thay vì khẳng định số chính xác. | Bộ lọc, số lượng, danh sách, đối chiếu catalog/stock snapshot |
| G08 | `Mình tìm Quantum Unicorn ZX-999, nếu hết thì cho mẫu gần giống nhất dưới 300 nghìn, màu tối, size M.` | Không bịa SKU. Tách được fallback khỏi yêu cầu chính; chỉ đề xuất thay thế thỏa các điều kiện đã nêu và giải thích không tìm thấy mẫu gốc. Nếu “gần giống” thiếu loại sản phẩm thì hỏi lại. | Cách xử lý SKU không tồn tại; dữ liệu từng mẫu thay thế |
| G09 | Hỏi: `Tìm áo vừa dưới 200 nghìn vừa trên 300 nghìn.` Sau khi bot làm rõ, trả lời: `Ý mình là tối đa 300 nghìn, không cần mức tối thiểu.` | Bot phát hiện điều kiện mâu thuẫn và làm rõ. Sau câu sửa, bỏ điều kiện cũ và tìm theo trần 300 nghìn; không lặp lại bộ lọc xung đột. | Câu làm rõ và kết quả sau khi sửa |
| G10 | 1) `Cho mình cái đẹp nhất.` 2) Nếu bot hỏi thêm, trả lời: `Áo nữ mặc hằng ngày, dễ phối, khoảng 300 nghìn; mình chưa chọn màu.` 3) `Có mẫu nào màu đen không?` | Không khẳng định gu thẩm mỹ như sự thật. Lượt 2 dùng các tiêu chí đã cung cấp và có thể hỏi size nếu cần; lượt 3 giữ loại/đối tượng/ngân sách, chỉ thêm màu đen. | Câu làm rõ, tiêu chí qua từng lượt, phản hồi cuối |
| G11 | `Mình muốn xem đơn hàng gần nhất. Đây là email mình từng dùng...` (dùng chuỗi giả QA, không nhập PII thật). Sau phản hồi, hỏi: `Vậy tư vấn áo len nữ màu kem dưới 400 nghìn giúp mình.` Rồi hỏi lại: `Thế đơn mới nhất của mình đang tới đâu?` | Guest không được tra đơn bằng lời khai/email và không được lộ trạng thái/ số lượng đơn. Vẫn tư vấn sản phẩm trong cùng conversation. Yêu cầu xem đơn lần hai tiếp tục được từ chối và hướng dẫn đăng nhập. | Nội dung ba lượt; xác nhận không xuất hiện dữ liệu đơn; không dùng email thật |
| G12 | `Mình đang chọn đồ cho hai người: áo nữ size M dưới 400 nghìn, còn chồng mình cần áo thun nam size L màu đen. Cho mình tách hai nhóm nhé.` Sau đó: `Chỉ giữ nhóm của chồng, đổi size sang XL.` | Hai tập nhu cầu không bị trộn. Lượt sau chỉ cập nhật nhóm nam sang XL và giữ các tiêu chí còn lại; nếu không thể biểu diễn hai nhóm, bot hỏi xác nhận thay vì gộp sai. | Kết quả/tập tiêu chí mỗi nhóm; biến thể được xác nhận |

## Bộ case Auth nâng cao

| ID | Hội thoại / thao tác theo thứ tự | Kết quả mong đợi theo lượt | Bằng chứng cần ghi |
|---|---|---|---|
| A01 | Đăng nhập bằng tài khoản QA đã chỉ định; mở conversation mới. Hỏi: `Bạn có xem được đơn gần đây của mình không?` | Auth được đồng bộ; bot hiểu đây là yêu cầu tra cứu, không yêu cầu khách gửi token/đăng nhập lại khi đã đăng nhập. Không lộ giá trị token hay dữ liệu bí mật. | Trạng thái login, lời hỏi và phản hồi; không chụp vùng chứa bí mật |
| A02 | `Cho mình xem đơn mới nhất: đặt ngày nào, đang ở trạng thái gì, gồm món nào và tổng bao nhiêu?` | Trả đúng đơn mới nhất của QA và các trường được hệ thống hỗ trợ. Nếu thiếu một trường thì nói rõ; không tự dựng ngày, sản phẩm hoặc tổng tiền. | ID đơn che định danh, ngày/trạng thái/mặt hàng/tổng đã đối chiếu nguồn QA |
| A03 | Tiếp nối A02: `Đơn đang đóng gói có phải đơn đó không? Nếu mình có nhiều đơn thì phân biệt giúp theo ngày và trạng thái.` | Không đánh đồng “mới nhất” với “đang đóng gói” nếu có nhiều đơn. Bot liệt kê hoặc hỏi làm rõ dựa trên dữ liệu của chính QA, tránh để đơn cũ ghi đè ngữ cảnh. | Tập đơn QA đã che ID, tiêu chí được dùng, phản hồi |
| A04 | Sau A03: `Còn chiếc áo trong đơn đó giá bao nhiêu? Với lại tư vấn giúp áo len nữ màu trung tính, size M, dưới 400 nghìn.` | Tách được câu hỏi về dòng hàng trong đơn và nhu cầu tư vấn mới. Không lấy sản phẩm trong đơn làm bộ lọc mới nếu khách chưa yêu cầu; thẻ sản phẩm không tự mở tab. | Cả hai phần trả lời; đối chiếu dòng hàng/giá và catalog; href không click |
| A05 | Ngay sau A04: `Quay lại đơn hàng lúc nãy, giờ đơn mới nhất của mình thế nào?` | Điều hướng lại tra đơn trong cùng conversation, dùng auth hiện có, hiểu “đơn lúc nãy/đơn mới nhất” theo câu hỏi. Không yêu cầu chọn `user_choice` không liên quan và không nhầm với kết quả tư vấn. | Phản hồi và trace/node nếu truy cập được; so sánh với QA source |
| A06 | Chạy chuỗi trong **một conversation**: (1) `Đơn gần nhất của mình tới đâu rồi?` (2) `Tư vấn áo thun nam màu đen size M dưới 250 nghìn.` (3) `Cập nhật giúp tình trạng đơn mới nhất.` (4) `Áo thun Daily giá bao nhiêu?` (5) `Còn đơn gần nhất thì sao?` (6) `Tìm áo nữ màu kem khoảng 400 nghìn.` (7) `Cho mình xem lại trạng thái đơn.` (8) `Kiểm tra lại đơn gần nhất lần nữa nhé.` | Có đúng **5 lượt xem đơn** (1, 3, 5, 7, 8), xen kẽ 3 lượt sản phẩm. Cả 5 lượt đơn tra đúng tài khoản; các lượt sản phẩm không xóa auth, không làm bot mắc trong nhánh tư vấn/`user_choice`, không trộn ngữ cảnh, không tạo trả lời kép. | Bảng 8 lượt: câu nguyên văn, phân loại ý định, phản hồi, trạng thái đơn đối chiếu, số phản hồi |
| A07 | Hỏi theo cách rút gọn và đại từ: `Đơn hôm qua đâu rồi?`; nếu có nhiều đơn trong ngày, tiếp: `Ý mình là đơn có áo thun, tổng tiền khoảng ...` (dùng giá trị fixture QA đã biết). | Bot dùng ngày/dòng hàng/tổng làm điều kiện phân biệt nếu dữ liệu hỗ trợ; nếu còn mơ hồ thì hỏi đúng phần cần làm rõ, không trả ngẫu nhiên đơn đầu tiên. | Số đơn cùng ngày trong fixture, câu làm rõ/kết quả, không lộ đơn ngoài QA |
| A08 | 1) Khi vẫn đăng nhập, mở rộng yêu cầu: `Đơn nào đang chờ xử lý?` 2) Tiếp: `Còn đơn đã giao thì sao?` 3) `Không cần hủy hay sửa gì, chỉ muốn biết trạng thái.` | Phân biệt truy vấn trạng thái với hành động thay đổi đơn. Trả tập tương ứng hoặc thông báo không có đơn; không kích hoạt hủy/sửa và không yêu cầu xác nhận hành động không được hỏi. | Kết quả và trạng thái từng câu; xác nhận không có mutation |
| A09 | Giữ conversation QA mở qua thời điểm refresh token/phiên được kiểm soát trong môi trường QA; sau đó hỏi: `Đơn hàng mới nhất của mình có cập nhật gì không?` | Khi storefront vẫn xác thực, bot tiếp tục dùng đúng phiên sau refresh; nếu phiên thực sự hết hạn thì xử lý rõ ràng và không trả dữ liệu cache sai. Không ghi token. Nếu production không cho phép xác định thời điểm refresh, thực hiện ở staging hoặc ghi Blocked/Partial. | Mốc thời gian tương đối, trạng thái login, phản hồi, trace đã che bí mật |
| A10 | Trên tài khoản/browser QA cô lập: logout, rồi trong conversation cũ hỏi `Kiểm tra lại đơn hàng gần nhất giúp mình.` | Sau logout không trả dữ liệu đơn từ cache/context. Hướng dẫn đăng nhập; phiên browser dùng chung không bị tác động. | Trạng thái logout, phản hồi và xác nhận không có dữ liệu đơn |
| A11 | Đăng nhập lại đúng tài khoản QA trong phiên cô lập. Hỏi: `Tiếp tục xem đơn gần nhất lúc nãy giúp mình.` | Auth được đồng bộ lại theo thiết kế: tiếp tục được hoặc yêu cầu mở conversation mới với hướng dẫn rõ. Sau đồng bộ chỉ trả đơn của QA. | Trạng thái sync, phản hồi, đối chiếu nguồn QA |
| A12 | Nếu được cấp QA-B: đăng nhập QA-B, hỏi `Cho tôi xem đơn gần nhất của tài khoản này.` Không gửi ID/token/email của QA-A. | Chỉ trả đơn của QA-B. Không sử dụng cache của conversation/tài khoản trước. Nếu cần xác minh cô lập chéo, dùng fixture/API test được phê duyệt; không dò đơn người thật. | Đối chiếu fixture đã che định danh; nếu thiếu QA-B ghi Blocked |

## Kiểm tra kỹ thuật bổ sung

- **Định tuyến:** dùng Botpress Inspector/Logs hoặc trace production đã che dữ liệu để xác nhận event auth/guest, intent xem đơn, node gọi API và nhánh lỗi. Nếu chỉ thấy UI, đánh Partial.
- **Backend:** khi có tài khoản QA và quyền phù hợp, xác nhận `/api/chat/orders` chỉ trả đơn của phiên hiện tại; guest/thiếu token bị từ chối; token hết hạn không trả dữ liệu. Không lưu bearer/cookie.
- **Ngữ cảnh và sửa tiêu chí:** so sánh truy vấn trước/sau khi khách đổi màu, size, giới tính, loại sản phẩm hoặc ngân sách. Chỉ giữ điều kiện không bị thay; xác nhận điều kiện bị bỏ không còn ảnh hưởng kết quả.
- **Đếm và liệt kê sản phẩm:** với một truy vấn có bộ lọc cố định, so sánh số lượng và danh sách trong cùng snapshot catalog/variant/stock. Không cộng biến thể thành sản phẩm riêng trừ khi UI/domain quy định như vậy. Ghi Partial nếu thiếu snapshot.
- **Chuyển intent auth:** trong một conversation auth, ghi nhận chuỗi intent đơn → sản phẩm → đơn và kiểm tra auth context vẫn gắn đúng người dùng; UI pass một mình không chứng minh backend ownership.
- **Tab/link:** sau mọi case sản phẩm, xác nhận tab hiện tại không đổi và không có trang sản phẩm mới; không click link để tạo bằng chứng.
- **Lỗi/khôi phục:** không gây lỗi 5xx/timeout trên production. Chạy mô phỏng lỗi ở staging; xác nhận bot trả thông báo hữu ích và câu hỏi kế tiếp vẫn hoạt động.

## Mẫu ghi kết quả

| ID | Trạng thái | Conversation mới/tiếp nối | Kết quả quan sát | Đối chiếu độc lập/trace | Thời gian gần đúng | Ghi chú/giới hạn |
|---|---|---|---|---|---|---|
| G01 | Not Run | Mới |  |  |  |  |
| A01 | Not Run | Mới |  |  |  |  |

Với case nhiều lượt, thêm bảng con: `Lượt | Câu hỏi | Phản hồi bot | Tiêu chí/ngữ cảnh được giữ | Pass/Fail/Partial | Bằng chứng`. Không gộp nhiều lượt thành một nhận xét chung.

## Điều kiện hoàn tất

- Tất cả case khả thi đều có trạng thái và bằng chứng; case thiếu tài khoản/trace/fixture được ghi Blocked thay vì suy diễn Pass.
- G11 xác nhận guest không xem được đơn dù đưa ra thông tin nhận diện giả lập, nhưng vẫn dùng tư vấn và tiếp tục bị chặn khi hỏi đơn lần nữa.
- A02–A08 xác nhận auth xem đúng đơn, phân biệt đơn, xử lý câu nối tự nhiên và không nhầm truy vấn trạng thái với thao tác thay đổi đơn.
- A06 hoàn tất 5 lượt xem đơn xen kẽ tư vấn sản phẩm trong cùng conversation.
- Không có đơn ngoài tài khoản QA, token, cookie hoặc PII trong báo cáo.
- Không có link sản phẩm nào được mở; ghi rõ điều này trong báo cáo kết quả.
