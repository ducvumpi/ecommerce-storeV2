"use client";
import Image from "next/image";
import { useState } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useWishlist } from "@/app/hooks/useWishlist";

export default function WishlistGrid({ clothes }: { clothes: any[] }) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const { likedIds, toggle } = useWishlist();

    const formatImageUrl = (url: any) => {
        if (!url) return "/no-image.jpg";
        if (Array.isArray(url)) return url[0] || "/no-image.jpg";
        if (typeof url === "string") {
            try { const p = JSON.parse(url); if (Array.isArray(p)) return p[0] || "/no-image.jpg"; } catch { }
            if (url.startsWith("http")) return url;
            return `https://${url}`;
        }
        return "/no-image.jpg";
    };

    const getPrice = (item: any) => {
        if (item.product_variants?.length > 0) {
            const prices = item.product_variants.map((v: any) => Number(v.base_price)).filter((p: number) => !isNaN(p));
            if (prices.length > 0) return Math.min(...prices);
        }
        return item.base_price || 0;
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

    if (clothes.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#b0997e" }}>
                <Heart size={40} strokeWidth={1} color="#e2d9ce" style={{ marginBottom: 16 }} />
                <p style={{ fontSize: 16, margin: "0 0 8px", color: "#3d2b1a" }}>Chưa có sản phẩm yêu thích</p>
                <p style={{ fontSize: 13, margin: "0 0 24px" }}>Nhấn vào biểu tượng tim để lưu sản phẩm bạn thích</p>
                <Link href="/collections" style={{ fontSize: 13, color: "#fff", background: "#8b5e3c", padding: "10px 24px", borderRadius: 50, textDecoration: "none" }}>
                    Khám phá sản phẩm
                </Link>
            </div>
        );
    }

    return (
        <>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 500, color: "#3d2b1a", margin: "0 0 6px" }}>Yêu thích</h1>
                <p style={{ fontSize: 14, color: "#b0997e", margin: 0 }}>{clothes.length} sản phẩm đã lưu</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 }}>
                {clothes.map((item) => {
                    const productId = String(item.id);
                    return (
                        <div key={productId}
                            onMouseEnter={() => setHoveredId(productId)}
                            onMouseLeave={() => setHoveredId(null)}
                            style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #e8ddd0", overflow: "hidden", boxShadow: hoveredId === productId ? "0 6px 24px rgba(100,60,20,.1)" : "none", transition: "box-shadow .25s" }}
                        >
                            <div style={{ position: "relative", height: 240, overflow: "hidden", background: "#f3ede6" }}>
                                <Link href={`/men/${item.slug}`}>
                                    <Image
                                        src={formatImageUrl(item.image_url)}
                                        alt={item.name ?? ""}
                                        width={400} height={240}
                                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .5s ease", transform: hoveredId === productId ? "scale(1.07)" : "scale(1)" }}
                                    />
                                </Link>
                                <button
                                    onClick={() => toggle(productId)}
                                    style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.92)", border: "0.5px solid #e8ddd0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                                >
                                    <Heart
                                        size={14} strokeWidth={1.5}
                                        color={likedIds.has(productId) ? "#c07050" : "#c4956a"}
                                        fill={likedIds.has(productId) ? "#c07050" : "none"}
                                    />
                                </button>
                            </div>

                            <div style={{ padding: "14px 16px 16px" }}>
                                <p style={{ fontSize: 14, fontWeight: 500, color: "#3d2b1a", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {item.name}
                                </p>
                                <p style={{ fontSize: 12, color: "#b0997e", margin: "0 0 12px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                    {item.description || "Không có mô tả sản phẩm"}
                                </p>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 15, fontWeight: 500, color: "#8b5e3c" }}>{formatPrice(getPrice(item))}</span>
                                    <Link href={`/men/${item.slug}`} style={{ fontSize: 12, color: "#7a6652", background: "#f3ede6", padding: "7px 16px", borderRadius: 50, textDecoration: "none" }}>
                                        Xem BST
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}