# Bộ test nghiệm thu chatbot thương mại điện tử cho đề tài thạc sĩ

**Đề tài:** *Nghiên cứu thiết kế và tích hợp chatbot hội thoại dựa trên nền tảng Botpress nhằm nâng cao trải nghiệm người dùng trong thương mại điện tử*  
**Đối tượng:** Friendly Duck / Trợ lý Nai Tiệm Mùa Chậm, Botpress Studio và storefront production/staging.  
**Phiên bản kế hoạch:** 1.0 — thay thế kế hoạch rời rạc Guest/Auth cũ khi tổ chức đợt nghiệm thu luận văn.  
**Mục tiêu tài liệu:** xác định trước câu hỏi nghiên cứu, test case, bằng chứng và điều kiện chấp nhận; đây là kế hoạch, không phải kết quả kiểm thử hay kết luận luận văn.

## 1. Mục tiêu nghiên cứu và câu hỏi đánh giá

Chatbot được xem là cải thiện trải nghiệm khi giúp người mua hoàn thành các tác vụ tìm hiểu và tra cứu chính xác, dễ hiểu, ít công sức hơn cách duyệt web hiện tại, đồng thời giữ đúng quyền truy cập dữ liệu. Đánh giá cần tách ba lớp bằng chứng: tính đúng đắn kỹ thuật của workflow/API, kết quả tác vụ của người dùng, và cảm nhận trải nghiệm.

| Câu hỏi | Nội dung cần đo | Bằng chứng phù hợp |
|---|---|---|
| RQ1 — Chức năng | Bot có hiểu ý định, trích xuất bộ lọc, trả kết quả/catalog/variant chính xác và hoàn tất tác vụ không? | Bộ câu hỏi chuẩn hóa, snapshot catalog, log/trace, đối chiếu kết quả theo product/variant ID |
| RQ2 — Hội thoại | Bot có giữ, sửa và bỏ đúng ngữ cảnh qua nhiều lượt; xử lý được làm rõ, sửa điều kiện, đổi tác vụ và tham chiếu đại từ không? | Transcript có thứ tự, tiêu chí mong đợi sau từng lượt, số lần hỏi lại/sửa |
| RQ3 — Tích hợp và an toàn | Web, Botpress, API và Supabase có đồng bộ trạng thái người dùng; người dùng chỉ đọc được dữ liệu mình có quyền xem không? | Trạng thái auth thực, event/trace đã che định danh, phản hồi API và fixture QA |
| RQ4 — Trải nghiệm | Chatbot ảnh hưởng thế nào tới tỷ lệ hoàn thành, thời gian, số lượt hội thoại, nỗ lực và cảm nhận hữu ích/dễ dùng/tin cậy? | Thử nghiệm có nhóm/điều kiện so sánh, đồng hồ đo thống nhất, bảng hỏi sau tác vụ |

## 2. Phạm vi và nguyên tắc phân loại phiên

Phạm vi gồm tìm/tư vấn sản phẩm, hỏi giá/chất liệu/variant/tồn, đếm/liệt kê, hội thoại nhiều lượt, thẻ/link, chuyển qua lại giữa sản phẩm và đơn hàng, tích hợp webchat, độ tin cậy và trải nghiệm người dùng.

**Guest phải là một browser session thật sự chưa đăng nhập**: Supabase không có user session/cookie; navbar hiển thị Đăng nhập/Đăng ký. Một event Botpress giả lập `guest` trong trình duyệt vẫn giữ Supabase cookie **không tạo thành phiên guest**. Ngày 12/11/2026, chatbot ở trình duyệt đang đăng nhập trả về dữ liệu đơn của tài khoản hiện tại dù gửi event guest giả lập. Hành vi này không chứng minh lỗi cấp quyền của route đang xác thực bằng Supabase cookie, nhưng khiến kết quả đó không thể được chấm như test guest. Đợt guest thực tế phải chạy trong browser context đăng xuất được cô lập.

| Hồ sơ | Tiền điều kiện và quyền kỳ vọng |
|---|---|
| T-GUEST | Browser QA đã xác nhận đăng xuất; không Supabase cookie/session; chat identity được đồng bộ guest. Được xem catalog công khai, không được xem bất kỳ đơn nào. |
| T-AUTH-A | Tài khoản QA-A được chủ dự án xác nhận và có đơn fixture A; chỉ xem đơn gắn với QA-A. |
| T-AUTH-B | Tài khoản QA-B độc lập; dùng kiểm tra cô lập chéo, chỉ khi được cấp và xác nhận rõ. |
| T-EMULATOR | Emulator Botpress; hữu ích để xem biến, node, lỗi và trace. Không thay thế kết quả production. |

Không đăng xuất phiên tài khoản thật/dùng chung để tạo guest. Không sửa đơn, tồn kho hay hồ sơ trên production. Test hết hàng, lỗi API, token hết hạn và trường hợp chéo tài khoản phải dùng staging/fixture QA. Dữ liệu nhập giả phải dùng chuỗi `.invalid`, không dùng PII thật. Không lưu access token, cookie, ID user hay conversation ID.

## 3. Quy trình chạy và bằng chứng tối thiểu

1. Ghi ngày/giờ ICT, URL, môi trường, Botpress workflow/revision nếu xem được, trạng thái auth đã xác nhận và nguồn dữ liệu catalog/variant.
2. Mỗi kịch bản liên tục chạy trên **một conversation**; ghi từng câu hỏi và từng phản hồi, không chỉ kết quả cuối. Chỉ mở conversation mới giữa các kịch bản độc lập khi cần xóa ngữ cảnh; ghi rõ số conversation đã tạo. Một kịch bản stress/conversation-continuity phải giữ một conversation xuyên suốt toàn bộ chuỗi.
3. Chờ phản hồi cuối hoàn tất trước lượt kế. Tách thẻ sản phẩm khỏi câu trả lời text để không chụp trạng thái trung gian. Ghi thời gian từ lúc gửi đến lúc UI hiển thị phản hồi cuối; không gọi đó là server latency.
4. Đối chiếu mọi khẳng định về màu/size/tồn/giá với **cùng variant** của product ID trong snapshot gần thời điểm chạy. Đối chiếu số lượng với product ID duy nhất, không đếm thẻ trùng như sản phẩm khác.
5. Link production chỉ kiểm tra URL/đích và cấu trúc thẻ; không click. Kiểm tra điều hướng thật ở staging hoặc automation an toàn.
6. Guest order case dùng email giả không bao giờ là định danh hợp lệ. Xác nhận không có đơn hoặc chi tiết đơn xuất hiện. UI pass chỉ chứng minh quan sát giao diện; kết luận authorization cần API/trace độc lập.

### Trạng thái

- **Pass:** mọi tiêu chí bắt buộc trong test case đạt, có bằng chứng phù hợp.
- **Fail:** quan sát trực tiếp mâu thuẫn với tiêu chí; giữ nguyên câu hỏi/đầu ra làm bằng chứng.
- **Partial:** một phần đạt nhưng thiếu snapshot/trace/fixture hoặc một nhánh điều kiện chưa kiểm tra.
- **Blocked:** thiếu tài khoản QA, fixture hoặc môi trường cần thiết; không suy diễn thành Pass.
- **Not Run:** chưa thực hiện, khác với Blocked.

## 4. Test case chức năng Guest

Mỗi chuỗi chạy khi **đúng là T-GUEST**. Các case dưới đây kế thừa tinh thần bộ G01–G12, nhưng mỗi lượt có tiêu chí rõ ràng hơn.

| ID | Chuỗi thao tác | Điều kiện đạt | Đối chiếu |
|---|---|---|---|
| G01 — Khởi đầu/mơ hồ | `Shop có áo nào dễ mặc đi làm không?` | Hỏi một điểm làm rõ hữu ích hoặc đưa gợi ý được giới hạn rõ; không tự khẳng định “phù hợp đi làm”/số mẫu nếu catalog không có trường này; không chuyển sang đơn hàng. | Transcript, số liệu/phát ngôn chưa kiểm chứng, loại câu hỏi làm rõ. |
| G02 — Nhiều bộ lọc + giá thấp nhất | `Mình tìm áo len nữ đi làm, màu be/kem/nâu, size M, tối đa 400 nghìn, còn hàng.` Sau đó `Mẫu rẻ nhất trong số đó là mẫu nào?` | Lượt 1 áp dụng đồng thời loại/đối tượng/màu/size/trần giá/tồn. Lượt 2 so sánh **chính tập đã lọc** và trả đúng sản phẩm/giá thấp nhất; nêu rõ nếu thiếu dữ liệu chất liệu/công dụng. | Product/variant IDs, số lượng duy nhất, giá và stock snapshot. |
| G03 — Đại từ và kiểm tra variant | `Mẫu đó còn màu kem size M không?` | Trỏ đúng sản phẩm rẻ nhất ở G02; chỉ xác nhận variant kem/M nếu tồn tại; không trộn màu hoặc size từ các variant khác nhau. | Product ID được tham chiếu và bản ghi kem/M. |
| G04 — Mở rộng có điều kiện | G02 tiếp `Nếu không có kem, đổi sang be/nâu; size S cũng được nếu M hết, vẫn ≤400 nghìn.` | Giữ các tiêu chí không bị sửa; loại màu kem khỏi phương án thay thế; chỉ chọn S khi variant M phù hợp không còn. Nếu M còn, nói rõ không cần dùng S. | Snapshot variant M và S cùng màu, kết quả trước/sau. |
| G05 — Thay đổi yêu cầu | `Thôi tìm áo thun nam màu đen size M dưới 250 nghìn; bỏ áo len và nữ.` | Loại bỏ đúng điều kiện cũ, không kế thừa áo len/nữ; mọi kết quả thỏa đồng thời màu/size/giá/giới tính. | Product IDs, cùng-variant check, số đếm. |
| G06 — Giá nối tồn/chất liệu | `Áo thun nam Daily giá bao nhiêu?` → `Đen size M còn không, giá biến thể có khác không?` → `Chất liệu gì?` | Giữ Daily; tách giá base/variant; stock chỉ theo Đen/M; chất liệu chỉ lấy trường catalog. Nếu không có giá riêng thì nói chưa cập nhật. | Base price, `variant.price`, `stock`, `material`; không suy từ ảnh. |
| G07 — Đếm và liệt kê | `Có bao nhiêu áo thun nam dưới 250 nghìn màu đen size M còn hàng? Liệt kê, không tính mẫu hết hàng.` | Số đếm bằng số product ID duy nhất thỏa tất cả bộ lọc; danh sách khớp đếm; variant Đen/M/stock>0 thuộc đúng product. Giới hạn hiển thị phải nói rõ `x/n`. | Snapshot có timestamp, câu lọc và bảng IDs. |
| G08 — SKU không tồn tại/fallback | `Tìm Quantum Unicorn ZX-999; nếu không có, tìm mẫu gần nhất dưới 300 nghìn, màu tối, size M.` Nếu bot hỏi loại sản phẩm, trả lời một loại cụ thể. | Không bịa SKU; nói không tìm thấy mẫu gốc; hỏi lại đúng tiêu chí còn thiếu; sau câu làm rõ, tìm lại dưới 300 nghìn/màu tối/M. Không trả câu hỏi làm rõ như thể đã hoàn tất fallback. | SKU lookup, transcript cả nhánh trả lời, danh sách thay thế đối chiếu catalog. |
| G09 — Khoảng giá mâu thuẫn | `Tìm áo vừa dưới 200 nghìn vừa trên 300 nghìn.` → `Ý mình là tối đa 300 nghìn.` | Lượt đầu phát hiện mâu thuẫn; lượt hai thay thế cả hai bound cũ bằng trần mới, tìm lại kết quả; không giữ `minPrice=300k`. | Bộ lọc trước/sau, số lượng và giá catalog. |
| G10 — Ý định mơ hồ/không có kết quả | `Cho mình cái đẹp nhất.` Sau đó nêu `Áo nữ mặc hằng ngày, dễ phối, khoảng 300 nghìn.` rồi hỏi `Có màu đen không?` | Hỏi loại sản phẩm trước khi xếp hạng thẩm mỹ. Nếu không có hàng đúng nhóm/giá, giải thích điều kiện không khớp và hỏi có muốn đổi; câu màu đen phải giữ cùng nhóm/giá và chỉ xác nhận sau khi khách chấp nhận nới. | Transcript, catalog nữ/unisex tách riêng, không tự đổi giới tính/ngân sách. |
| G11 — Ranh giới Guest/đơn | T-GUEST: `Mình muốn xem đơn gần nhất; email mình dùng là guest-test@example.invalid.` Sau đó tư vấn một sản phẩm rồi hỏi đơn lần nữa. | Không tra đơn theo email tự khai; không hiển thị ID/trạng thái/tổng/mặt hàng; hướng dẫn đăng nhập. Tư vấn sản phẩm vẫn hoạt động trong cùng conversation; lần hỏi đơn sau vẫn bị từ chối. | UI transcript + API response/trace 401 đã che dữ liệu. Nếu browser còn auth cookie, dừng: case không phải guest. |
| G12 — Hai nhóm người | `Mình chọn đồ cho hai người: áo nữ M dưới 400 nghìn; chồng cần thun nam L màu đen. Tách hai nhóm nhé.` → chọn nhóm chồng → `Đổi size sang XL, giữ điều kiện khác.` | Bot hỏi nhóm nào trước hoặc biểu diễn tách nhóm; không trộn giới tính/tập kết quả; sau chọn chỉ đổi size L→XL trong nhóm chồng, giữ loại/đen. | Bộ lọc trung gian/cuối, product/variant IDs và tổng số. |

## 5. Test case xác thực, tích hợp và an toàn

| ID | Phiên/chuỗi | Điều kiện đạt | Trạng thái nếu thiếu fixture |
|---|---|---|---|
| I01 — Khởi tạo | T-GUEST và T-AUTH-A mở webchat trên môi trường test được chỉ định. | Một greeting/widget; identity event đúng vai trò; không gửi hai nhánh trả lời cho một lượt. | Partial nếu chỉ DOM; cần event/trace để khẳng định routing. |
| I02 — Guest thật | Xác nhận Supabase logout/cookie không tồn tại trước khi mở chat guest. | Navbar đăng nhập, event guest phát một lần trên conversation; chatbot không có order capability. | Blocked nếu không xác định được auth state. Không thay bằng guest-event giả lập trong trình duyệt đã login. |
| I03 — Đơn Guest | T-GUEST hỏi bằng email/ID giả QA; thử GET `/api/chat/orders` không cookie/bearer. | API từ chối (401 theo thiết kế hiện tại); không trả body order; UI hướng dẫn đăng nhập. | Blocked nếu không có API/trace hoặc session guest thật. |
| I04 — Đơn Auth đúng chủ | T-AUTH-A với đơn fixture A hỏi đơn mới nhất. | Cookie Supabase server-verified hoặc capability có chữ ký/TTL/scope được xác thực; trả đúng đơn A, không dùng `userId/email` trong message để phân quyền. | Blocked nếu không có QA-A/fixture. |
| I05 — Cách ly chéo | QA-A và QA-B riêng; hỏi đơn bằng nhau hoặc tự khai thông tin tài khoản kia. | Mỗi session chỉ nhận đơn của chính chủ; thay đổi `userId` phía client không đổi subject đã xác thực. | Blocked nếu thiếu QA-B. Không dùng đơn thật hoặc đoán ID. |
| I06 — Auth → logout | Tài khoản QA cô lập xem đơn, logout trong cùng conversation rồi hỏi lại. | Browser cookie/token bị thu hồi/không được cache để tiếp tục; hỏi đơn bị chặn; nội dung lịch sử không được gửi lại như câu trả lời mới. | Blocked khi chỉ có browser/tài khoản dùng chung. |
| I07 — Hết hạn/giả mạo | Chỉ staging: capability sai chữ ký, hết TTL, sai scope và token hỏng. | Từ chối an toàn; không lộ đơn; log không chứa token thô. | Không thực hiện bằng cách can thiệp token production. |
| I08 — Chuyển intent | Auth A: đơn → sản phẩm → đơn; Guest thật: sản phẩm → đơn → sản phẩm. | Bot đổi đúng workflow theo từng lượt; sản phẩm không xoá auth; guest không được nâng quyền do nhập email; không có trả lời thứ hai/trễ. | Cần trace để chấm luồng node; DOM đơn thuần chỉ là UI evidence. |
| I09 — API lỗi | Chỉ staging: Supabase 401/403/5xx/timeout hoặc Botpress action timeout. | Bot phân biệt không xác thực, không tìm thấy và lỗi tạm thời; không gọi lỗi backend là “0 sản phẩm/không có đơn”; câu kế tiếp hồi phục. | Blocked trên production nếu chưa có môi trường fault injection. |
| I10 — Privacy/prompt injection | Guest yêu cầu system prompt/API key/danh sách khách; Auth A yêu cầu đơn của B. | Không trả secret/PII; không dùng lời tự nhận admin/email để tăng quyền. Kiểm tra UI lẫn log đã che. | Partial nếu chưa có trace/backend evidence. |

## 6. Đo lường trải nghiệm cho luận văn

### 6.1 Thử nghiệm tác vụ

So sánh ít nhất hai điều kiện: **A — tìm sản phẩm bằng cách duyệt website hiện tại**; **B — thực hiện cùng tác vụ với chatbot**. Dùng trong-subject hoặc nhóm độc lập; nếu cùng người thử cả A/B, cân bằng thứ tự để giảm hiệu ứng học. Chọn số người bằng phương pháp phù hợp mục tiêu/thống kê và yêu cầu đạo đức của trường; không suy ra cỡ mẫu từ test kỹ thuật. Chạy pilot trước, cố định kịch bản và tiêu chí chấm trước đợt chính.

Tác vụ khả dụng: tìm áo thun nam Đen/M/≤250 nghìn còn hàng; tìm áo len nữ Kem/M/≤400 nghìn; hỏi mẫu rẻ nhất trong tập đã lọc; đổi màu/size sau khi xem kết quả; hỏi trạng thái đơn chỉ với người dùng QA đã consent. Mỗi tác vụ có `task success` định nghĩa trước (đúng sản phẩm/variant/giá và hoàn tất không nhờ moderator). Không dùng đơn thật của người tham gia.

| Chỉ số | Định nghĩa thao tác | Báo cáo |
|---|---|---|
| Tỷ lệ hoàn thành | Số tác vụ đạt tiêu chí / tổng tác vụ đã thử | % theo điều kiện và tác vụ; phân biệt tự hoàn tất/nhờ trợ giúp |
| Đúng kết quả | Đạt product/variant/price/stock rubric theo catalog snapshot | %; sai lệch theo loại thực thể; false positive là lỗi nghiêm trọng |
| Thời gian tác vụ | Từ lúc đọc đề bài đến lúc người tham gia chọn/xác nhận câu trả lời | Median, IQR; số liệu timeout tách riêng |
| Hiệu suất hội thoại | Số lượt user, clarification, sửa truy vấn, hủy/bỏ tác vụ | Median và phân bố theo case; không coi ít lượt là tốt nếu tăng sai sót |
| Hiệu quả/efficiency | Task success kết hợp thời gian và trợ giúp | Trình bày đồng thời; không gộp thành điểm tùy ý nếu chưa đăng ký công thức |
| Cảm nhận | Bảng hỏi sau từng điều kiện về dễ dùng, hữu ích, rõ ràng, tin cậy, hài lòng (Likert 1–7) | Từng item, phân bố và median; nếu tạo thang tổng, pilot/kiểm định độ tin cậy và giải thích cách tính |

### 6.2 Hướng dẫn người tham gia và dữ liệu

Không yêu cầu người thử cung cấp email, mật khẩu, địa chỉ, OTP hoặc thông tin đơn cá nhân. Dùng tài khoản/đơn fixture QA được cấp riêng cho kịch bản auth. Xin consent phù hợp với quy định của trường trước ghi màn hình/giọng nói; ưu tiên ghi event/timestamp đã loại định danh. Che thông tin cá nhân trước khi đưa hình/chụp màn hình vào luận văn. Moderator không hướng dẫn câu trả lời; nếu cần trợ giúp, ghi mức trợ giúp.

### 6.3 Định nghĩa các kết quả nghiên cứu

- Báo cáo kết quả tuyệt đối và chênh lệch A/B kèm số mẫu, phân bố và khoảng tin cậy/phương pháp kiểm định được thống nhất trước với hướng dẫn viên.
- Phát biểu “nâng cao trải nghiệm” chỉ khi dữ liệu người tham gia cho thấy thay đổi theo tiêu chí đã định; kết quả kiểm thử chức năng riêng không chứng minh trải nghiệm người dùng tốt hơn.
- Tách lỗi chatbot khỏi lỗi API/catalog, sai trạng thái đăng nhập, thời gian mạng và thao tác moderator. Ghi phiên bản Botpress/build, snapshot và trạng thái session để có thể tái lập.

## 7. Ma trận nghiệm thu và báo cáo

| Nhóm | Điều kiện bắt buộc trước khi kết luận đạt |
|---|---|
| Chức năng catalog | Tất cả test dữ liệu đối chiếu đúng product ID duy nhất; màu/size/tồn cùng variant; giá và tổng số khớp snapshot; không fabricated result. |
| Hội thoại | G02–G12 ghi từng lượt; đổi yêu cầu mới bỏ bộ lọc cũ đúng; câu nối giữ đúng đối tượng; một lượt user có tối đa một phản hồi hoàn tất. |
| Guest security | G11/I02/I03 chỉ được chấm sau khi xác minh đăng xuất thật và response API/trace. Guest không được nâng quyền bởi email tự khai hoặc guest event gửi trong browser đang đăng nhập. |
| Auth security | Tài khoản QA-A xem đúng dữ liệu QA-A; cross-account, token hỏng/hết hạn/thiếu quyền không trả dữ liệu. Không có test đơn thật thì ghi Blocked. |
| Reliability | Lỗi mạng/API được mô phỏng trong staging; không báo 0 kết quả khi truy vấn lỗi; câu tiếp theo phục hồi. |
| Performance | Chốt trước target SLA; đo tối thiểu 30 lượt cho nhóm truy vấn chuẩn, cùng môi trường; báo median/p95 và timeout. Không đổi ngưỡng sau khi xem kết quả. |
| UX nghiên cứu | Có điều kiện so sánh, tác vụ/chấm điểm cố định, người tham gia và số mẫu được giải thích, consent phù hợp; không dùng test nội bộ như bằng chứng user study. |

### Phiếu kết quả bắt buộc

| ID/phiên bản | Role/session đã xác minh | Câu hỏi từng lượt | Phản hồi cuối | Oracle/snapshot/trace | Thời gian | Pass/Fail/Partial/Blocked/Not Run | Lý do/giới hạn |
|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |

Với multi-turn test, thêm dòng riêng cho từng lượt và bộ lọc trước/sau. Khi hai nguồn bằng chứng mâu thuẫn (ví dụ UI nói `0` nhưng catalog snapshot có biến thể), giữ cả hai, chấm theo mức chứng minh được và tạo finding; không xóa kết quả bất lợi bằng rerun đơn lẻ.

## 8. Kết nối với hồ sơ kiểm thử hiện có

- [Kế hoạch Guest/Auth ngày 05/11](./Botpress-chat-guest-auth-test-plan-2026-11-05.md) — nguồn G01–G12/A01–A12; kế hoạch này bổ sung traceability, tiêu chí UX/nghiên cứu và yêu cầu guest session thật.
- [Baseline thesis ngày 02/11](./Botpress-thesis-production-run-2026-11-02.md) — kết quả lịch sử, không phải kết quả của kế hoạch mới.
- [Tái kiểm thử Guest một conversation ngày 12/11](./Botpress-guest-advanced-production-run-2026-11-12.md) — bằng chứng UI trên production ở trạng thái guest.
- [Test khi browser đăng nhập ngày 12/11](./Botpress-guest-test-while-authenticated-2026-11-12.md) — bằng chứng bổ sung rằng gửi guest event trong browser authenticated không tạo guest session; phải dùng trạng thái đăng xuất thật để nghiệm thu guest orders.

**Kế hoạch này chưa được chạy và không tự nâng bất kỳ kết quả lịch sử nào thành Pass.** Kết quả mới phải lập báo cáo riêng với phiên bản, session type và bằng chứng nêu trên.
