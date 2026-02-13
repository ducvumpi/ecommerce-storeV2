import { supabase } from "@/app/libs/supabaseClient";
import { CartItem } from "../cart/page";

type CustomerInfo = {
    fullName: string;
    email: string;
    phone: string;
    cartID: string;
    address: string;
    totalAmount: number;
    city: string;
    ward: string;
    note: string;
}
export const createOrder = async (
    customerInfo: CustomerInfo,
    totalAmount: number
) => {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Chưa đăng nhập");
    }

    const { data, error: insertError } = await supabase
        .from("orders")
        .insert({
            user_id: user.id,
            cart_id: customerInfo.cartID,
            receiver_name: customerInfo.fullName,
            receiver_phone: customerInfo.phone,
            receiver_address: customerInfo.address,
            receiver_mail: customerInfo.email,
            note: customerInfo.note ?? "",
            status_id: 1,
            total_amount: totalAmount,
            final_amount: totalAmount,
        })
        .select("id")
        .single();

    if (insertError) {
        console.error("ORDER INSERT ERROR:", insertError);
        throw insertError;
    }

    return data.id;
};




export const insertOrderItemsFromCart = async (orderId: string) => {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Chưa đăng nhập");

    const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

    if (!cart) throw new Error("Không tìm thấy cart");

    const { data: cartItems } = await supabase
        .from("cart_items")
        .select("product_id,variant_id, quantity")
        .eq("cart_id", cart.id);

    if (!cartItems?.length) throw new Error("Giỏ hàng trống");

    const orderItems = cartItems.map(item => ({
        order_id: orderId, // UUID ✔
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
    }));

    const { error } = await supabase
        .from("order_items")
        .insert(orderItems);

    if (error) throw error;
};

export const handlePaymentSuccess = async (orderId: string) => {
    try {


        const { error } = await supabase
            .from("orders")
            .update({ status_id: 2 }) // success
            .eq("id", orderId);

        if (error) throw error;

        return true;
    } catch (err) {
        console.error("PAYMENT ERROR:", err);
        return false;
    }
};
