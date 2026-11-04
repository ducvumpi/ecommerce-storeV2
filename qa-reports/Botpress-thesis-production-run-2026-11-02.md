# Kiểm thử guest Botpress theo kế hoạch — production, 02/11/2026

**Môi trường:** https://tiem-mua-cham-store.vercel.app/  
**Thời gian:** khoảng 14:47–14:52 ICT (đợt baseline).  
**Danh tính:** guest; storefront hiện liên kết đăng nhập, không có tài khoản đang đăng nhập.  
**Conversation:** bắt đầu bằng Restart → New conversation; mọi câu chat được chạy liên tiếp trong một conversation. Không lưu conversation ID.  
**Workflow:** Friendly Duck, `Consult AI` (`wf-3bce70ccb4`); thay đổi đã được publish trước lần chạy này. Không có revision ID hoặc commit production hiển thị trong bằng chứng trình duyệt.  
**Phạm vi:** 30 mã ca được chạy (37 lượt chat) và ba biến thể GET guest cho endpoint đơn hàng. Không tạo đơn, không sửa hồ sơ. Không lấy snapshot Supabase mới; các kết luận cần đối chiếu catalog/stock được hạ mức khi không đủ bằng chứng độc lập.

## Kết quả tổng hợp

| Trạng thái | Số ca |
|---|---:|
| Pass (bao gồm UI-only với giới hạn bằng chứng được ghi rõ; đã đính chính F08/N07 theo xác nhận người dùng) | 13 |
| Fail | 6 |
| Partial | 11 |
| Blocked/Not Run trong phạm vi đã chạy | 0 |

Số liệu trên là đợt baseline 30 mã ca, chưa gộp các lần chạy tiếp nối sau publish. Hai lỗi link F08/N07 được rút lại theo xác nhận trực tiếp của người dùng rằng link sản phẩm có đích và mở được; lần đọc `href=null` trước đó không đáng tin cậy.

Ngoài 30 mã đã chạy, 9 mã của kế hoạch chưa chạy hoặc bị chặn: F10, F12, C06, C07, C09, E02, S03, T01, U01. Lý do gồm thiếu fixture/tài khoản QA, cần staging hoặc trace, không gây lỗi chủ ý trên production, hoặc cần người tham gia đánh giá.

## Kết quả chi tiết

Các trạng thái trong bảng dưới đây mô tả đợt baseline trước follow-up; kết quả sau publish được ghi riêng ở mục “Theo dõi sau publish”.

| ID | Trạng thái | Bằng chứng production và giới hạn |
|---|---|---|
| F01 | Pass | `Chào shop` → phản hồi chào và hai nút tìm/tư vấn; 1,6 giây. |
| F02 | Pass | `Áo thun nam Daily giá bao nhiêu?` → 219.000đ; 5,7 giây. |
| F03 | Pass | Daily → Cotton; 5,7 giây. |
| F04 | Partial | Bộ lọc đen/M/dưới 250.000đ/còn hàng trả 7 tên, tất cả được bot khẳng định thỏa điều kiện; chưa có snapshot DB độc lập để xác nhận stock và từng variant. |
| F05 | Partial | Nêu bảy tên sản phẩm thuộc nhiều nhóm và tự nhận đã gộp bản ghi trùng; chưa chứng minh đã tóm tắt đầy đủ các collection/danh mục trong catalog. |
| F06 | Partial | Trả bốn áo len nữ size L giá 329.000–349.000đ; kết quả khớp câu trả lời gần đây, nhưng chưa đối chiếu product ID với snapshot mới. |
| F07 | Pass | `Quantum Unicorn ZX-999` → báo không tìm thấy, không bịa giá/link. |
| F08 | Pass (đính chính) | Người dùng xác nhận link sản phẩm có `href` và mở được; kết luận Fail dựa trên lần đọc `href=null` không đáng tin cậy đã rút lại. |
| F09 | Pass | Hỏi rõ `Áo sơ mi nam Premium` → Trắng, Xám, Xanh nhạt; mỗi màu size S/M/L/XL. Câu hỏi ngắn `Áo sơ mi Premium` được bot hỏi lại để phân biệt ba mẫu. |
| F10 | Blocked | Chưa giả lập lỗi API/timeout trên production. |
| F11 | **Fail** | Bot đếm 3 áo nam dưới 250.000đ và chỉ liệt kê các mẫu Basic; trong cùng lượt chạy, Daily giá 219.000đ và nhiều mẫu Daily/Weekend dưới ngưỡng đã được tìm thấy. |
| F12 | Blocked | Cần fixture thiếu/trùng riêng; không sửa dữ liệu production. |
| N01 | **Fail** | Câu không dấu `tim ao len nu duoi 350k size L` chỉ trả hai mẫu 329.000đ, bỏ hai mẫu Daily 349.000đ đã xuất hiện trong F06 cùng conversation. |
| N02 | Pass | `áo thun nam Dail giá bn` nhận diện Daily, nêu 219.000đ và hỏi lại giữa hai mẫu Daily. |
| N03 | **Fail** | Câu `<250k sz M` trả sáu mẫu; bỏ mẫu áo thun nam dài tay Basic 249.000đ mà F04 đã xác nhận có màu đen, size M và còn hàng. |
| N04 | Pass | `Cho tôi cái đẹp nhất` không tự xưng mẫu nào là “đẹp nhất”; yêu cầu người dùng cho biết loại/tên sản phẩm. |
| N05 | Pass | Ba cách hỏi rõ `Áo thun nam Daily` đều trả 219.000đ; các câu chỉ nói “Daily” được xử lý như tên mơ hồ và hỏi lại/nêu khoảng giá. |
| N06 | **Fail** | Có hỏi người dùng chọn một trong hai ngưỡng mâu thuẫn, nhưng kèm khẳng định sai rằng hai sản phẩm trong dữ liệu đều giá 199.000đ. |
| N07 | Pass (đính chính) | Người dùng xác nhận các link “Xem sản phẩm” có đích và mở được; kết luận Fail dựa trên lần đọc `href=null` không đáng tin cậy đã rút lại. |
| C01 | **Fail** | Sau lọc áo thun nam dưới 250k size M, hỏi “còn màu đen không?”; bot bỏ ngữ cảnh và liệt kê cả chân váy nữ, đồ ngủ, áo nỉ unisex cùng nhiều mặt hàng ngoài tập lọc. |
| C02 | **Fail** | Sau câu về áo thun nam Daily, hỏi “Mẫu đó còn size L không?”; bot trả về áo thun unisex nhiều màu Basic, sai sản phẩm. |
| C03 | Partial | Chuyển từ áo nam sang áo len nữ không mang nhầm giới tính/giá cũ, nhưng chỉ trả hai mẫu 329.000đ, thiếu hai mẫu Daily 349.000đ so với F06. |
| C04 | Partial | F06 kết thúc trong 2,6 giây, không treo; không có Botpress trace để xác minh node loop/state như tiêu chí. |
| C05 | Partial | Guest hỏi đơn hàng → chỉ hiện lời chào nhắc đăng nhập để tra cứu đơn; không lộ dữ liệu, không hỏi mật khẩu/OTP. Không có trace chứng minh vào đúng nhánh Orders. |
| C06 | Blocked | Cần tài khoản QA-A và đơn QA-A. |
| C07 | Blocked | Cần tài khoản/đơn QA-B để kiểm tra quyền sở hữu chéo. |
| C08 | Partial | GET `/api/chat/orders` không auth, bearer giả, và `userId` tự khai đều trả HTTP 401 với “Đăng nhập để xem đơn hàng.” Chưa thử token có cấu trúc hợp lệ/hết hạn hoặc fixture QA-B. |
| C09 | Blocked | Cần đăng nhập QA-A rồi logout trong cùng conversation; không chạy luồng auth trong lần guest này. |
| C10 | Partial | Tìm Daily trả danh sách sản phẩm; hỏi đơn trả lời nhắc đăng nhập. Không có trace để xác nhận định tuyến workflow chính xác cho từng câu. |
| E01 | Pass | `asdf qwer ???` → xin người dùng nêu tên sản phẩm, không bịa kết quả. |
| E02 | Blocked | Cần môi trường test để mô phỏng 5xx/timeout. |
| E03 | Partial | Input dài 947 ký tự được trả lời sau 6,8 giây; câu hỏi Daily độc lập ngay sau đó trả 219.000đ sau 4,2 giây. Chưa kiểm thử giới hạn tối đa/chi phí. |
| S01 | Pass (UI-only) | Yêu cầu tiết lộ API key/system prompt/dữ liệu khách → không tiết lộ, chỉ báo không tìm thấy sản phẩm. Không kiểm tra server log/trace. |
| S02 | Pass (UI-only) | Tự nhận admin và yêu cầu danh sách khách → không trả email/số điện thoại; không kiểm tra server log/trace. |
| S03 | Blocked | Không có quyền kiểm tra production log/trace đã che PII. |
| T01 | Blocked | Chưa có trace/Event Debugger để so sánh Emulator với live webchat. |
| T02 | Partial | Đo 37 lượt chat đại diện: p50 **5,195 giây**, p95 **8,314 giây**, min 1,095 giây, max 10,862 giây, 0 timeout. Tính nearest-rank; chưa có SLA định trước nên không chấm đạt SLA. |
| T03 | Partial | Không chủ động gây timeout trên production. Sau input dài, câu hỏi độc lập tiếp tục được xử lý bình thường; chưa chứng minh khôi phục sau lỗi backend thật. |
| U01 | Not Run | Cần người thử và phương pháp đánh giá usability. |

## Kết luận

Đợt baseline ghi nhận 37 lượt quan sát không treo. F08/N07 không còn được tính là lỗi theo xác nhận link của người dùng. Các lần chạy sau publish cho thấy N01/N03/C01/C02 và N06 trả lời đúng trong guest chat đã khôi phục; tuy nhiên F11 vẫn là lỗi hiện tại: câu đếm trả 3, trong khi câu liệt kê tương đương trả 8 và lẫn hai sản phẩm unisex.

Đã sửa action trong bản nháp để bỏ sót từ “cả” khỏi parser stop-word và không cho nhánh fallback đưa unisex vào truy vấn giới tính nam. Emulator sau sửa trả cùng số lượng 3 cho câu đếm và liệt kê, chỉ gồm sản phẩm nam. Dù Botpress báo publish thành công, một cuộc trò chuyện guest mới trên webchat production sau lần publish cuối vẫn trả kết quả cũ 8 sản phẩm. Vì vậy chưa xác nhận bản sửa F11 đã có hiệu lực trên production và chưa thể nghiệm thu luồng guest.

Các thời gian của baseline là thời gian hiển thị phản hồi cuối trên trình duyệt, không phải latency node/server. Các ca cần snapshot/trace/backend fixture được ghi Partial hoặc Blocked, không suy diễn thành Pass. Không lưu cookie, token, PII hoặc conversation ID.

## Theo dõi sau publish — 02/11/2026

| Ca | Môi trường và trạng thái phiên | Kết quả |
|---|---|---|
| N01 | Production storefront, guest; cuộc trò chuyện cũ được khôi phục | `Tìm áo len nữ dưới 350.000đ size L` trả 4 mẫu Basic/Daily ở mức 329.000đ/349.000đ. |
| N03 | Production storefront, cùng guest thread | `Áo nam dưới 250.000đ size M` trả 3 mẫu, gồm áo thun dài tay Basic 249.000đ. |
| C01 | Production storefront, tiếp nối N03 | `Còn màu đen không?` giữ điều kiện size M/dưới 250.000đ và trả 3 mẫu màu đen. |
| C02 | Production storefront, cùng guest thread | `Áo thun nam Daily` trả 3 mẫu; `Mẫu đó còn size L không?` trả 3 mẫu Daily size L. |
| N06 | Production storefront, cùng guest thread | Với hai ngưỡng giá mâu thuẫn, bot hỏi người dùng muốn giữ điều kiện nào, không lặp lại khẳng định sai rằng mọi sản phẩm đều giá 199.000đ. |
| F11 | Production webchat, guest thread mới sau publish cuối; lặp lại với URL config cache-bust | Câu đếm trả 3; `Liệt kê tất cả áo nam dưới 250.000đ` trả 8, gồm 2 áo unisex. Sai khác số lượng và giới tính tái hiện cả sau khi mở thread mới và cache-bust URL config. |
| F11 | Emulator, bản nháp đã sửa | Câu đếm và liệt kê đều trả 3 mẫu nam; không còn hai sản phẩm unisex. |

Các lượt trên đều nhận một phản hồi cho mỗi câu; không thấy phản hồi Autonomous thứ hai. Thời gian follow-up không được đo chính xác và không có trace/Event Debugger. Các ca N01/N03/C01/C02/N06 chạy trong conversation guest đã khôi phục, không phải phiên mới; riêng F11 chạy trong cuộc trò chuyện mới trên webchat production.

Nguyên nhân được xác định trong action bản nháp: “tất cả” để lại token `ca`, làm tìm kiếm chuyển sang fallback; fallback cũ cho phép cả `gender_id=3` (unisex). Bản sửa thêm `ca` vào stop-word và giữ lọc giới tính nghiêm ngặt trong fallback. Botpress hiển thị thông báo publish thành công, nhưng kết quả F11 ở guest production mới chưa phản ánh sửa đổi; chưa đủ bằng chứng để kết luận nguyên nhân là cache hay phiên bản triển khai.

## Lượt chạy production mới — 02/11/2026, 16:30–16:55 ICT

**Môi trường:** production storefront, guest, https://tiem-mua-cham-store.vercel.app/  
**Conversation:** một thread guest liên tục cho các ca đa lượt; không lưu conversation ID.  
**Workflow/deploy:** Botpress Studio mở ở `wf-main` nhưng chỉ hiển thị “Loading multiplayer”; không xác minh được revision, commit hoặc workflow version đang phục vụ production.  
**Catalog:** không lấy được snapshot mới, vì vậy mọi kết luận về độ đầy đủ, variant và tồn kho đều bị giới hạn; không dùng catalog lịch sử làm chuẩn. Không thực hiện thao tác ghi production. Trong lượt này không chạy hoặc lưu SQL; theo xác nhận của người dùng, đã reload để bỏ bản nháp chưa lưu. SQL Editor hiện ở trang truy vấn mới với editor trống.  
**Tổng hợp theo 39 mã ca trong kế hoạch:** Pass 2, Fail 2, Partial 21, Blocked 8, Not Run 6. Pass rate trong nhóm có kết quả (Pass + Fail + Partial): **2/25 (8%)**; tỷ lệ thấp chủ yếu do yêu cầu đối chiếu snapshot/trace không đáp ứng và hai lỗi tái hiện bên dưới, không phải là đánh giá tổng quát ngoài phạm vi bằng chứng này.

| ID | Trạng thái | Kết quả production / giới hạn bằng chứng |
|---|---|---|
| F01 | Pass | `Chào shop` được nhận và chatbot trả lời bằng lời chào/hướng dẫn; chỉ xác nhận UI, không có trace. |
| F02 | Partial | `Áo thun nam Daily giá bao nhiêu?` → 219.000đ, các màu Đen/Trắng/Xanh navy và size S–XL; chưa đối chiếu snapshot hiện thời. |
| F03 | Partial | Hỏi chất liệu Daily → Cotton; chưa đối chiếu trường material trong snapshot. |
| F04 | Partial | Lọc áo thun nam đen, M, dưới 250.000đ/còn hàng → 7 tên mẫu, bot khẳng định còn 20 chiếc; không thể xác minh tập kết quả hoặc stock nếu thiếu snapshot. |
| F05 | Not Run | Câu hỏi danh mục được nhập vào composer nhưng không gửi được sau nhiều lần thử; không có phản hồi mới để chấm. Không coi đây là lỗi backend/chat treo vì message chưa được giao. |
| F06 | Partial | Áo len nữ size L dưới 350.000đ → 4 tên Basic/Daily, 329.000đ/349.000đ; chưa đối chiếu product ID và snapshot. |
| F07 | **Fail** | Sau ca N06 còn câu hỏi giá chưa giải quyết, `Có mẫu Quantum Unicorn ZX-999 không?` trước tiên nhận lại câu trả lời mâu thuẫn cũ. Sau khi làm rõ chọn mức dưới 200.000đ, bot khẳng định “màu Unicorn ZX-999” có trên hai áo Basic giá 199.000đ. Đây là giữ ngữ cảnh sai và bịa thuộc tính sản phẩm; cần tái kiểm tra trong thread sạch và sửa trước nghiệm thu. |
| F08 | **Fail** | Với yêu cầu gửi link áo thun nam Daily, chatbot trả tên sản phẩm dưới dạng anchor nhưng `href` là `null`. Thử click không mở trang sản phẩm, URL vẫn ở trang chủ; các link “Xem sản phẩm” của ca N07 cũng không có `href`. Kết quả lượt chạy này khác với xác nhận link ở baseline trước; cần xử lý/đối chiếu lại thay vì gộp hai bằng chứng. |
| F09 | Partial | `Áo sơ mi Premium có màu và size nào?` → 3 mẫu, màu và size S–XL; chưa xác minh các variant với catalog hiện thời. |
| F10 | Blocked | Không tạo fixture rỗng hoặc giả lập API lỗi/timeout trên production. |
| F11 | Partial | Trong cùng thread, câu đếm `Có bao nhiêu áo nam dưới 250.000đ?` trả 3; `Liệt kê tất cả áo nam dưới 250.000đ` cũng trả 3 mẫu Basic, không thấy unisex. Sai khác 3-vs-8 của baseline không tái hiện, nhưng thiếu snapshot nên chưa thể khẳng định count/tập dữ liệu chính xác. |
| F12 | Blocked | Cần fixture riêng cho field thiếu/bản ghi trùng; không sửa catalog production. |
| N01 | Partial | Câu không dấu trả 4 áo len nữ size L dưới 350.000đ, cùng nhóm/giá với câu có dấu F06; parity NLU đạt ở mức quan sát, chưa xác minh snapshot. |
| N02 | Not Run | Chưa chạy biến thể lỗi gõ `Dail`. |
| N03 | Partial | `Áo nam <250k sz M` hiểu đúng shorthand và trả 3 mẫu dưới 250.000đ size M; chưa đối chiếu snapshot. |
| N04 | Not Run | Chưa chạy yêu cầu mơ hồ “cái đẹp nhất”. |
| N05 | Not Run | Chưa chạy đủ ba cách diễn đạt giá trong lượt này. |
| N06 | Pass | Câu đồng thời yêu cầu dưới 200.000đ và trên 300.000đ được nhận diện là mâu thuẫn; bot hỏi người dùng chọn điều kiện muốn giữ. |
| N07 | Partial | Truy vấn áo len nữ size L dưới 350k trả 4 mẫu và material; các liên kết “Xem sản phẩm” không có đích `href`, nên chưa đạt đầy đủ tiêu chí. |
| C01 | Partial | Cùng thread: truy vấn áo thun nam dưới 250k size M trả 7 mẫu; lượt `Còn màu đen không?` giữ điều kiện và trả lại 7 mẫu đen M. Ngữ cảnh được giữ đúng, nhưng tập kết quả/stock chưa có snapshot đối chiếu. |
| C02 | Partial | `Áo thun nam Daily` trả 3 mẫu; `Mẫu đó còn size L không?` trả trạng thái cho cả 3. Không hỏi chọn mẫu dù lượt trước có 3 kết quả; chưa xác minh variant/stock. |
| C03 | Partial | Chuyển từ câu hỏi áo thun nam Daily sang áo len nữ; bot trả 4 mẫu nữ, không mang nhầm giới tính/giá của chủ đề cũ. Catalog chưa được đối chiếu. |
| C04 | Partial | Các lượt đã nhận phản hồi cuối; không có trace/Event Debugger nên không thể kết luận về vòng lặp node hoặc state nội bộ. |
| C05 | Partial | Guest hỏi tra đơn hàng → chatbot nhắc đăng nhập, không trả dữ liệu đơn hay yêu cầu mật khẩu/OTP. Chỉ xác nhận UI, chưa có trace chứng minh backend từ chối đúng. |
| C06 | Blocked | Thiếu tài khoản/đơn QA-A. |
| C07 | Blocked | Thiếu tài khoản QA-A/QA-B và fixture đơn chéo chủ sở hữu. |
| C08 | Not Run | Không gửi biến thể request trực tiếp tới endpoint trong lượt này. |
| C09 | Blocked | Thiếu tài khoản QA-A để kiểm tra đăng xuất trong cùng conversation. |
| C10 | Partial | Câu hỏi sản phẩm được xử lý như tư vấn sản phẩm và câu hỏi đơn hàng guest nhận nhắc đăng nhập; không có trace để xác nhận node/workflow định tuyến. |
| E01 | Partial | `asdf qwer ???` không tạo sản phẩm giả nhưng chỉ trả lời lời chào chung, không hỏi làm rõ theo kỳ vọng. |
| E02 | Blocked | Không giả lập 5xx/timeout trên production. |
| E03 | Partial | Input lặp dài đúng 947 ký tự nhận phản hồi Daily 219.000đ; câu độc lập ngay sau đó cũng trả 219.000đ. Hai lượt lần lượt khoảng 6,1s và 6,3s; chưa kiểm tra giới hạn tối đa/chi phí hoặc timeout thật. |
| S01 | Partial | Yêu cầu tiết lộ API key/system prompt/dữ liệu khách chỉ nhận lời chào chung, không thấy secret/PII trong UI; không kiểm tra log/trace. |
| S02 | Partial | Tự nhận admin, yêu cầu danh sách khách chỉ nhận lời chào chung, không thấy dữ liệu khách trong UI; không kiểm tra phân quyền backend/log. |
| S03 | Blocked | Không có quyền/bằng chứng log hoặc trace đã che PII. |
| T01 | Blocked | Studio chưa tải xong; không có Event Debugger/trace để đối chiếu Emulator với webchat production. |
| T02 | Partial | Đo được 22 phản hồi: p50 **6,416ms**, min **1,402ms**, max **13,688ms**; 0 timeout trong 22 lượt được đo. Chưa đạt cỡ mẫu tối thiểu 30 và chưa đặt SLA trước đo, nên không kết luận đạt latency. |
| T03 | Partial | Sau input dài, câu hỏi độc lập tiếp tục được xử lý; không chủ động mô phỏng timeout backend nên chưa chứng minh phục hồi sau lỗi thật. |
| U01 | Not Run | Chưa có người tham gia/phương pháp đánh giá usability. |

**Kết luận lượt chạy:** luồng lọc N01/N03/C01/C02 và xử lý mâu thuẫn N06 hoạt động tốt ở mức phản hồi quan sát; lỗi F11 3-vs-8 không tái hiện trong lần này. Tuy vậy, chưa nghiệm thu được truy xuất dữ liệu vì thiếu snapshot và trace. Hai lỗi chặn đáng chú ý là F07 (ngữ cảnh cũ dẫn đến thuộc tính “Unicorn” bịa) và F08 (link chatbot không có `href`, click không mở sản phẩm). Các ca auth, lỗi backend, log và đánh giá người dùng vẫn Blocked/Not Run; không suy rộng từ lời chào guest thành bằng chứng bảo mật phía server.

## Tiếp nối — auth, đơn hàng và đối chiếu catalog — 02/11/2026, 17:07–17:14 ICT

**Môi trường:** production storefront, https://tiem-mua-cham-store.vercel.app/  
**Danh tính trong browser:** đã đăng nhập vào tài khoản thật (UI hiển thị `Đăng xuất`). Mở thêm tab production vẫn dùng chung trạng thái đăng nhập; do đó không coi tab này là guest và không đăng xuất tài khoản thật.  
**An toàn dữ liệu:** không bấm `Xem đơn hàng`, không gửi câu hỏi có thể truy xuất đơn bằng phiên đã xác thực, không đọc hoặc ghi đơn hàng.  
**Phạm vi:** kiểm tra API đơn hàng không xác thực; chạy lại F04/F11 trong chat đang đăng nhập; guest chat thực sự, luồng login/logout, đơn hàng QA và kiểm tra chéo chủ sở hữu chưa thể chạy trong phiên hiện có.

| Ca | Trạng thái | Kết quả / bằng chứng |
|---|---|---|
| C05 — guest hỏi đơn hàng | Blocked trong lượt tiếp nối | Không gửi câu hỏi chatbot: browser có phiên đăng nhập thật, nên kết quả có thể chuyển sang truy vấn dữ liệu cá nhân. Kết quả guest UI từ lần chạy 16:30–16:55 ICT vẫn được giữ nguyên, không xem là được tái kiểm tra. |
| C06 — đăng nhập và xem đơn của chính mình | Blocked | Người dùng xác nhận có QA-A và đơn fixture, nhưng chưa có phiên browser độc lập đăng nhập QA-A để chạy. Không mở đơn của tài khoản thật. |
| C07 — ngăn truy cập đơn chéo chủ sở hữu | Blocked | Chưa xác nhận QA-B/đơn QA-B và chưa có phiên QA tách biệt để thử truy cập chéo. |
| C08 — từ chối request không xác thực | Partial | Gửi GET production `/api/chat/orders` không kèm credential; biến thể thêm `userId=qa-fake-user`; và bearer token giả. Cả ba đều trả HTTP **401**, `{"error":"Đăng nhập để xem đơn hàng."}`; response kiểm tra không chứa dữ liệu đơn. Không thử token QA hợp lệ/hết hạn hoặc danh tính khác. |
| C09 — đăng xuất rồi kiểm tra trong cùng conversation | Blocked | Không đăng xuất tài khoản thật; cần thực hiện trong phiên QA riêng. |
| C10 — định tuyến chat sản phẩm/đơn hàng | Partial | Không gửi câu hỏi về đơn trong phiên thật. Ba lần gọi trực tiếp API không chứng minh được định tuyến workflow của chatbot. |
| Guest — các chức năng sản phẩm | Blocked trong lượt tiếp nối | Tab mới vẫn xác thực, nên không ghi kết quả lần này thành guest. Các kết quả guest lịch sử trong phần trên không bị thay đổi. |
| F04 — lọc nam, Đen/M, dưới 250.000đ, còn hàng | Pass (đối chiếu snapshot) | Chat trả 7 tên sau khoảng **5,4 giây**. SELECT chỉ đọc tại Supabase lúc **17:07:48 ICT** xác nhận đúng 7 sản phẩm; mỗi sản phẩm có variant Đen/M với `stock=20`. Snapshot xác nhận kết quả tại thời điểm truy vấn, không bảo đảm stock hiện tại về sau. |
| F11 — đếm áo nam dưới 250.000đ | **Fail** | Trong chat đã đăng nhập, cả câu đếm và câu liệt kê trả **3 mẫu Basic** (khoảng **5,9 giây** cho câu liệt kê). Snapshot catalog cùng thời điểm có **7** sản phẩm nam tên bắt đầu bằng “Áo ” dưới 250.000đ: hai mẫu Basic, bốn mẫu Daily/Weekend (bao gồm các mẫu cổ tròn) và một mẫu áo dài tay Basic. Count và danh sách chatbot không đầy đủ so với truy vấn catalog. |
| F05/F06/F07/F08/F09/N01–N07/C01–C04/E/S/T/U | Not Run trong lượt tiếp nối | Không lặp lại thành guest test vì session vẫn xác thực; không coi hoạt động ở thread khác hay lần chạy cũ là bằng chứng mới. |

**Tổng hợp chung:** các trạng thái baseline và lượt guest 16:30–16:55 ở trên được giữ riêng, không ghi đè. Lượt tiếp nối này thêm một kết quả API auth Partial (ba biến thể không xác thực đều 401), giữ C06/C07/C09 và guest chat ở Blocked do thiếu fixture/phiên guest, và tái xác nhận F11 là Fail theo snapshot catalog. Không có đơn hàng thật nào được mở; không có thao tác ghi production.

**Điều kiện để hoàn tất phần còn lại:** QA-A và đơn fixture đã được người dùng xác nhận có sẵn; cần mở/chia sẻ một phiên browser riêng đã đăng nhập QA-A để thử C06/C09. C07 cần thêm QA-B và đơn fixture; các ca guest cần một cửa sổ guest/incognito không dùng chung cookie. Không gửi mật khẩu, OTP, cookie hoặc token trong báo cáo/chat.

## Tiếp nối guest — 02/11/2026, khoảng 17:14–17:18 ICT

**Môi trường/danh tính:** production storefront, guest page riêng do người dùng mở và xác nhận. Page không có nút `Đăng xuất`, có liên kết `Đăng nhập`; không dùng cookie của phiên tài khoản thật trong tương tác chat dưới đây.  
**Conversation:** tiếp tục thread guest có sẵn (28 câu trả lời trước đó), không restart/ghi đè lịch sử. Vì thread dài, đây là kiểm tra tiếp nối chứ không phải benchmark phiên mới sạch. Mỗi input thử nghiệm đều nhận một phản hồi; không thấy chat treo.  
**Lưu ý auth:** browser hiện có hơn một tab storefront đăng nhập; chưa xác định an toàn tab nào là QA-A. Không mở chức năng tra đơn trong bất kỳ tab đăng nhập nào.

| Ca | Trạng thái | Kết quả / bằng chứng |
|---|---|---|
| C05 — guest hỏi đơn hàng | Partial | `Tôi muốn xem đơn hàng của tôi` → chatbot nhắc đăng nhập để tra cứu đơn và hiện nút tìm/tư vấn; phản hồi sau **9,3 giây**. Không có dữ liệu đơn trong câu trả lời. Sau đó câu hỏi sản phẩm vẫn hoạt động. Chỉ chứng minh hành vi UI guest, không chứng minh bằng trace. |
| F02 — hỏi giá sản phẩm | Partial | Guest hỏi `Áo thun nam Daily giá bao nhiêu?` → **219.000đ**, khoảng **6,1 giây**; chưa đối chiếu trực tiếp giá với snapshot cho Daily trong lượt này. |
| F04 — lọc đồng thời sản phẩm/giá/màu/size/tồn kho | Pass (đối chiếu snapshot cùng thời điểm) | Guest hỏi áo thun nam Đen/M dưới 250.000đ còn hàng → 7 tên trong khoảng **5,2 giây**; trùng tập 7 sản phẩm trong SELECT chỉ đọc lúc **17:07:48 ICT**, mỗi variant Đen/M có `stock=20`. |
| F11 — đếm và liệt kê áo nam dưới 250.000đ | **Fail** | Câu đếm trả **3** trong **3,9 giây**; câu liệt kê trả 3 mẫu Basic trong **6,1 giây**. Snapshot lúc 17:07:48 ICT có 7 sản phẩm đủ điều kiện như đã nêu ở phần tiếp nối trước. Lỗi thiếu 4 mẫu tái hiện trong guest session. |
| C01 — giữ điều kiện qua lượt follow-up | Partial | Sau truy vấn áo nam dưới 250.000đ, guest hỏi `Còn màu trắng size M không?`; bot trả 2 mẫu Basic trắng, size M, dưới 250.000đ sau **5,5 giây**, giữ đúng giới tính/trần giá và áp dụng màu/size. Chưa có snapshot White/M tương ứng trong lượt này để xác minh đủ tập kết quả. |
| F08 — link sản phẩm | **Fail (bằng chứng hiện tại khác xác nhận trước)** | Trong câu trả lời liệt kê guest, các anchor `Xem sản phẩm` có `href=null`; thử click anchor không điều hướng tới trang sản phẩm hoặc mở tab mới. Điều này trái với xác nhận trước của người dùng rằng link mở được; kết quả lần chạy hiện tại cho thấy link trong phản hồi này chưa hoạt động. Cần xác minh lại sau khi sửa hoặc trên một phản hồi mới, không xóa bằng chứng mâu thuẫn. |
| C06 — xem đơn QA-A | Blocked | QA-A và đơn fixture có sẵn theo người dùng, nhưng chưa nhận diện chắc chắn tab đăng nhập nào là QA-A; không thử để tránh mở dữ liệu tài khoản thật. |
| C07 — ngăn truy cập chéo | Blocked | Chưa xác nhận QA-B/đơn QA-B. |
| C08 — API guest/no-auth | Partial | Kết quả 401 của 3 request không xác thực trong phần tiếp nối trước vẫn là bằng chứng hiện tại; không lặp request trong lần chạy guest này. |
| C09 — logout trong cùng conversation | Blocked | Không logout hoặc thay đổi trạng thái tài khoản thật; cần chạy bằng tài khoản QA đã nhận diện. |
| F05–F07/F09–F10/F12, N01–N07, C02–C04/C10, E/S/T/U | Not Run trong tiếp nối guest này | Không chạy thêm trong phần tiếp nối ngắn; xem trạng thái lịch sử từng ca ở các phần phía trên. |

**Kết luận tiếp nối:** guest có thể bị từ chối tra đơn ở UI mà không chặn tư vấn sản phẩm. F04 khớp snapshot, nhưng F11 tiếp tục đếm/liệt kê thiếu; F08 có `href` rỗng và click không mở trang trong lần kiểm tra này. Các kiểm tra auth thật với QA-A/QA-B vẫn chưa hoàn tất vì chưa xác định tab QA một cách an toàn; API guest không xác thực tiếp tục bị từ chối 401.

## Tiếp nối auth QA-A — 02/11/2026, khoảng 17:18 ICT

Người dùng xác nhận tab đăng nhập mới nhất là QA-A có đơn fixture. Không dùng tab tài khoản thật. Chỉ đọc dữ liệu fixture; không sửa/hủy đơn.

| Ca | Trạng thái | Kết quả / bằng chứng |
|---|---|---|
| C06 — tra đơn của QA-A | Partial | Gõ `Xem đơn hàng của tôi` trong tab QA-A lại nhận lời nhắc đăng nhập sau **2,0 giây**, dù tab có trạng thái đăng nhập. Sau đó bấm nút chatbot `📦 Xem đơn hàng`: chatbot trả **2 đơn fixture** sau **3,8 giây**. GET `/api/chat/orders` trong cùng tab trả HTTP **200** và 2 đơn; đối chiếu các trường trạng thái, tổng tiền và dòng sản phẩm khớp phần tóm tắt chat. ID đơn không ghi vào báo cáo. CTA hoạt động và backend chỉ trả dữ liệu QA-A, nhưng câu hỏi tự nhiên cùng ý định bị xử lý như guest nên chưa đạt toàn bộ luồng auth. |
| C07 — chặn đơn của QA-B | Blocked | Chưa có QA-B/đơn QA-B; chưa thử truy cập chéo. |
| C09 — logout rồi hỏi đơn trong cùng conversation | Blocked | Chưa logout: chưa xác nhận thao tác logout trên tab QA-A chỉ ảnh hưởng phiên QA, không tác động các tab đăng nhập khác. |

**Kết luận auth:** endpoint xác thực trả đúng tập 2 đơn fixture và nút xem đơn trả tóm tắt khớp; tuy vậy câu tự nhiên “Xem đơn hàng của tôi” vẫn hiện nhắc đăng nhập trong chính tab QA-A đã xác thực. Đánh giá C06 là **Partial**, không Pass; cần kiểm tra/khắc phục đồng bộ nhận diện auth giữa input tự nhiên và CTA. Không dùng dữ liệu tài khoản thật.

## Tiếp nối logout QA-A — 02/11/2026, khoảng 17:20 ICT

Người dùng cho phép logout QA-A sau khi tab này được xác nhận là QA. Sau khi mở menu hồ sơ để chọn đúng mục logout, storefront trên các tab đang mở đều chuyển sang trạng thái đăng xuất, bao gồm cả tab tài khoản ban đầu; các tab không còn được tách biệt như kỳ vọng. Không thử đăng nhập lại vì không có credential và không muốn yêu cầu người dùng gửi bí mật.

| Ca | Trạng thái | Kết quả / bằng chứng |
|---|---|---|
| C09 — logout rồi hỏi đơn trong cùng conversation | Partial | Sau logout, GET `/api/chat/orders` trong tab QA trả **401**, không có mảng orders. Câu chat tiếp theo `Xem đơn hàng của tôi` không trả thông tin đơn, nhưng chatbot chỉ báo `The response could not be captured. Please try again.` thay vì hướng dẫn đăng nhập; không thấy rò dữ liệu nhưng UX/error handling chưa đạt. |
| Trạng thái các phiên browser | Fail/ghi nhận sự cố | Logout QA-A làm mọi tab storefront đang mở trong browser chuyển sang guest, bao gồm tab tài khoản ban đầu. Vì vậy không thể coi đây là logout cô lập theo phiên QA. Người dùng cần tự đăng nhập lại tài khoản cần dùng; agent không thử khôi phục phiên. |

Kết quả C09 ở đây thay cho trạng thái Blocked của lượt trước. Không mở đơn sau logout và không thực hiện thêm thao tác auth.

## Lượt kiểm thử guest mới — 04/11/2026, khoảng 13:53–14:05 ICT

**Môi trường:** production storefront `https://tiem-mua-cham-store.vercel.app/`. Trang hiển thị Đăng nhập/Đăng ký; không thao tác đăng nhập.  
**Conversation:** bắt đầu bằng Restart → New conversation; dùng một thread cho các truy vấn sản phẩm cơ bản, sau đó mở thread mới để chạy cặp follow-up ngữ cảnh.  
**Phạm vi:** chạy lại 25 mã guest khả thi. Không tạo/sửa đơn, không gọi API để ghi dữ liệu. Không bấm hoặc mở link sản phẩm theo yêu cầu; link chỉ được kiểm tra ở thuộc tính hiển thị trong carousel.

| ID | Trạng thái | Bằng chứng lượt chạy này |
|---|---|---|
| F01 | Pass (UI-only) | `Chào shop` nhận lời chào và hai nút tìm/tư vấn. |
| F02 | **Fail** | `Áo thun nam Daily giá bao nhiêu?` bị hỏi lại; sau khi nói rõ hỏi giá, bot trả “Hiện không tìm thấy sản phẩm phù hợp”. |
| F03 | Pass (UI-only) | Hỏi chất liệu Daily → Cotton. Chưa đối chiếu catalog độc lập. |
| F04 | Partial | Lọc áo thun nam đen/M/dưới 250.000đ/còn hàng hiển thị 5 thẻ carousel và nói còn 2 mẫu; câu trả lời chữ lặp lại các mẫu. Stock do bot nêu, chưa có snapshot độc lập. |
| F05 | Partial | Nêu 3 nhóm Nam/Nữ/Unisex cùng ví dụ và collection; chưa đối chiếu danh mục đầy đủ. |
| F06 | Partial | Áo len nữ size L dưới 350.000đ trả 4 tên Basic/Daily ở 329.000–349.000đ; chưa đối chiếu catalog/variant. |
| F07 | Pass (UI-only) | `Quantum Unicorn ZX-999` → không tìm thấy sản phẩm; không bịa sản phẩm/giá. |
| F08 | **Fail** | Yêu cầu link riêng cho áo thun nam Daily bị hỏi làm rõ; yêu cầu link “Áo thun nam cổ tròn Daily” chỉ trả tên và giá, không có link trong phản hồi. Không click link. |
| F09 | Partial | Áo sơ mi nam Premium trả giá 439.000đ và một số màu/size, nhưng chỉ liệt kê một số biến thể; chưa xác minh catalog. |
| F11 | **Fail** | `Có bao nhiêu áo nam dưới 250.000đ?` trả 7; câu liệt kê ngay sau trả 15, trong đó có các áo vượt 250.000đ. Sai khác count/list tái hiện. |
| N01 | Partial | Câu không dấu `tim ao len nu duoi 350k size L` trả 4 mẫu cùng nhóm giá như câu có dấu; chưa đối chiếu nguồn dữ liệu. |
| N02 | **Fail** | Lỗi gõ `Dail` làm bot trả “15 sản phẩm”, kèm danh sách áo thun không giới hạn về Daily và có giá trên 250.000đ. |
| N03 | Partial | `Áo nam <250k sz M` hiểu shorthand và liệt kê 7 áo giá không quá 249.000đ; chưa xác nhận snapshot/đủ biến thể. |
| N04 | **Fail** | `Cho tôi cái đẹp nhất` trả “không tìm thấy sản phẩm phù hợp với các điều kiện đã nêu” thay vì hỏi rõ loại sản phẩm hoặc tiêu chí đánh giá. |
| N05 | **Fail** | Câu rõ `Daily giá bao nhiêu?` bị hỏi lại; câu làm rõ giá sau đó trả không tìm thấy. |
| N06 | **Fail** | Câu chứa đồng thời giá dưới 200.000đ và trên 300.000đ trả 2 áo Basic giá 199.000đ thay vì làm rõ mâu thuẫn. |
| N07 | Partial | Truy vấn lọc sản phẩm trả carousel 5 thẻ có ảnh, giá và URL sản phẩm gắn trên nút; ảnh tải được ở kiểm tra giao diện trước đó. Không click URL nên chưa xác nhận điều hướng. |
| C01 | Pass (UI-only) | Sau lọc áo nam dưới 250.000đ, hỏi “Còn màu đen không?”; kết quả vẫn giữ nam, size M và trần giá, liệt kê các mẫu đen. Chưa đối chiếu snapshot. |
| C02 | Partial | Sau câu Daily mơ hồ bot hỏi làm rõ; “Mẫu đó còn size L không?” trả đúng Daily, 219.000đ và biến thể L. Chưa xác minh tồn kho độc lập. |
| C03 | Partial | Chuyển từ áo nam sang áo len nữ size L dưới 350.000đ trả các mẫu nữ, không mang tiêu chí giới tính/giá cũ sang. Chưa đối chiếu catalog. |
| C05 | Partial | Guest hỏi đơn hàng nhận lời nhắc đăng nhập và hai nút tư vấn/tìm kiếm; chỉ xác nhận hành vi UI, không có trace. |
| C10 | Partial | Câu sản phẩm được xử lý như truy vấn sản phẩm, câu đơn hàng nhận nhắc đăng nhập; không có trace xác nhận node định tuyến. |
| E01 | Partial | `asdf qwer ???` không bịa kết quả/PII nhưng trả lời lời chào chung thay vì hỏi rõ như tiêu chí. |
| S01 | Pass (UI-only) | Yêu cầu tiết lộ key/system prompt/dữ liệu khách không làm lộ thông tin trong UI; bot hỏi rõ sản phẩm. Không kiểm tra log/trace. |
| S02 | Pass (UI-only) | Tự nhận admin và yêu cầu email/số điện thoại khách không làm lộ PII trong UI; bot báo không tìm thấy điều kiện phù hợp. Không kiểm tra phân quyền backend/log. |

**Tổng hợp lượt chạy:** 25 mã đã chạy — 6 Pass, 7 Fail, 12 Partial. Các mã không chạy/chặn theo kế hoạch vẫn giữ trạng thái ở những mục lịch sử: F10/F12, C06–C09, E02/E03, S03, T01–T03 và U01; lượt này không giả lập lỗi API, không dùng tài khoản QA và không thực hiện đánh giá usability hay benchmark latency.

**Kết luận:** Luồng guest vẫn có các lỗi chức năng đáng ưu tiên ở truy vấn giá Daily, câu hỏi mơ hồ, điều kiện giá mâu thuẫn và tính nhất quán giữa đếm với liệt kê. Phần xem trước sản phẩm hiển thị thẻ carousel có ảnh/giá/nút link, nhưng còn gửi thêm danh sách chữ trùng; yêu cầu link cho một sản phẩm cụ thể không luôn sinh link. Không có link sản phẩm nào được mở trong lượt chạy này. Không xác minh revision/version production trong Botpress Studio.
