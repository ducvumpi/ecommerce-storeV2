# Botpress workflow cần cấu hình cho Tiệm Mùa Chậm

Trạng thái: **đã cập nhật bản nháp trong Botpress Studio, chưa publish**. Bot xác nhận qua `botId=c91eaf04-af91-4bbc-9699-8e7ecd7e3f38` trong cấu hình website. Đã gắn workflow `Products` và `products_by_category` làm tools cho Autonomous node `Consult AI`, đồng thời thay instructions để buộc truy vấn dữ liệu, giữ bộ lọc qua ngữ cảnh, hạn chế tuyên bố không có nguồn và bảo vệ dữ liệu cá nhân. Không sửa code workflow/DB hoặc cấu hình deploy.

### Kiểm thử Emulator sau khi chỉnh (cùng một hội thoại)

- `Áo thun nam Basic và Daily có chất liệu gì?` — **Fail**: dữ liệu `productsJson` của workflow có `material: Cotton` cho các kết quả liên quan, nhưng Autonomous node trả lời chưa xác minh được vì không có thông tin chất liệu. Links trong phản hồi có URL hợp lệ. Đây là lỗi sử dụng/ưu tiên kết quả workflow trong Autonomous node; cần sửa cách phối hợp node/truyền dữ liệu, không thể xem prompt mới là đủ.
- Tiếp theo `Áo len nữ dưới 350.000 size L còn mẫu nào?` — **Pass có giới hạn**: gọi `products_by_category`, trả đúng Basic 329.000đ và Daily 349.000đ, cả hai có size L; hai URL `/women/...` hợp lệ. Chứng minh nhánh danh mục được gọi trong hội thoại tiếp nối.
- Đã xác nhận câu trả lời còn lại của lượt đầu chứa sản phẩm/variant dư do query không lọc đầy đủ theo intent; vì vậy không kết luận toàn workflow đã đạt.

Các thay đổi chỉ nằm trong draft Botpress Studio và chưa có bằng chứng publish/deploy. Giữ trạng thái chưa nghiệm thu cho tới khi sửa lỗi F03, thử lại các ca Fail khác và kiểm tra đủ phân quyền.

## Thay đổi dự kiến trong Studio

1. Giữ các trigger `guest`/`auth` hiện có, xem lại Main Workflow trước khi sửa. Bảo đảm mỗi tin nhắn người dùng chỉ kích hoạt **một** đường trả lời; câu hỏi đầu tiên phải được xử lý ngay cả khi bot gửi lời chào.
2. Tạo/điều chỉnh nhánh `Tìm sản phẩm`: trích xuất các bộ lọc `gender`, `category`, `maxPrice`, `minPrice`, `size`, `color`, `inStock` thành biến hội thoại. Bộ lọc nào người dùng đổi thì cập nhật bộ lọc đó; khi họ chuyển từ áo nam sang áo nữ, thay danh mục/giới tính cũ. Khi người dùng nói về hai người, lưu hai bộ tiêu chí riêng. Nếu “mẫu đó” có nhiều tham chiếu khả dĩ, hỏi chọn mẫu.
3. Cho nhánh sản phẩm truy vấn dữ liệu có cấu trúc từ `products` và `product_variants`, trả về `id`, `name`, `slug`, `gender_id`, `category_id`, `base_price`, `material`, `size`, `color`, `stock` và thời điểm đọc. Lọc bằng dữ liệu thật, đếm theo product ID, không để LLM tự tính tập sản phẩm. Thông tin tồn kho phải lấy từ đúng tổ hợp sản phẩm/màu/size; khi truy vấn lỗi, nói rõ chưa xác minh được.
4. Dựng URL sản phẩm từ `slug` và tuyến đường ứng dụng (`/men/[slug]`, `/women/[slug]`) với một origin được cấu hình theo môi trường. Gửi **Card có URL action** hoặc Markdown `[Xem sản phẩm](https://...)` hợp lệ. Chặn câu “bấm vào link” nếu không có URL. Bỏ địa chỉ `localhost:3000` trong [BotpressChat.tsx](../src/app/components/ui/chatAI/BotpressChat.tsx) khi xử lý link danh mục trên production.
5. Trong Autonomous Node, chỉ dùng dữ liệu truy vấn cho giá, chất liệu, biến thể và tồn kho. Không tự nhận sản phẩm “bán chạy”, “thường hết hàng”, “chất lượng cao” hoặc tự đưa bảng size khi không có nguồn. Hỏi thêm chiều cao/cân nặng và mẫu áo nếu khách muốn chọn size, rồi dùng bảng size chính thức khi có.
6. Nhánh đơn hàng và dữ liệu khách phải kiểm tra danh tính ở **backend**. Event `auth` do trình duyệt gửi trong [BotpressChat.tsx](../src/app/components/ui/chatAI/BotpressChat.tsx) không được dùng làm bằng chứng phân quyền vì dữ liệu phía client có thể bị giả mạo. Tạm thời không trả PII hoặc trạng thái đơn nếu chưa có API kiểm quyền.

Botpress hiện hỗ trợ Workflow gồm các Node, Autonomous Node có thể dùng Action và Knowledge Base, còn Standard Node có Send Message Card. Action `url` của Card dùng `value` làm URL; biến bí mật nên đặt trong Configuration Variables. Tham khảo: [Workflows](https://botpress.com/docs/studio/concepts/workflows/), [Autonomous Node](https://botpress.com/docs/studio/concepts/nodes/autonomous-node/), [Send Messages](https://botpress.com/docs/studio/concepts/cards/send-messages/), [Configuration Variables](https://botpress.com/docs/studio/concepts/variables/scopes/configuration/).

## Tiêu chí nghiệm thu sau khi áp dụng

- F05: click link Daily mở đúng trang sản phẩm, không ra tab trắng; DOM có URL hợp lệ.
- F03: Basic và Daily đều trả chất liệu Cotton từ DB.
- C04: dưới 350.000đ, size L thấy áo len nữ Basic 329.000đ và Daily 349.000đ nếu tồn kho tại thời điểm test vẫn dương; sau khi đổi sang áo nam, ngân sách và size mới được giữ.
- C05: nhu cầu cho em gái dùng sản phẩm nữ size S dưới 400.000đ khi có hàng, không ép sang unisex.
- F02: khi yêu cầu màu đen/size M/còn hàng, chỉ xác nhận tồn kho từ đúng bản ghi variant.
- S03/S04: dùng tài khoản và đơn hàng QA để chứng minh guest hoặc tài khoản khác không thể xem thông tin đơn.

Chạy lại các ca Fail trong [báo cáo QA](./Botpress-QA-report.md) ở Emulator và trên Webchat local trước khi publish workflow.
