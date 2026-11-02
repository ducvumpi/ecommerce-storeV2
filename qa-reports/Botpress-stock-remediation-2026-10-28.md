# Sửa phản hồi tồn kho Botpress — 28/10/2026

Bot: `c91eaf04-af91-4bbc-9699-8e7ecd7e3f38` (Friendly Duck). Thay đổi được thực hiện trong bản nháp Botpress Studio. Trạng thái publish cần xác nhận riêng.

## Nguyên nhân xác nhận trong Emulator

Với câu `Áo thun nam Daily màu đen size M còn hàng không?`, luồng đi qua `Consult AI → API_sanpham → AI_talk → Autonomous`. Action `API_sanpham` đã truy vấn `product_variants`, nhưng Autonomous gọi tiếp `products_by_category` chỉ với `áo thun nam Daily`, làm rơi điều kiện màu đen và size M. Bot trả rằng chưa xác nhận được tồn kho, dù biến thể Đen/M trong dữ liệu có stock 20. Lượt này còn dẫn link slug Daily có chữ `trang`; đây là slug của sản phẩm nhiều màu trong catalog, không phải bằng chứng link sai sản phẩm.

## Thay đổi bản nháp

- Đổi instructions của Autonomous trong `Consult AI`: dùng `workflow.productsText` và `workflow.productsJson` do `API_sanpham` vừa truy vấn, đối chiếu cùng sản phẩm/màu/size trước khi nói còn hàng và không gọi workflow khác.
- Gỡ hai workflow tools `Products` và `products_by_category` khỏi Autonomous trong `Consult AI` để không truy vấn vòng hoặc mất bộ lọc.
- Trong action `Product Search and Filtering for E-commerce Platform`, bỏ điều kiện truy vấn `stock > 0` để giữ cả biến thể hết hàng; tính `inStock` bằng `some(variant.stock > 0)`; đổi nhãn hiển thị thành `Tình trạng các biến thể`.

## Tái kiểm thử Emulator

| Ca | Kết quả |
|---|---|
| Daily Đen/M | Trả còn **20 chiếc**, giá 219.000đ; luồng không gọi `products_by_category`. |
| Daily Tím/M | Trả không có biến thể màu tím size M; nêu các màu có size M. |
| Áo thun nam Đen/M, dưới 250.000đ, còn hàng | Trả 7 sản phẩm theo ID, mỗi biến thể Đen/M còn 20; không gọi `products_by_category`. |
| Daily Đen/M sau cập nhật action cuối | Trả **20 chiếc**; không gọi `products_by_category`. |

Snapshot catalog ngày 26/10 có 1.741 biến thể và **0 biến thể stock=0**. Vì vậy phần xử lý hết hàng đã được sửa theo mã action nhưng chưa có fixture để kiểm thử hành vi thực tế. Kết quả Emulator xác nhận bản nháp, không tự chứng minh bot production đã được publish.
