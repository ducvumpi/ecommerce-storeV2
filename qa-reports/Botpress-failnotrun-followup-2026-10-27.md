
### Tái kiểm thử sau khi đăng nhập storefront thật — 27/10/2026

Giao diện local xác nhận trạng thái đăng nhập (hiện tên tài khoản và mục Đăng xuất). Trong cùng hội thoại, đã gửi `auth: Tìm áo len nữ size L dưới 350.000đ`. Bot trả đúng 4 mẫu cùng giá như snapshot catalog và giữ điều kiện size L/ngân sách. **Pass** cho truy vấn sản phẩm ở phiên storefront đã đăng nhập. Lượt này không truy xuất đơn hàng.

Lượt auth trước đó khi giao diện còn đăng xuất vẫn giữ là **Security Fail — High / cần xác minh**: một event auth do client gửi đã dẫn đến phản hồi có 5 tóm tắt đơn hàng. Chưa đối chiếu quyền sở hữu các đơn này với tài khoản đã đăng nhập, nên chưa thể kết luận đó là dữ liệu đúng chủ hay truy cập chéo. Cần kiểm tra log workflow và đối chiếu trong trang Đơn mua của đúng tài khoản; không thử user ID khác.

### Tái kiểm thử tiếp theo — bị gián đoạn, 27/10/2026

Sau khi đăng nhập storefront, đã xác nhận header hiển thị người dùng đang đăng nhập. Trước khi gửi input mới, dev server dừng hai lần; widget khởi tạo conversation mới và chỉ còn lời chào. Conversation ID hiện tại khác ID của phiên auth trước (đã thấy qua `window.botpress.conversationId`), nên không gửi tiếp để tuân thủ yêu cầu giữ nguyên một hội thoại. Ca tiếp theo được ghi **Not Run / Blocked bởi mất phiên và local server không ổn định**; không tính là Fail của chatbot.

## Khắc phục khẩn nhánh Orders trong Botpress draft — 27/10/2026

Đã mở workflow `Orders` sau khi Studio tải được. Xác nhận node `chitiet_donhang` trước đó dùng `env.SUPABASE_SERVICE_KEY` (`service_role`) để gọi REST `/orders?user_id=eq.${user.userId ?? workflow.userId}`. `userId` được truyền qua danh tính hội thoại; đây không phải xác thực server-side. Điều này xác nhận **Security Fail High** có đường truy vấn nguy hiểm cụ thể, không chỉ là suy đoán từ phản hồi chat.

Đã sửa code card của node `chitiet_donhang` trong **Botpress draft** thành fail-closed: không gọi Supabase, không dùng service key, chỉ đặt `workflow.orderDetailText` thành thông báo tính năng tra cứu đơn tạm khóa và hướng khách tới trang Đơn mua. Code draft hiện gồm:

```ts
const wf = workflow as any
wf.orderDetailText = "Tính năng tra cứu đơn hàng đang tạm khóa để bảo vệ thông tin tài khoản. Vui lòng xem đơn trong mục Đơn mua của cửa hàng."
workflow.orderDetailText = wf.orderDetailText
```

Studio đóng code editor và canvas hiển thị lại card `chitiet_donhang` với thay đổi, nên nội dung đã được áp dụng vào draft. Chưa publish và chưa chạy kiểm thử workflow sau thay đổi; do đó live bot chưa được khắc phục cho đến khi draft được publish. Menu “Xem đơn hàng” có thể vẫn xuất hiện, nhưng node không còn truy vấn dữ liệu sau khi bản draft được publish.

**Điều kiện hoàn tất bảo mật:** xây dựng endpoint server-side xác minh Supabase JWT từ phiên người dùng, chỉ truy vấn `orders.user_id` khớp `sub` đã xác minh, rồi mới bật lại tính năng. Không đưa service role key hay dữ liệu định danh do client tự khai vào điều kiện phân quyền. Trước khi publish bản tạm khóa, cần xác nhận vì nó tạm thời vô hiệu hóa tra cứu đơn hàng trên chatbot; sau đó kiểm thử guest giả mạo auth và auth hợp lệ bằng account QA.

### Endpoint xác thực server-side cho tra cứu đơn — 27/10/2026

Đã thêm `GET /api/chat/orders` trong ứng dụng Next.js. Endpoint ưu tiên session cookie được Supabase xác minh; với browser session dùng access token, token chỉ được gửi trong `Authorization: Bearer ...` tới chính origin của cửa hàng rồi xác minh bằng `supabase.auth.getUser(token)`. Không đọc email/userId từ body, query string hay event Botpress. Truy vấn dùng anon key và thêm điều kiện `orders.user_id = user.id` đã xác minh; phản hồi giới hạn 10 đơn gần nhất, chỉ gồm mã đơn, ngày, trạng thái, thanh toán và tóm tắt mặt hàng, không gồm địa chỉ/điện thoại.

Đã thêm helper phía browser để lấy access token từ Supabase session và gọi endpoint. **Kiểm tra:** `npx.cmd tsc --noEmit` thành công; request guest không có session trả `401`; Bearer giả mạo cũng trả `401`. Trong trình duyệt local, giao diện vẫn hiển thị tên tài khoản nhưng không có session Supabase hợp lệ để chứng minh nhánh auth, nên kiểm thử auth hợp lệ được ghi **Not Run** (không coi trạng thái UI/persisted userId là bằng chứng đăng nhập). Chưa kết nối helper vào luồng Botpress và chưa publish; node Orders trong Botpress vẫn fail-closed. Cần đăng nhập Supabase thật để xác minh endpoint trả đúng đơn thuộc chính tài khoản trước khi bật tích hợp.

### Kiểm tra RLS trực tiếp trên Supabase production — 27/10/2026

Trong Supabase Dashboard → Database → Policies đã xác nhận RLS đang bật nhưng các policy sau áp dụng role `public`, command `ALL`, điều kiện `USING (true)`: `orders`, `order_items`, `addresses`, và `profiles`. Điều đó không giới hạn bản ghi theo người đăng nhập; `addresses` chứa thông tin liên hệ/địa chỉ. Trên `profiles` còn có `Allow anon read profiles` (`SELECT`, `anon`, `true`) và policy `admin_all` cho `public` dùng `user_metadata.role = 'admin'` làm một trong các điều kiện. Supabase Advisor cũng đánh dấu vấn đề dùng user metadata cho phân quyền là **CRITICAL**.

Đã chạy transaction `READ ONLY` với role PostgreSQL `anon`, chỉ truy vấn `count(*)` rồi rollback: anon nhìn thấy **40 dòng orders** và **25 dòng addresses**; `order_items` hiện có 0 dòng. Không đọc/ghi dữ liệu đơn hoặc địa chỉ trong phép xác minh. Kết quả xác nhận lỗ hổng public read trên production đang có dữ liệu.

Đây là **Security Fail — Critical**, riêng biệt với lỗi Botpress. Không thay policy production trong lượt này vì phải giữ các luồng tạo/cập nhật đơn, đăng ký và địa chỉ hoạt động; chưa lập đủ ma trận quyền cho các thao tác đó. Hướng sửa: bỏ các policy `ALL/public/true`, chuyển sang chính sách theo `authenticated` và `auth.uid()` (order_items kiểm tra quyền sở hữu qua orders, addresses qua `user_id`), giới hạn hồ sơ vào bản ghi của chính user, và chỉ dùng `app_metadata` hoặc bảng role do máy chủ quản lý cho admin. Sau khi có policy cụ thể, chạy guest/auth checks và test checkout/cancel trước khi bật lại tra cứu chatbot.

## Cập nhật xử lý lỗ hổng production — 27/10/2026

Phần ghi chú ở trên phản ánh trạng thái trước khi remediation. Sau đó đã áp dụng policy RLS theo chủ sở hữu trên Supabase production và xác minh bằng role `anon`: `orders`, `order_items`, `addresses`, `profiles` đều trả 0 dòng. Checkout RPC có guard so khớp `p_user_id` với `auth.uid()`; anon không có quyền EXECUTE, authenticated có quyền. Chi tiết test và giới hạn còn lại được cập nhật trong [Botpress-QA-report.md](./Botpress-QA-report.md).
