# Kết quả chạy Auth test case — 20/11/2026

- **Kế hoạch:** [Botpress-thesis-test-cases-v2-2026-11-20.md](./Botpress-thesis-test-cases-v2-2026-11-20.md)
- **Môi trường:** production — `https://tiem-mua-cham-store.vercel.app`
- **Phiên:** tài khoản đang đăng nhập; header hiển thị trạng thái Thành viên.
- **Tác động:** chỉ đọc trang và hội thoại; không sửa hồ sơ/giỏ hàng/đơn, không logout.

## Kết quả theo case

| Case | Kết quả | Quan sát |
|---|---|---|
| A01 — Nhận diện phiên | Pass | Header hiển thị tài khoản và menu Thành viên. |
| A02 — Trang hồ sơ | Partial | `/info` tải và hiển thị email phiên, nhưng phần lớn trường hồ sơ trống, tên phụ hiển thị “Người dùng”; console báo ngày sinh không hợp định dạng `yyyy-MM-dd`. |
| A03 — Trang đơn mua | Pass | `/orders` tải 2 đơn; API có credentials trả HTTP 200/2 đơn. Không lưu chi tiết định danh đơn trong báo cáo. |
| A04 — Wishlist | Pass | `/wishlist` truy cập được và hiển thị trạng thái chưa có sản phẩm yêu thích. |
| A05 — Mở trang login khi đã đăng nhập | Partial | `/auth/login` vẫn hiển thị form login trong khi header vẫn nhận diện phiên Thành viên. Không submit form. |
| A06 — Mở trang register khi đã đăng nhập | Partial | `/auth/register` vẫn hiển thị form đăng ký trong khi header vẫn nhận diện phiên Thành viên. Không submit form. |
| A07 — Route settings | **Fail** | Menu “Cài đặt” dẫn tới `/settings`, trang trả 404. |
| A08 — Giữ phiên qua route | Pass | Tài khoản vẫn được nhận diện khi chuyển giữa trang chủ, đơn mua, wishlist, hồ sơ, login/register và settings 404. |
| A09 — Auth trong chatbot | Pass | Conversation có greeting auth kèm nút xem đơn. Tra đơn thành công; sau khi tư vấn sản phẩm, hỏi đơn lần nữa vẫn trả dữ liệu đơn của phiên hiện tại. |
| I01 — Đồng bộ UI/chat identity | Partial | UI thể hiện trạng thái auth và greeting có nút đơn hàng; chưa có Botpress trace để xác minh event/subject routing. |
| I03 — Đọc đơn đúng chủ | Partial | Cùng phiên có 2 đơn qua API và chatbot trả đơn gần nhất phù hợp với trang đơn; tài khoản hiện tại không phải fixture AUTH-A được chỉ định trong kế hoạch nên chưa chứng nhận kiểm soát subject theo fixture. |
| I04 — Cách ly AUTH-A/AUTH-B | Blocked | Không có tài khoản QA-B độc lập và browser context thứ hai. |
| I05 — Logout trong cùng conversation | Not run | Không đăng xuất phiên tài khoản đang dùng. |
| I06 — Cart API/variant | Blocked | Cần AUTH-A và cart fixture trên staging; không tạo thay đổi giỏ hàng production. |
| I07 — Lỗi API/fault injection | Blocked | Cần staging để mô phỏng lỗi/timeout. |
| I08 — Chuyển intent | Pass | Trong cùng conversation: order → product consultation → order; cả hai intent xử lý đúng, phiên auth vẫn được giữ. |
| I10 — Cách ly dữ liệu/prompt injection | Blocked | Cần fixture tài khoản thứ hai và trace/backend evidence. |

## Kết luận

Phiên auth hiện tại truy cập được wishlist và đơn hàng; chatbot cũng chuyển intent đơn hàng/sản phẩm trong cùng conversation. Hai vấn đề cần ưu tiên là `/settings` trả 404 và hồ sơ chưa điền đủ trường. Login/register vẫn hiển thị form khi đã đăng nhập; chưa submit để tránh thay đổi trạng thái tài khoản. Cách ly chéo và logout chưa kiểm thử do không có fixture riêng và đây là phiên tài khoản đang dùng.
