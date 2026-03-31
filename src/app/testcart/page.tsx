"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../libs/supabaseClient";

type CartItem = {
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    total: number;
    product: {
        title: string;
        description: string;
        image: string;
    };
};

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCart() {
            try {
                // Lấy user_id từ localStorage (hoặc session)
                const userId = localStorage.getItem("user_id"); // ✅ phải là UUID nếu cột là UUID
                if (!userId) {
                    console.warn("Chưa có user_id trong localStorage");
                    setCartItems([]);
                    setLoading(false);
                    return;
                }

                // Query Supabase REST API
                const url = `cart_items?select=id,quantity,product:product_id(id,title,price,description),cart:cart(user_id)&cart.user_id=eq.${userId}`;
                const { data, error } = await supabase
                    .from("cart_items")
                    .select(
                        "id,quantity,total,product:product_id(id,title,price,description),cart:(user_id)"
                    )
                    .eq("cart.user_id", userId); // filter theo user_id

                if (error) {
                    console.error("Lỗi fetch cart:", error);
                    setCartItems([]);
                } else {
                    setCartItems(data || []);
                }
            } catch (err) {
                console.error("Unexpected error fetchCart:", err);
                setCartItems([]);
            } finally {
                setLoading(false);
            }
        }

        fetchCart();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (cartItems.length === 0) return <div>Giỏ hàng trống</div>;

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>
            <div className="space-y-6">
                {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-6 border-b pb-4">
                        <Image
                            src={item.product.image}
                            alt={item.product.title}
                            width={120}
                            height={120}
                            className="object-cover rounded"
                        />
                        <div className="flex-1">
                            <h2 className="font-bold text-lg">{item.product.title}</h2>
                            <p className="text-gray-600">{item.product.description}</p>
                            <p className="mt-1 font-semibold">
                                ${item.total}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 text-right font-bold text-xl">
                Tổng: $
                {cartItems.reduce((sum, item) => sum + (item.total || item.price * item.quantity), 0)}
            </div>
        </div>
    );
}
