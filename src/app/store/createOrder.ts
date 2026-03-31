import { supabase } from "@/app/libs/supabaseClient";
// import { CartItem } from "../cart/page";

// type CustomerInfo = {
//     fullName: string;
//     email: string;
//     phone: string;
//     cartID: string;
//     address: string;
//     city: string;
//     ward: string;
//     note: string;
// }

// // Tạo order và chèn order_items từ cart
// export const createOrder = async (customerInfo: CustomerInfo) => {
//     // 1️⃣ Lấy user đang đăng nhập
//     const { data: { user }, error: userError } = await supabase.auth.getUser();
//     if (userError || !user) throw new Error("Chưa đăng nhập");

//     // 2️⃣ Lấy cart của user
//     const { data: cart } = await supabase
//         .from("cart")
//         .select("id")
//         .eq("user_id", user.id)
//         .single();
//     if (!cart) throw new Error("Không tìm thấy cart");

//     // 3️⃣ Lấy cart_items và tính tổng tiền
//     const { data: cartItems } = await supabase
//         .from("cart_items")
//         .select("variant_id, quantity")
//         .eq("cart_id", cart.id);
//     if (!cartItems?.length) throw new Error("Giỏ hàng trống");

//     const totalPrice = cartItems.reduce((sum, item: any) => sum + (item.price ?? 0) * item.quantity, 0);

//     // 4️⃣ Insert địa chỉ
//     const { data: addressData, error: addressError } = await supabase
//         .from("addresses")
//         .insert({
//             user_id: user.id,
//             full_name: customerInfo.fullName,
//             phone: customerInfo.phone,
//             address_line: customerInfo.address,
//             city: customerInfo.city,
//             ward: customerInfo.ward,
//             mail: customerInfo.email,
//         })
//         .select("id")
//         .single();
//     if (addressError) throw addressError;
//     const addressId = addressData.id;

//     // 5️⃣ Insert order
//     const { data: orderData, error: orderError } = await supabase
//         .from("orders")
//         .insert({
//             user_id: user.id,
//             address_id: addressId,
//             total_price: totalPrice,
//             status: 'pending',
//             note: customerInfo.note,
//         })
//         .select("id")
//         .single();
//     if (orderError) throw orderError;
//     const orderId = orderData.id;

//     // 6️⃣ Insert order_items
//     const itemsToInsert = cartItems.map((item: any) => ({
//         order_id: orderId,           // FK → orders.id
//         variant_id: item.variant_id, // FK → product_variant.id
//         quantity: item.quantity,
//         price: item.price ?? 0
//     }));
//     console.log("Cart ID:", cart.id);
//     console.log("Cart items raw:", cartItems);
//     const { error: insertItemsError } = await supabase
//         .from("order_items")
//         .insert(itemsToInsert);
//     if (insertItemsError) throw insertItemsError;

//     return orderId;
// };
// export const insertOrderItemsFromCart = async (orderId: string, userId: string) => {
//     // 1️⃣ Lấy cart
//     const { data: cart, error: cartError } = await supabase
//         .from("cart")
//         .select("id")
//         .eq("user_id", userId)
//         .single();

//     if (cartError || !cart) throw new Error("Không tìm thấy cart");

//     // 2️⃣ JOIN luôn product_variants để lấy price
//     const { data: cartItems, error: itemsError } = await supabase
//         .from("cart_items")
//         .select(`
//             variant_id,
//             quantity,
//             product_variants:variant_id (
//                 price
//             )
//         `)
//         .eq("cart_id", cart.id);

//     if (itemsError) throw itemsError;
//     if (!cartItems?.length) throw new Error("Giỏ hàng trống");

//     // 3️⃣ Map thẳng (KHÔNG tính toán gì)
//     const orderItems = cartItems.map((item: any) => ({
//         order_id: orderId,
//         variant_id: item.variant_id,
//         quantity: item.quantity,
//         price: item.product_variants.price
//     }));

//     console.log("orderItems:", orderItems);

//     // 4️⃣ Insert
//     const { error: insertError } = await supabase
//         .from("order_items")
//         .insert(orderItems);

//     if (insertError) throw insertError;

//     return true;
// };
// Khi thanh toán thành công, update status = 'success'
export const handlePaymentSuccess = async (orderId: string, cartItems: { id: number; quantity: number; cart: { id: number; user_id: string; }; product_variant: { id: string; size: string; color: string; price: number; product: { id: number; name: string; image_url: string; }; }; }[]) => {
    const { error } = await supabase
        .from("orders")
        .update({ status: 'paid' }) // nếu status là text
        .eq("id", orderId);

    if (error) {
        console.error("PAYMENT ERROR:", error);
        return false;
    }
    return true;
};