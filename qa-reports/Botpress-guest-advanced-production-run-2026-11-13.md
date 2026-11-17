# Báo cáo kiểm thử lại luồng Guest trên Production

- **Ngày chạy gần nhất:** 16/11/2026 (UTC+7)
- **Website:** https://tiem-mua-cham-store.vercel.app/women
- **Chatbot:** Trợ lý Nai Tiệm Mùa Chậm (Botpress)
- **Kết quả retest gần nhất:** 11 Pass · 3 Partial · 1 Fail (15 case)
- **Conversation:** Dùng widget guest đang mở, không nhấn Restart. Gửi chuỗi test liên tiếp để hạn chế khởi tạo hội thoại; các case follow-up được kiểm tra theo thứ tự và có ghi chú về context.
- **Tác động:** Chỉ đọc và gửi câu hỏi kiểm thử; không đặt đơn, không sửa dữ liệu/tồn kho, không click link sản phẩm. Link được xác minh qua thuộc tính `href`.

## Kết quả theo case

| ID | Ca kiểm thử | Kết quả | Quan sát |
|---|---|---|---|
| G01 | Yêu cầu mơ hồ: cần áo dễ mặc đi làm | **Pass** | Bot hỏi rõ sơ mi/thun, nam/nữ và ngân sách/size thay vì tự chọn sản phẩm. |
| G02 | Áo len nữ màu be/nâu, size M, ≤400.000đ | **Pass (production, retest)** | Bot báo 8 mẫu, carousel hiển thị 5 thẻ và phần mô tả nêu đúng các biến thể Be/Nâu size M còn hàng, giá 329.000–369.000đ. Chưa đối chiếu tồn kho độc lập với snapshot database. |
| G03 | Hỏi mẫu rẻ nhất và link của mẫu đó | **Pass** | Chọn “Áo len nữ màu kem Basic” giá 329.000đ; `href` trỏ đúng slug của sản phẩm này. |
| G04 | Đổi màu sang Be/Nâu; giữ M, chỉ dùng S nếu M hết | **Partial (production, retest)** | Follow-up trả 10 mẫu Be/Nâu size M (5 thẻ hiển thị) thay vì rỗng, đúng khi M còn hàng. Không có biến thể M hết hàng trong kết quả dùng để xác nhận nhánh fallback sang S; nhánh S chưa được kích hoạt. |
| G05 | Đổi sang áo thun nam đen, size M, <250.000đ, còn hàng | **Pass (production)** | Chatbot trả 7 mẫu hợp bộ lọc; carousel hiển thị 5 áo thun nam giá 199.000–239.000đ, các mẫu được mô tả màu đen, size M còn hàng. |
| G06 | Hỏi giá áo len nữ Daily và biến thể Be/Nâu size M | **Pass (production, retest)** | Bot trả đúng Áo len nữ Daily 349.000đ, biến thể Be/M còn 15 và Nâu/M còn 28, cùng thẻ và URL sản phẩm Daily. |
| G07 | Đếm và liệt kê mẫu áo len nữ theo bộ lọc trước | **Pass (production, retest)** | Bot trả 8 sản phẩm phù hợp và liệt kê 5/8 đầu tiên với giá/biến thể size M. Stock chỉ được xác nhận theo phản hồi UI. |
| G08 | SKU giả Quantum Unicorn ZX-999, yêu cầu mẫu thay thế | **Fail (production, retest)** | Bot không bịa mẫu và hỏi loại hàng để tìm phương án thay thế. Sau câu trả lời “Áo len nữ”, bot vẫn báo không tìm thấy sản phẩm khớp; nhánh giữ ngân sách/màu/size để tìm mẫu thay thế chưa hoàn tất. |
| G09 | Điều kiện giá mâu thuẫn: dưới 300.000đ nhưng trên 400.000đ | **Pass (production, retest)** | Bot phát hiện mâu thuẫn và hỏi đúng hai lựa chọn: tối đa 300.000đ hoặc từ 400.000đ trở lên. |
| G10 | “Cái đẹp nhất”, ngân sách khoảng 300.000đ; sau đó làm rõ áo nữ màu đen | **Pass (production, retest)** | Sau khi làm rõ, bot giữ mức 300.000đ, báo hiện không có áo nữ màu đen phù hợp trong ngân sách và hỏi có muốn tăng ngân sách hoặc xem áo unisex không; không gợi ý blazer vượt giá. |
| G11 | Guest tra đơn, hỏi tư vấn ở giữa, rồi tra đơn lại | **Partial** | Hai lần tra cứu đều bị chặn; hỏi tư vấn áo len Daily ở giữa vẫn trả lời được. Câu chặn “Vui lòng đăng nhập lại” chưa đúng ngữ cảnh guest; chưa xác minh quyền backend bằng API/trace. |
| G12 | Tìm đồng thời áo thun nam và quần nam đen, XL, <500.000đ | **Pass (production)** | Bot hỏi người dùng muốn lọc nhóm nào trước và nói sẽ giữ điều kiện màu, size, giá. |
| G13 | Xin link sản phẩm thứ hai trong danh sách blazer nữ | **Pass (production, retest)** | Sau danh sách blazer nữ, bot trả đúng Áo blazer nữ Daily (mục thứ hai) giá 619.000đ và URL `/women/phong-cach-nu-thanh-thi-collection-daily`. |
| G14 | Hỏi phí vận chuyển và thời gian giao dự kiến | **Partial** | Bot không bịa câu trả lời; hướng người dùng tới “Vận chuyển & trả hàng”/CSKH nhưng không đưa link trực tiếp hoặc thông tin cụ thể. |
| G15 | Bộ lọc vô lý: váy vàng neon, size XX, dưới 1.000đ | **Pass** | Bot trả lời không tìm thấy sản phẩm khớp chính xác. |

## Kết luận lượt retest gần nhất

11/15 case đạt; G04 còn thiếu bằng chứng cho nhánh fallback size S, G11 và G14 còn Partial, G08 vẫn Fail do không hoàn tất tìm sản phẩm thay thế sau câu làm rõ. Guest order vẫn bị chặn và câu trả lời vận chuyển chưa nêu mức phí/thời gian cụ thể. Không thấy lỗi ở đổi danh mục, lọc nhiều nhóm, đếm sản phẩm, truy vấn Daily, link theo thứ tự, giữ ngân sách, mâu thuẫn giá và bộ lọc không có kết quả.

**Giới hạn:** Đây là kiểm thử giao diện production trong một conversation guest. Không click link sản phẩm, không tạo đơn, không thay đổi dữ liệu. Stock/tổng kết quả chỉ được ghi nhận theo phản hồi UI, chưa đối chiếu độc lập với snapshot catalog cùng thời điểm. Không đo SLA bằng harness.



## Cập nhật sửa lỗi draft (13/11/2026)

- Đã kiểm tra trên Botpress Emulator, không publish.
- G05: đổi sang áo thun nam đen size M dưới 250.000đ trả 7 sản phẩm hợp lệ; carousel có 5 thẻ theo giới hạn hiển thị.
- G12: truy vấn hai nhóm hàng trả câu hỏi làm rõ thay vì báo không có sản phẩm.
- G10: còn lỗi. Truy vấn ngân sách mơ hồ chưa giữ được ràng buộc giá sau bước làm rõ; không đánh dấu đã sửa.
- Ở lần kiểm tra Emulator trước khi publish, G05 và G12 đã Pass; G10 vẫn lỗi. G13 khi đó chưa retest.
- Sau đó người dùng đã publish; kết quả production sau publish được ghi ở mục dưới.

## Kiểm thử production sau publish

- **Ngày kiểm thử:** 13/11/2026 (UTC+7). Chạy trực tiếp trong widget guest trên website production, dùng hội thoại đang mở.
- **G05 — Pass:** đổi sang áo thun nam đen size M dưới 250.000đ trả 7 kết quả; carousel có 5 thẻ, giá trong khoảng 199.000–239.000đ.
- **G12 — Pass:** yêu cầu áo thun và quần đồng thời được hỏi làm rõ danh mục, không trả nhầm “không có sản phẩm”.
- **G10 — Fail:** với “cái đẹp nhất, ngân sách khoảng 300.000đ” rồi “Áo nữ, màu đen”, bot trả blazer giá 599.000–679.000đ; ngân sách bị mất sau làm rõ.
- **G13 — Pass:** “Gửi link sản phẩm thứ 2” trả Áo blazer nữ Daily giá 619.000đ với URL đúng của mẫu thứ hai.
- Các ca phụ thuộc nhiều lượt được chạy liên tiếp trong cùng phiên guest; G04/G06/G07 có thể chịu ảnh hưởng từ context và được ghi rõ trong bảng.
- Tổng 15 case sau lượt retest này: **8 Pass · 3 Partial · 4 Fail**. Không tạo đơn, không click URL; chưa đối chiếu tồn kho qua snapshot database.

## Retest production ngày 16/11/2026

- Dùng widget guest trên trang `/women`; giữ phiên đang mở và gửi các case liên tiếp, không nhấn Restart.
- **G01 Pass:** bot hỏi sơ mi/thun, giới tính và ngân sách/size cho yêu cầu mơ hồ.
- **G02 Pass:** 8 mẫu áo len nữ Be/Nâu size M dưới 400.000đ, carousel 5 thẻ.
- **G03 Pass:** mẫu rẻ nhất là Áo len nữ màu kem Basic 329.000đ; URL trong thẻ trỏ đúng sản phẩm.
- **G04 Partial:** đổi màu trả 10 mẫu với Be/Nâu size M. M còn hàng nên không kích hoạt được fallback sang S.
- **G05 Pass:** áo thun nam đen size M dưới 250.000đ trả 7 mẫu; 5 thẻ đầu trong khoảng 199.000–239.000đ.
- **G06 Pass:** Daily 349.000đ; Be/M còn 15, Nâu/M còn 28.
- **G07 Pass:** đếm ra 8 mẫu và liệt kê 5 mẫu đầu.
- **G08 Fail:** bot hỏi loại hàng sau SKU giả; câu “Áo len nữ” tiếp theo vẫn không tìm được mẫu thay thế.
- **G09 Pass:** bot hỏi đúng hai ngưỡng mâu thuẫn: tối đa 300.000đ hoặc từ 400.000đ trở lên.
- **G10 Pass:** ngân sách 300.000đ được giữ sau khi làm rõ áo nữ màu đen; bot không giới thiệu sản phẩm vượt giá.
- **G11 Partial:** guest bị chặn tra đơn; sau tư vấn sản phẩm, lần tra lại cũng yêu cầu đồng bộ phiên đăng nhập.
- **G12 Pass:** yêu cầu áo thun và quần cùng lúc được hỏi chọn danh mục trước.
- **G13 Pass:** link sản phẩm thứ hai là Áo blazer nữ Daily, URL đúng.
- **G14 Partial:** bot hướng tới trang Vận chuyển & trả hàng/CSKH nhưng không có phí hoặc thời gian cụ thể.
- **G15 Pass:** bộ lọc vô lý trả không có sản phẩm chính xác.
- Tổng lượt retest mới: **11 Pass · 3 Partial · 1 Fail**. Kết quả stock chỉ ghi nhận từ UI, chưa đối chiếu trực tiếp với database. Không tạo đơn hoặc click URL.

