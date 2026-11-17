# Báo cáo kiểm thử luồng Auth trên Production

- **Ngày chạy:** 16/11/2026 (UTC+7)
- **Website:** https://tiem-mua-cham-store.vercel.app
- **Tài khoản:** phiên đã đăng nhập hiển thị `ducvumpi3107`, vai trò Thành viên
- **Tác động:** chỉ điều hướng và đọc dữ liệu hiện có; không sửa hồ sơ, không đặt hàng, không đăng xuất.

## Kết quả

| ID | Ca kiểm thử | Kết quả | Quan sát |
|---|---|---|---|
| A01 | Nhận diện phiên đăng nhập ở trang chủ | **Pass** | Header hiển thị tài khoản `ducvumpi3107` và menu thành viên thay cho Đăng nhập/Đăng ký. |
| A02 | Truy cập hồ sơ `/info` | **Pass** | Trang hồ sơ tải được, nhận diện email `ducvumpi3107@gmail.com`; trường hồ sơ hiển thị ở chế độ đọc. |
| A03 | Truy cập đơn mua `/orders` | **Pass** | Trang tải được và hiển thị 2 đơn; không thao tác trên đơn. |
| A04 | Truy cập danh sách yêu thích `/wishlist` | **Pass** | Trang tải được và hiển thị trạng thái rỗng đúng khi tài khoản chưa có sản phẩm yêu thích. |
| A05 | Mở `/auth/login` khi đã đăng nhập | **Partial** | Phiên vẫn đăng nhập nhưng trang vẫn hiển thị form đăng nhập thay vì chuyển về trang khác. Chưa thử gửi form để tránh ảnh hưởng tài khoản. |
| A06 | Mở `/auth/register` khi đã đăng nhập | **Partial** | Trang đăng ký vẫn hiển thị trong khi header còn trạng thái đăng nhập. Không gửi form. |
| A07 | Mở `/settings` từ menu hồ sơ | **Fail** | URL trả 404, dù menu hồ sơ có liên kết “Cài đặt” tới `/settings`. |
| A08 | Duy trì phiên khi chuyển route | **Pass** | Tên tài khoản vẫn hiển thị trên hồ sơ, đơn mua, wishlist, login và register; phiên không bị mất khi điều hướng. |
| A09 | Trạng thái đăng nhập trong chatbot | **Partial** | Trong widget xuất hiện cả lời chào guest yêu cầu đăng nhập để tra đơn và lời chào có nút “Xem đơn hàng”. Có thể là lịch sử guest được giữ lại sau đăng nhập. |

## Kết luận

Phiên auth hợp lệ và truy cập được hồ sơ, đơn mua, wishlist. Lỗi rõ nhất là liên kết `/settings` trả 404. Nên cân nhắc chuyển người dùng đã đăng nhập khỏi trang login/register và đồng bộ lại trạng thái chatbot để không hiển thị lời chào guest cũ.

**Giới hạn:** không kiểm thử submit login/register, đổi mật khẩu, cập nhật hồ sơ, logout hoặc tra cứu đơn bằng chatbot để tránh thay đổi tài khoản và dữ liệu.
