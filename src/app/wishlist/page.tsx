// app/wishlist/page.tsx
import { createSupabaseServer } from "@/app/libs/supabaseServer";
import { redirect } from "next/navigation";
import WishlistGrid from "@/app/components/ui/wishlist/WishlistGrid";

export default async function WishlistPage() {
    const supabase = await createSupabaseServer();

    // Lấy session để có user_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Lấy profile để lấy id (nếu profiles.id = auth.uid thì dùng thẳng user.id)
    const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

    if (!profile) redirect("/login");

    const { data: wishlist, error } = await supabase
        .from("wishlists")
        .select(`
            product_id,
            products:product_id (
                id, name, slug, image_url, base_price, description,
                category:categories (name),
                product_variants (price)
            )
        `)
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Lỗi khi tải wishlist:", error);
    }


    const clothes = (wishlist ?? []).map(w => w.products).filter(Boolean) as any[];

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
            <WishlistGrid clothes={clothes} />
        </div>
    );
}