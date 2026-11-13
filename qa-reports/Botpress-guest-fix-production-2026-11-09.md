# Sửa lỗi Guest Botpress và tái kiểm thử — 09/11/2026

**Trạng thái: đã sửa trong Studio, publish thành công và xác nhận bản mới trên web production.**

Bot: Friendly Duck. Workflow sửa: **Consult AI**. Website: https://tiem-mua-cham-store.vercel.app/

## Những thay đổi đã áp dụng

1. **Action truy vấn sản phẩm** — tên hiện tại `Product Query and Recommendation System for E-commerce`:
   - Loại thêm từ hội thoại khỏi điều kiện khớp tên; trước đây các từ như `như`, `giúp`, `đừng`, `hết`, `tiêu`, `miễn`, `mấy` có thể khiến tên sản phẩm không khớp.
   - Nhận diện câu nối “trong mấy mẫu đó”; chọn một mẫu rẻ nhất từ tập đã lọc và giữ tham chiếu mẫu đó cho lượt sau.
   - Xử lý “bỏ tiêu chí áo len và nữ” khi đổi sang áo thun nam.
   - Đổi màu sang be/nâu mà không giữ kem như một màu thay thế; hỗ trợ M/S theo điều kiện dự phòng. Chỉ ưu tiên M khi đúng màu và còn hàng.
   - Dùng truy vấn trước của **conversation hiện tại**, không lấy truy vấn từ conversation khác qua user cache.
   - Giữ toàn bộ tập sản phẩm trả về để đếm; chỉ giới hạn ở bước dựng câu trả lời. Không còn cắt còn 8 mẫu trước khi tính “còn bao nhiêu”.
   - Khi không tìm thấy mẫu được gọi tên và khách yêu cầu mẫu thay thế, hỏi rõ loại sản phẩm để tiếp tục thay vì trả câu không tìm thấy chung.
2. **Action dựng phản hồi** — tên hiện tại `Generate Product Recommendations Based on User Queries`:
   - Dựng câu trả lời từ dữ liệu truy vấn có cấu trúc; câu hỏi giá không còn che mất phần màu/size/tồn kho.
   - Hiển thị giá riêng biến thể khi có; nếu chưa có thì nói rõ. Tồn được lấy trên cùng bản ghi màu/size, phân biệt còn hàng/hết hàng/chưa xác minh.
   - Tổng số lấy từ toàn bộ kết quả; hiển thị rõ `5/15 mẫu; còn 10 mẫu` khi danh sách bị giới hạn.
   - Giữ thông điệp làm rõ khoảng giá, hai nhóm người, yêu cầu mơ hồ và lỗi truy vấn; không thay các thông điệp này bằng câu rỗng chung.
   - Với yêu cầu đi làm quá rộng, hỏi loại áo/đối tượng/ngân sách. Với áo nữ khoảng 300.000đ chưa có kết quả, hỏi khả năng tăng ngân sách hoặc chấp nhận unisex; không tự thay bộ lọc.
   - Nêu giới hạn khi catalog không có đánh giá độ mềm hoặc công dụng đi làm.

Bản trước/sau của hai action được lưu trong [thư mục bản sửa](./botpress-guest-fix-2026-11-09/). Mã được lưu dạng `.ts.txt` để không bị bộ biên dịch ứng dụng Next.js đưa vào kiểm tra như module của web. Không sửa mã ứng dụng, database hoặc cơ chế xác thực đơn hàng.

## Kiểm chứng

- **21 kiểm tra cục bộ đạt**, chạy bằng `node qa-reports/botpress-guest-fix-2026-11-09/regression.cjs`. Các kiểm tra dùng HTTP mock trên snapshot 145 sản phẩm; giá biến thể của fixture được đặt theo giá sản phẩm, không dùng fixture làm chứng cứ giá thật.
- Đã chạy trên **Emulator với truy vấn catalog thật**: G01, chuỗi G02 chọn rẻ nhất và tham chiếu mẫu đó, G03, G04, G05, G07, G08, G09, G10, G11, G12. Không thấy lỗi action trong các lượt được ghi nhận.
- Sau đó bấm **Publish changes**. Studio chuyển từ “Publishing in progress...” sang **“Last published — 4 seconds ago / Your bot is live!”**.
- Đã tải lại website và kiểm tra trong phiên guest. Bằng chứng production mới từ khoảng **10:07–10:12 ICT** cho thấy phản hồi mới đã có hiệu lực.

| Case | Kết quả sau sửa trên production |
|---|---|
| G01 | Hỏi sơ mi hay áo thun, nam hay nữ và ngân sách/size; không còn tuyên bố 95 mẫu phù hợp đi làm. Thẻ gợi ý Basic vẫn có thể hiển thị trước câu làm rõ. |
| G02 | Trả tổng **8 mẫu áo len nữ ≤400.000đ**, hiển thị giá, biến thể M còn hàng và chất liệu; nêu giới hạn về độ mềm/đi làm. Nhánh chọn rẻ nhất và hỏi “mẫu đó” đã kiểm tra trong Emulator, chưa chạy lại riêng trên production. |
| G03 | Trong cùng hội thoại G02, đổi sang **Be/Nâu, M còn 20**; vẫn giữ áo len nữ và ngân sách. Câu trả lời đầy đủ được lưu trong transcript G04 vì lúc chụp riêng G03 mới nhận được thẻ, phần text đến sau. |
| G04 | Bỏ tiêu chí áo len/nữ, trả đúng tổng **7 mẫu áo thun nam đen/M dưới 250.000đ**; hiển thị 5/7 và còn 2. |
| G05 | Daily giá **219.000đ**; câu nối trả đúng **Đen/M còn 20, giá biến thể 219.000đ**. |
| G06 | Thẻ áo len nữ màu kem Basic có ảnh tải thành công, tên, giá 329.000đ và `href` sản phẩm đúng domain. Chỉ đọc thuộc tính, không mở link. |
| G07 | Trả đúng **7 mẫu**, liệt kê đủ tên, giá, màu Đen, size M, tồn 20 của từng mẫu; không còn báo 0. |
| G08 | Không bịa SKU; nói không tìm thấy mẫu và hỏi loại sản phẩm để tìm thay thế. Chưa kiểm tra lượt trả lời loại sản phẩm sau câu làm rõ này. |
| G09 | Nhận ra giá mâu thuẫn; sau sửa trần 300.000đ trả **23 mẫu**, hiển thị 5/23 và còn 18. |
| G10 | Hỏi rõ loại sản phẩm sau “đẹp nhất”; khi áo nữ khoảng 300.000đ không có kết quả, hỏi nới ngân sách hoặc unisex. Lượt bổ sung màu đen giữ lời làm rõ ngân sách, không trả sản phẩm sai nhóm. |
| G11 | Lượt hỏi đơn bằng email QA giả vẫn lặp lời chào có hướng dẫn đăng nhập; lượt hỏi đơn sau tư vấn bị chặn bằng yêu cầu xác thực. Lượt tư vấn xen giữa nay trả **8 mẫu áo len kem**. Không thấy dữ liệu đơn bị lộ ở UI. **Chưa nghiệm thu backend ownership/auth.** |
| G12 | Tách hai nhóm bằng câu hỏi làm rõ; chọn nhóm chồng và đổi XL trả đúng **15 mẫu nam Đen/XL**, biến thể hiển thị còn 20; thông báo **5/15, còn 10**. |

**Kết luận:** 5 case Fail ở lượt trước (G02/G03/G04/G07/G08) đã được xử lý ở các lượt tái kiểm thử nêu trên. Các case Partial về giá/tồn, số lượng và câu hỏi làm rõ đã cải thiện. Không kết luận toàn bộ hệ thống hoặc phân quyền backend đã đạt chỉ từ các kết quả này; G11 còn giới hạn nghiệm thu và vẫn dùng lời chào chung ở yêu cầu đơn đầu tiên.

## Bằng chứng và cách tái lập

- [Báo cáo trước sửa](./Botpress-guest-advanced-production-run-2026-11-09.md).
- [Snapshot sản phẩm và biến thể](./guest-catalog-2026-11-09.json).
- [Hội thoại Emulator](./botpress-guest-fix-2026-11-09/emulator-evidence.json).
- [Hội thoại và thẻ production sau publish](./botpress-guest-fix-2026-11-09/production-evidence.json).
- [Kết quả kiểm tra cục bộ](./botpress-guest-fix-2026-11-09/local-regression-results.json) và [script tái kiểm tra](./botpress-guest-fix-2026-11-09/regression.cjs).
- [Search trước](./botpress-guest-fix-2026-11-09/search.before.ts.txt) / [sau](./botpress-guest-fix-2026-11-09/search.after.ts.txt); [response trước](./botpress-guest-fix-2026-11-09/response.before.ts.txt) / [sau](./botpress-guest-fix-2026-11-09/response.after.ts.txt).

Kiểm tra cục bộ bổ sung bao gồm một biến thể Đen/M hết hàng trong khi màu/size khác còn hàng, hiển thị hết hàng khi không lọc chỉ hàng còn, lỗi dịch vụ không biến thành khẳng định 0 sản phẩm và không kế thừa truy vấn từ conversation khác. Không sửa stock thật để tạo fixture.

Các khoảng thời gian trong JSON là thời gian thao tác tới lúc đọc được phản hồi, không phải SLA server. Một số lượt runner cũ timeout vì chờ `Conversation Ended` trong khi nhánh Orders dừng ở `Waiting for User Input`, hoặc do polling theo khung hình của tab; đã đọc lại nội dung UI độc lập trước khi kết luận. Nút Restart sau reload có lúc không thao tác ổn định, nên một số conversation được khởi tạo bằng API công khai `window.botpress.restartConversation()`; mọi câu hỏi production vẫn được nhập qua `Message Input`, phản hồi được đọc từ Webchat DOM. Không tạo/sửa/hủy đơn, không dùng dữ liệu khách thật, không lưu token/cookie.
