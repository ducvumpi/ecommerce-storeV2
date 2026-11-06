# Kết quả kiểm thử luồng auth Botpress trên production — 05/11/2026

**Môi trường:** https://tiem-mua-cham-store.vercel.app/  
**Bot:** Friendly Duck / Trợ lý Nai Tiệm Mùa Chậm  
**Kế hoạch:** [Kế hoạch kiểm thử hai luồng guest/auth](./Botpress-chat-guest-auth-test-plan-2026-11-05.md)  
**Tham chiếu:** [Kế hoạch kiểm thử thesis production](./Botpress-thesis-production-run-2026-11-02.md)  
**Thời gian:** khoảng 16:24–16:29 ICT, 05/11/2026.  
**Phiên:** storefront hiển thị tài khoản đã đăng nhập; một conversation mới dùng cho toàn bộ case khả thi.  
**Phạm vi an toàn:** chỉ đọc thông tin đơn; không tạo/sửa/hủy đơn, không đăng xuất, không click link sản phẩm. Không lưu token, cookie, email, conversation ID hoặc ID đơn.

## Tổng hợp

| Trạng thái | Số case |
|---|---:|
| Pass | 5 |
| Partial | 1 |
| Fail | 0 |
| Blocked | 2 |
| Not Run | 2 |

Các kết quả Pass/Partial dưới đây là quan sát UI production. Chưa đối chiếu API/trace độc lập, nên không kết luận về phân quyền backend ngoài những gì thấy trong phản hồi chat. ID đơn được lược bỏ.

## Kết quả chi tiết

| Case | Trạng thái | Kết quả production |
|---|---|---|
| A01 — trạng thái auth | **Pass** | Storefront hiển thị trạng thái tài khoản đăng nhập; chatbot mở conversation mới với lời chào thông thường. Không ghi danh tính tài khoản vào báo cáo. |
| A02 — hỏi đơn tự nhiên | **Pass (UI)** | `Tôi đã đăng nhập, cho tôi xem các đơn hàng gần đây` → 2 đơn ngày 27/10/2026; trạng thái `completed` và `packing`; tổng lần lượt 349.000₫ và 309.000₫. Nội dung sản phẩm có hiển thị trong chat; ID đơn không ghi lại. |
| A03 — hỏi trạng thái đơn gần nhất bằng ngôn ngữ tự nhiên | **Partial** | `Đơn gần nhất của tôi hiện đang xử lý đến đâu rồi?` được hiểu là ý định xem đơn, không chuyển sang lựa chọn/hủy đơn. Bot trả danh sách 2 đơn cùng trạng thái, trong đó có đơn mới nhất; chưa thu hẹp câu trả lời vào riêng đơn gần nhất. |
| A04 — tư vấn sản phẩm sau khi xem đơn | **Pass (UI)** | `Tư vấn giúp tôi áo len nữ màu trung tính, size M, dưới 400.000đ để đi làm` trả thẻ sản phẩm có tên, giá và link `Xem sản phẩm`. Không click link. |
| A05 — quay lại hỏi đơn sau tư vấn | **Pass (UI)** | `Còn đơn hàng của tôi thì sao? Cho xem lại các đơn gần đây` trong cùng conversation trả lại 2 đơn với trạng thái/tổng như trước. Không rơi về `user_choice` và không yêu cầu đăng nhập lại. |
| A06 — lặp lại tra cứu đơn 5 lần sau khi chuyển qua tư vấn | **Pass (UI)** | Sau A05, gửi thêm 4 câu tự nhiên riêng biệt yêu cầu kiểm tra đơn. Cả 4 lượt đều trả 2 đơn; không thấy lỗi phiên, không thấy luồng bị kẹt hoặc phản hồi trùng thứ hai. Tổng cộng có 5 lượt hỏi đơn sau tư vấn (A05 + 4 lượt lặp). |
| A07 — xác nhận refresh token sau thời gian dài | **Not Run** | Không chờ token hết hạn trong lượt kiểm thử này. Không ghi token hoặc thử bằng cách thay đổi phiên. |
| A08 — logout rồi hỏi đơn cùng conversation | **Blocked** | Không logout vì các tab storefront dùng chung phiên Supabase và báo cáo trước ghi nhận logout từng làm các tab cùng chuyển sang guest. Chưa xác nhận được browser/tài khoản này là môi trường QA cô lập. |
| A09 — đăng nhập lại sau logout | **Not Run** | Phụ thuộc A08; không thực hiện đăng xuất trong phiên dùng chung. |
| A10 — kiểm tra tách biệt QA-A/QA-B | **Blocked** | Không có tài khoản QA-B/fixture được xác nhận. Không thử truy cập chéo hoặc đoán ID đơn. |

## Kiểm tra link sản phẩm và tab

Thẻ tư vấn có `href` tới sản phẩm. Không click bất kỳ link nào. Sau kiểm thử, các page trong browser vẫn chỉ là storefront và Botpress Studio; không có trang sản phẩm mới được mở.

## Kết luận

Luồng auth production đạt các case UI chính: hỏi đơn tự nhiên, chuyển từ xem đơn sang tư vấn sản phẩm rồi quay lại xem đơn, và lặp lại yêu cầu xem đơn 5 lượt sau tư vấn. Không thấy bot trả về `user_choice` ngoài ý muốn trong chuỗi này. A03 Partial vì câu hỏi về “đơn gần nhất” nhận lại cả hai đơn. Các kiểm tra token hết hạn, logout trong cùng conversation và quyền sở hữu chéo cần môi trường/tài khoản QA cô lập; lượt này không xác nhận các nhánh đó. Không có link sản phẩm nào được mở.
