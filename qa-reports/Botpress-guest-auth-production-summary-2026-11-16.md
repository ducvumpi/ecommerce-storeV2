# Tổng hợp kiểm thử Guest và Auth trên Production

- **Ngày kiểm thử gần nhất:** 16/11/2026 (UTC+7)
- **Website:** https://tiem-mua-cham-store.vercel.app
- **Phạm vi:** luồng Guest 15 case và luồng Auth 9 case, kiểm thử giao diện production.
- **Kết quả gộp:** 16 Pass · 6 Partial · 2 Fail trên 24 lượt case.

## Luồng Guest — 15 case

**11 Pass · 3 Partial · 1 Fail**

- Pass: yêu cầu mơ hồ, lọc sản phẩm be/nâu, chọn sản phẩm rẻ nhất và link, đổi sang áo nam, tra cứu Daily và biến thể, đếm sản phẩm, xử lý giá mâu thuẫn, giữ ngân sách sau làm rõ, hỏi chọn giữa nhiều danh mục, link sản phẩm thứ hai, bộ lọc không có kết quả.
- Partial: đổi màu/size (M còn hàng nên chưa kiểm chứng fallback sang S); guest tra đơn bị chặn nhưng thông báo đồng bộ phiên chưa rõ; tư vấn phí vận chuyển chưa nêu mức phí/thời gian.
- Fail: SKU giả không hoàn tất tìm sản phẩm thay thế sau khi khách làm rõ loại hàng.

## Luồng Auth — 9 case

**5 Pass · 3 Partial · 1 Fail**

- Pass: nhận diện phiên trên trang chủ; mở hồ sơ; mở đơn mua (hiển thị 2 đơn); mở danh sách yêu thích; giữ phiên khi chuyển route.
- Partial: `/auth/login` và `/auth/register` vẫn hiển thị form khi đã đăng nhập; chatbot còn hiển thị lời chào guest cũ cùng lời chào đã đăng nhập.
- Fail: menu hồ sơ có link `/settings` nhưng route trả 404.

## Ưu tiên xử lý

1. Sửa link `/settings` đang dẫn tới 404.
2. Hoàn tất fallback sản phẩm thay thế cho SKU không tồn tại.
3. Đồng bộ trạng thái chatbot sau đăng nhập để không còn lời chào guest cũ.
4. Xem xét chuyển người dùng đã đăng nhập khỏi form login/register.
5. Bổ sung thông tin phí và thời gian vận chuyển; kiểm chứng fallback size S khi M hết hàng.

## Giới hạn

Kiểm thử chỉ đọc dữ liệu và điều hướng; không submit login/register, logout, cập nhật hồ sơ, tạo đơn hoặc thay đổi tồn kho. Kết quả tồn kho và số lượng sản phẩm được ghi nhận từ UI, chưa đối chiếu snapshot database. Các luồng Guest và Auth dùng trạng thái phiên khác nhau nên không suy ra kết quả của luồng này từ luồng kia.

Chi tiết: [báo cáo Guest](./Botpress-guest-advanced-production-run-2026-11-13.md) · [báo cáo Auth](./Botpress-auth-production-run-2026-11-16.md).
