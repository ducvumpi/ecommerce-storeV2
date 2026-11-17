# Bộ 9 sơ đồ luận văn chatbot Botpress

**Đề tài:** Nghiên cứu thiết kế và tích hợp chatbot hội thoại dựa trên nền tảng Botpress nhằm nâng cao trải nghiệm người dùng trong thương mại điện tử.

**Bản vẽ Figma/FigJam:** [Luận văn Botpress · 9 sơ đồ nghiên cứu và hệ thống](https://www.figma.com/board/V5Y7U6l0ESGrVqdG4tjpBB). Các đối tượng và đường nối trên bảng có thể chỉnh sửa. Chín sơ đồ được đặt theo thứ tự từ trái sang phải trên cùng một bảng.

| STT | Tên hình đề xuất khi đưa vào luận văn | Nội dung chính | Vị trí dùng trong luận văn |
| --- | --- | --- | --- |
| 01 | Quy trình nghiên cứu, thiết kế, tích hợp và đánh giá chatbot | Từ xác định vấn đề đến kiểm thử, đánh giá người dùng và cải tiến lặp | Chương phương pháp nghiên cứu |
| 02 | Khung nghiên cứu về tác động của chatbot đến trải nghiệm người dùng | Năng lực chatbot, chỉ số tương tác, biến trải nghiệm và biến kiểm soát | Chương cơ sở lý thuyết / mô hình nghiên cứu |
| 03 | Sơ đồ Use Case của hệ thống chatbot thương mại điện tử | Khách vãng lai, khách đăng nhập, quản trị viên và các chức năng tương ứng | Chương phân tích yêu cầu |
| 04 | Kiến trúc tích hợp website, Botpress và Supabase | Next.js/Vercel, Webchat, Botpress Cloud, Supabase Auth, dữ liệu sản phẩm và đơn hàng | Chương thiết kế hệ thống |
| 05 | Luồng hội thoại tư vấn sản phẩm và tra cứu đơn hàng | Nhận diện guest/auth, lọc sản phẩm, 0/1/nhiều kết quả, kiểm soát truy cập đơn hàng | Chương thiết kế hội thoại |
| 06 | Sơ đồ tuần tự của hai kịch bản tư vấn sản phẩm và tra cứu đơn hàng | Tương tác giữa người dùng, website, Webchat, Botpress và API | Chương thiết kế hệ thống |
| 07 | Sơ đồ luồng dữ liệu mức 1 của chatbot | Luồng câu hỏi, kết quả sản phẩm, xác thực và dữ liệu đơn hàng | Chương thiết kế dữ liệu |
| 08 | Sơ đồ triển khai của hệ thống | Trình duyệt, Vercel, Botpress Cloud và Supabase Cloud | Chương triển khai |
| 09 | Mô hình đề xuất đánh giá trải nghiệm người dùng | Tác vụ, chỉ số khách quan/chủ quan và phân tích so sánh | Chương đánh giá |

## Căn cứ từ hệ thống hiện tại

- Website là ứng dụng Next.js; thành phần `src/app/components/ui/chatAI/BotpressChat.tsx` nhúng Botpress Webchat, gửi ngữ cảnh guest/auth và duy trì hội thoại.
- API `src/app/api/chat/profile/route.ts` xác thực phiên người dùng; `src/app/libs/chatOrderToken.ts` cấp token tra cứu đơn hàng có thời hạn; `src/app/api/chat/orders/route.ts` giới hạn truy vấn theo `user_id`.
- Botpress Studio có các workflow Main, Identify User, Products, Consult AI và Orders. Luồng tư vấn truy vấn danh mục/biến thể rồi trả kết quả sản phẩm; luồng đơn hàng phụ thuộc xác thực.
- Dữ liệu Supabase được mô hình hóa ở mức khái quát bằng sản phẩm, danh mục, biến thể, hồ sơ xác thực và đơn hàng.

## Lưu ý khi sử dụng trong luận văn

1. Sơ đồ 01, 02 và 09 là **quy trình/khung đánh giá đề xuất**, không phải bằng chứng rằng đã thu thập dữ liệu người dùng hoặc chứng minh tác động nhân quả.
2. Sơ đồ 03–08 mô tả cấu trúc và luồng nghiệp vụ chính. Các nhánh lỗi và mức độ hoàn thiện thực tế cần đối chiếu với báo cáo kiểm thử guest/auth mới nhất trước khi viết phần kết quả thực nghiệm.
3. Carousel nhiều kết quả trong bản production có giới hạn số thẻ hiển thị; không diễn giải sơ đồ 05 thành cam kết rằng mọi sản phẩm truy vấn được đều có thẻ ảnh trên cùng một lượt trả lời.
4. Khi chèn vào DOCX, nên xuất từng sơ đồ riêng từ FigJam ở độ phân giải đủ lớn và giữ nguyên chú thích hình tương ứng trong bảng trên.
