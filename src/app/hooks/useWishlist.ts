"use client";
import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/app/libs/supabaseBrowser";
import { toast } from "react-hot-toast";
export function useWishlist() {
    const supabase = createSupabaseBrowser();
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            // Lấy user_id từ localStorage (đã set lúc login)
            const storedUserId = localStorage.getItem("user_id");
            if (!storedUserId) return;

            setUserId(storedUserId);

            const { data, error } = await supabase
                .from("wishlists")
                .select("product_id")
                .eq("user_id", storedUserId);

            if (error) {
                toast.error("Lỗi khi tải danh sách yêu thích");
                return;
            }


            if (data) setLikedIds(new Set(data.map(r => r.product_id)));
        };
        init();
    }, []);

    const toggle = useCallback(async (productId: string) => {
        if (!userId) {
            toast.error("Vui lòng đăng nhập để lưu sản phẩm yêu thích");
            return;
        }

        const isLiked = likedIds.has(productId);
        setLikedIds(prev => {
            const s = new Set(prev);
            isLiked ? s.delete(productId) : s.add(productId);
            return s;
        });

        if (isLiked) {
            const { error } = await supabase.from("wishlists").delete()
                .eq("user_id", userId).eq("product_id", productId);
            if (error) setLikedIds(prev => { const s = new Set(prev); s.add(productId); return s; });
        } else {
            const { error } = await supabase.from("wishlists").insert({ user_id: userId, product_id: productId });
            if (error) setLikedIds(prev => { const s = new Set(prev); s.delete(productId); return s; });
        }
    }, [userId, likedIds]);

    return { likedIds, toggle };
}