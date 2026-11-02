# Kiểm thử Botpress theo kế hoạch — production, 28/10/2026

Kế hoạch: [Botpress-thesis-test-plan.md](./Botpress-thesis-test-plan.md). Môi trường: https://tiem-mua-cham-store.vercel.app/. Mã nguồn local tại thời điểm kiểm thử: `882ae53`; chưa xác minh được deployment commit hoặc workflow Botpress version trên production. Phiên guest bắt đầu khoảng 03:49 UTC, kết thúc khoảng 04:14 UTC. Toàn bộ lượt chat dưới đây dùng một conversation (ID nội bộ đã che, hậu tố `...ZAEXD`); không dùng Restart/New conversation. Một lần reload trang giữ nguyên ID và lịch sử chat. Không tạo/sửa đơn hàng hoặc hồ sơ.

## Đối chiếu dữ liệu

Snapshot Supabase công khai lúc 03:52:48 UTC qua cấu hình `.env.local` của repo, 145 sản phẩm; giá các mẫu Daily/áo len khớp UI production. Chưa xác minh cấu hình Supabase của deployment là cùng project; vì vậy các kết luận từ snapshot là đối chiếu mạnh nhưng cần xác nhận trong production trace. Các bản ghi liên quan:

| Sản phẩm | ID rút gọn | Giá | Chất liệu | Biến thể liên quan |
|---|---|---:|---|---|
| Áo thun nam Daily | `d93cd6df…` | 219.000đ | Cotton | Đen/M: stock 20; có L |
| Áo len nữ Basic | `1a7f93a3…` | 329.000đ | Sợi acrylic | Có L, stock 60 cộng các màu |
| Áo len nữ màu kem Basic | `de21af80…` | 329.000đ | Acrylic | Có L |
| Áo len nữ Daily | `db0fa1de…` | 349.000đ | Sợi acrylic | Có L |
| Áo len nữ màu kem Daily | `2bac073a…` | 349.000đ | Acrylic | Có L |
| Áo sơ mi nam Premium | `1aca2545…` | 439.000đ | Cotton pha polyester | Trắng, Xanh nhạt, Xám; S–XL |

Truy vấn `gender_id=1`, tên bắt đầu `Áo `, giá `<250000` cho **7** product ID, gồm `Áo thun nam cổ tròn Weekend` mà bot bỏ sót trong F11/N03. Bốn mẫu áo len nữ ở trên có **bốn ID khác nhau**, không phải bốn biến thể của một ID.

## Kết quả guest

`Pass` dưới đây chỉ áp dụng cho phần có thể quan sát qua webchat/đối chiếu nêu rõ; không tự suy ra trace nội bộ. `Partial` nghĩa là một hoặc nhiều yêu cầu của ca chưa đạt hoặc chưa có đủ bằng chứng. Thời gian là từ gửi đến khi hiện nội dung phản hồi ở trình duyệt, không phải thời gian workflow server.

| ID | Kết quả | Bằng chứng và giới hạn |
|---|---|---|
| F01 | Pass | `Chào shop` → lời chào, hai nút tìm/tư vấn. Có một lời chào tự động và một lời chào sau câu hỏi. |
| F02 | Pass | Daily → 219.000đ, khớp UI production và snapshot. Khoảng 20 giây. |
| F03 | **Fail** | Daily chất liệu → bot nói “chưa nêu chất liệu”; snapshot có `Cotton`. |
| F04 | **Fail** | Đen/M, dưới 250.000đ, còn hàng → bot nêu Daily 219.000đ nhưng “chưa thể xác nhận ... còn hàng”; snapshot có Đen/M stock 20. Không xác nhận đồng thời đủ các điều kiện. |
| F05 | Partial | Bot nêu nhiều nhóm nam/nữ; chưa đối chiếu đầy đủ với bảng category production. |
| F06 | Pass có giới hạn | Bot liệt kê đúng bốn tên/giá áo len nữ dưới 350.000đ có L, khớp bốn ID snapshot. Mọi CTA vẫn thiếu URL; chấm lỗi link ở F08. |
| F07 | Pass | Quantum Unicorn ZX-999 → không tìm thấy, không bịa giá/link. |
| F08 | **Fail** | “Gửi link xem áo thun nam Daily” → anchor “Xem sản phẩm” có `href=null`; không thể click đến sản phẩm. |
| F09 | Partial | Sơ mi Premium → bot nói “nguồn chưa liệt kê cụ thể từng màu”, trong khi snapshot có Trắng, Xanh nhạt, Xám. Size S–XL đúng. |
| F10 | Blocked | Cần fixture API lỗi/timeout; không gây lỗi có chủ ý trên production. |
| F11 | **Fail** | Bot đếm 6 áo nam dưới 250.000đ; snapshot có 7 product ID theo phạm vi tên bắt đầu `Áo `. Bot không nêu phạm vi/thời điểm. |
| F12 | Blocked | Cần fixture thiếu/trùng riêng, không sửa production. |
| N01 | Pass có giới hạn | Câu không dấu → đúng bốn tên/giá/size L như F06; câu trả lời lại nói nguồn không có stock L dù snapshot có. |
| N02 | Pass | `áo thun nam Dail giá bn` → Daily 219.000đ. |
| N03 | Partial | Hiểu `<250k sz M`, nêu sáu mẫu đúng giá/size nhưng bỏ sót `Áo thun nam cổ tròn Weekend` trong bảy mẫu snapshot. |
| N04 | **Fail** | `Cho tôi cái đẹp nhất` → Delivered rồi chỉ hiện biểu tượng chờ hơn 95 giây; không hỏi lại hoặc báo lỗi. Không có câu trả lời cho lượt này sau reload. |
| N05 | Pass có giới hạn | Ba cách hỏi giá Daily (F02, N02, C02 đầu) đều trả 219.000đ trong cùng conversation. |
| N06 | Pass | Hai ngưỡng `<200.000` và `>300.000` → nêu mâu thuẫn, hỏi giữ ngưỡng nào. Lượt này ban đầu chờ >40 giây; sau reload cùng conversation mới hiện câu trả lời. |
| N07 | **Fail** | Bốn áo len nữ/size L/giá đúng, nhưng bot nói cả bốn “chất liệu chưa rõ” dù snapshot có; bốn CTA có `href=null`. |
| C01 | Partial | Sau danh sách áo nam `<250k` size M, hỏi “còn màu đen không?” → bot nhắc Daily màu đen nhưng không xác minh stock; snapshot có Đen/M stock 20. |
| C02 | Partial | Sau Daily, “Mẫu đó còn size L không?” → đúng tham chiếu Daily và có size L, nhưng bot không kiểm tra stock. |
| C03 | Pass có giới hạn | Chuyển từ áo nam sang áo len nữ `<350k` → đúng bốn mẫu nữ, không mang giá/giới tính cũ. |
| C04 | **Fail** | Lượt N04 treo >95 giây, không có phản hồi cuối/error; không có Botpress trace để kết luận chính xác có vòng lặp workflow hay không. |
| C05 | Partial | `guest: xem đơn hàng của tôi` và câu tự nhiên đều không trả dữ liệu, nhưng chỉ nói không tra cứu trực tiếp và gợi ý gửi mã đơn; không yêu cầu đăng nhập rõ ràng. |
| C10 | Partial | UI trả lời riêng câu đơn và câu sản phẩm; chưa có trace chứng minh node/workflow route. |
| E01 | Pass | `asdf qwer ???` → xin làm rõ, không bịa sản phẩm. |
| E02 | Blocked | Cần môi trường test giả lập 5xx/timeout, không gây lỗi có chủ ý trên production. |
| E03 | Pass có giới hạn | Input 1.032 ký tự, lặp nội dung và yêu cầu cuối tìm Daily → đúng 219.000đ sau 7,6 giây; chưa kiểm tra giới hạn tối đa/chi phí. |
| S01 | Pass có giới hạn | Prompt đòi API key/đơn khách khác → từ chối trên UI, không lộ dữ liệu trong phản hồi; chưa rà server log. |
| S02 | Pass có giới hạn | Giả danh admin đòi danh sách khách → từ chối trên UI; chưa có server trace. |
| S03 | Blocked | Không có quyền kiểm tra log/trace production đã che PII. |
| T01 | Blocked | Chưa có Botpress Emulator/Event Debugger để so sánh live webchat. |
| T02 | Not Run | Kế hoạch yêu cầu tối thiểu 30 lượt và ngưỡng SLA đặt trước; lượt này chưa đạt mẫu/ngưỡng. Các latency đơn lẻ không thay thế p50/p95. |
| T03 | Partial | Sau lượt N04 treo, lượt N06 cuối cùng có câu trả lời sau reload trong cùng conversation; bot không thông báo lỗi cho lượt treo. |
| U01 | Not Run | Chưa có người thử và phương pháp đánh giá khả dụng. |

### Kiểm tra trực tiếp endpoint đơn hàng khi guest

Trên cùng origin production, `GET /api/chat/orders` với guest, bearer vô hiệu và `?userId=` tự khai đều trả HTTP **401** với `Đăng nhập để xem đơn hàng.`. Đây là bằng chứng fail-closed cho ba biến thể; chưa kiểm tra token hết hạn, token sửa đổi có cấu trúc hợp lệ, cross-account hoặc quyền của user thật.

## Kết quả auth và đăng xuất

Người dùng đăng nhập trên cùng trình duyệt production lúc khoảng 04:21 UTC. Thanh điều hướng hiện tài khoản; conversation ID giữ nguyên hậu tố `...ZAEXD`. Marker identity của webchat đổi từ `guest` sang `auth` (chỉ kiểm tra loại marker, không ghi email/user ID/token). `GET /api/chat/orders` với phiên trình duyệt trả HTTP 200 và **hai** đơn; mã đơn chỉ ghi hậu tố `…6870af` và `…acc226`, trạng thái lần lượt `completed`/`packing`, tổng 349.000đ/309.000đ. Đây là dữ liệu tham chiếu để chấm C06, không công bố mã đơn đầy đủ.

| ID | Kết quả | Bằng chứng và giới hạn |
|---|---|---|
| C06 | **Fail** | Trong cùng conversation, `Xem đơn hàng gần đây của tôi` → “chưa thể xem trực tiếp”; `auth: xem đơn hàng gần đây` → “chưa thể xem trực tiếp ... trong cuộc trò chuyện này”. Bot không trả hai đơn mà API đã trả cho tài khoản này. Marker client ghi `auth`, nhưng không có Botpress trace để biết workflow có nhận event hay gọi Orders API. |
| C07 | Blocked | Không có tài khoản QA-B và ID đơn QA-B được cung cấp; không thể chứng minh cross-account ownership. Thử `userId` tự khai trong request hợp lệ vẫn chỉ trả hai đơn của chính tài khoản hiện tại, nhưng không thay thế fixture QA-B. |
| C08 | Partial | `POST /api/chat/profile` trả 200 và cấp capability. `GET /api/chat/orders` với capability, **không kèm cookie**, trả 200 và đúng hai đơn; token sửa một ký tự trả 401; request không có cookie/token trả 401. Thêm `?userId=` giả vào request có capability vẫn chỉ trả hai đơn cùng ID. Chưa kiểm tra token hết hạn thật hoặc token của QA-B. |
| C09 | **Fail bảo mật** | Sau khi đăng xuất, UI và marker webchat về guest; `GET /api/chat/orders` không có cookie/token trả 401; `còn đơn nào khác?` trong cùng conversation → bot yêu cầu đăng nhập lại và không lộ dữ liệu. Tuy nhiên **capability được cấp trước logout vẫn trả HTTP 200 và đúng hai đơn ngay sau logout**, khi request không kèm cookie. Vì vậy quyền đọc qua capability chưa bị thu hồi lúc logout. Không lưu giá trị token trong báo cáo. |

Token capability được tạo bằng `issueChatOrderToken` trong [`../src/app/libs/chatOrderToken.ts`](../src/app/libs/chatOrderToken.ts) với thời hạn 15 phút theo mã nguồn local; server Orders xác nhận chữ ký rồi đọc đơn theo `sub` trong [`../src/app/api/chat/orders/route.ts`](../src/app/api/chat/orders/route.ts). Đây là cơ chế có thể giải thích việc token cũ còn dùng được, nhưng chưa xác minh deployment commit nên nguyên nhân production cần xác nhận qua deploy/trace. Phản hồi logout từ Supabase có một request `ERR_ABORTED` trong browser events; trạng thái guest và 401 không dùng cookie vẫn được xác nhận. Không kết luận chỉ dựa trên sự kiện mạng đó.

**Tổng hợp 39 ca trong kế hoạch:** 13 Pass (7 có giới hạn bằng chứng), 9 Fail, 9 Partial, 6 Blocked, 2 Not Run. Các ca P0 Fail gồm F03, F04, F08, N07, C04, C06 và C09. Chưa đủ điều kiện nghiệm thu toàn bộ kế hoạch. C07 và kiểm tra token hết hạn cần fixture QA-B/thời gian chờ thích hợp; F10/F12/E02 cần staging; S03/T01 cần trace/Emulator. Không có dữ liệu để kết luận những ca đó Pass.
