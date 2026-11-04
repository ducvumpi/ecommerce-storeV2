# Báo cáo kiểm tra lại và sửa lỗi Botpress guest production — 03/11/2026

## Phạm vi

- Bot: Friendly Duck, workflow `Consult AI`.
- Kiểm tra qua Emulator của Botpress Studio và webchat production dạng shareable, không tác động phiên đăng nhập storefront.
- Kiểm tra Supabase trong lượt này không phát sinh thao tác ghi dữ liệu.

## Thay đổi đã triển khai

Regex nhận diện màu trong action tìm sản phẩm đã được sửa từ `trang` thành `trang(?!\s+san\s+pham)`. Mục đích là không diễn giải từ “trang” trong cụm “trang sản phẩm” thành màu trắng. Thay đổi đã được kiểm tra trong Emulator và publish thành công lên Botpress production.

Đã bổ sung nhánh nhận diện câu hỏi tổng quan danh mục: action đếm sản phẩm theo từng danh mục trong dữ liệu Supabase, rồi đưa tên danh mục và số lượng vào ngữ cảnh trả lời. Prompt được cập nhật để liệt kê danh mục từ dữ liệu thay vì coi đây là truy vấn tìm một sản phẩm. Yêu cầu link được đổi sang trả URL đầy đủ nguyên văn, không dùng Markdown link.

## Kết quả kiểm thử

| Ca | Câu hỏi / kiểm tra | Kết quả | Bằng chứng |
|---|---|---|---|
| R01 | Emulator: “Cho tôi link trang sản phẩm Áo blazer nữ Basic” | **Pass phần truy xuất** | `productCount = 1`; tìm thấy sản phẩm Basic và URL `https://tiem-mua-cham-store.vercel.app/women/phong-cach-nu-thanh-thi-collection-basic`. |
| R02 | Emulator: “Áo thun nam màu trắng” | **Pass** | Trả về 10 sản phẩm; regex vẫn nhận diện được yêu cầu màu trắng. |
| R03 | Production sau publish: “Cho tôi link sản phẩm Áo blazer nữ Basic” | **Partial — link chưa bấm được** | Bot trả đúng giá 599.000đ và URL `https://tiem-mua-cham-store.vercel.app/women/phong-cach-nu-thanh-thi-collection-basic`. Webchat render URL thành anchor nhưng thuộc tính `href` rỗng; không thể xác nhận điều hướng. |
| R04 | “Shop hiện đang bán những loại trang phục nào?” | **Pass — trả lời dữ liệu, cần cải thiện độ gọn** | Production trả về 29 tên danh mục, mỗi danh mục ghi nhận 5 sản phẩm. Có cả tên nhóm trang phục và tên bộ sưu tập/phong cách nên câu trả lời dài hơn mức cần thiết, dù không còn báo không tìm thấy. |

## Kết luận

- Lỗi nhận diện nhầm “trang sản phẩm” thành bộ lọc màu trắng đã được sửa và publish. Ca blazer trong Emulator tìm thấy đúng một sản phẩm; production sau publish cũng trả về tên sản phẩm thay vì thông báo không tìm thấy.
- Câu hỏi tổng quan danh mục đã được khắc phục và kiểm thử production; hiện bot lấy danh mục và số lượng từ dữ liệu thay vì báo không tìm thấy. Câu trả lời còn dài vì liệt kê cả các tên bộ sưu tập/phong cách.
- **Link production chưa sửa xong:** URL được trả về nhưng webchat vẫn tạo anchor không có `href`. Prompt-only không khắc phục được khác biệt giữa Emulator (có `href`) và webchat production (rỗng `href`).
- Studio chuyển sang trạng thái “Loading plugins” khi mở lại action carousel để điều tra cơ chế link dạng button; phần này chưa được chỉnh sửa hoặc publish.
- Không có thay đổi nào được thực hiện trên dữ liệu Supabase.
