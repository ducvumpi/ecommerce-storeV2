"use client";
import Image from "next/image";
import { useState } from "react";
import { Clothes } from "@/app/api/productsAPI";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function WomenListProduct({ clothes }: { clothes: Clothes[] }) {
    const router = useRouter();
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

    const formatImageUrl = (url: any) => {
        if (!url) return "/no-image.jpg";
        if (Array.isArray(url)) return url[0] || "/no-image.jpg";
        if (typeof url === "string") {
            try {
                const parsed = JSON.parse(url);
                if (Array.isArray(parsed)) return parsed[0] || "/no-image.jpg";
            } catch { }
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

    return (

        <div style={{ background: "#faf8f5", fontFamily: "var(--font-sans, Lora, serif)" }}>
            <style jsx>{`
                .back-btn {
            display: none;
            }
            @media (max-width: 900px) {
            .back-btn {
                display: flex;
                margin-right: 12px;
            }
            }
      `}</style>
            {/* Header */}
            <div style={{ marginBottom: 36 }}>

                <h1 style={{ display: "flex", alignItems: "center", fontSize: 26, fontWeight: 500, color: "#3d2b1a", margin: "0 0 8px" }}>
                    <button
                        className="back-btn"
                        onClick={() => router.back()}
                        style={{
                            width: 38, height: 38, borderRadius: 10,
                            border: '1.5px solid #e2d9ce', background: '#ffffff',
                            alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#a07050', flexShrink: 0,
                            transition: 'all .2s', boxShadow: '0 1px 4px rgba(140,100,60,.08)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f3ede6'; e.currentTarget.style.borderColor = '#c4956a'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2d9ce'; }}
                        title="Quay lại"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>Thời trang Nữ</h1>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <p style={{ fontSize: 14, color: "#b0997e", margin: 0 }}>Phong cách thời trang cho mọi dịp</p>
                    <div style={{ display: "flex", gap: 8 }}>
                        {["Lọc", "Sắp xếp"].map(label => (
                            <button key={label} style={{ fontSize: 13, color: "#7a6652", background: "#fff", border: "0.5px solid #e8ddd0", borderRadius: 50, padding: "7px 18px", cursor: "pointer", fontFamily: "inherit" }}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18, marginBottom: 56 }}>
                {clothes.map((item) => {
                    const itemIdNum = typeof item.id === 'string' ? parseInt(item.id) : item.id;
                    return (
                        <div key={item.id}
                            onMouseEnter={() => setHoveredId(itemIdNum)}
                            onMouseLeave={() => setHoveredId(null)}
                            style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #e8ddd0", overflow: "hidden", boxShadow: hoveredId === itemIdNum ? "0 6px 24px rgba(100,60,20,.1)" : "none", transition: "box-shadow .25s" }}
                        >
                            <div style={{ position: "relative", height: 240, overflow: "hidden", background: "#f3ede6" }}>
                                <Link href={`/women/${item.slug}`}>
                                    <Image
                                        src={formatImageUrl(item.image_url)} alt={item.category?.name ?? ""}
                                        width={400} height={240}
                                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .5s ease", transform: hoveredId === itemIdNum ? "scale(1.07)" : "scale(1)" }}
                                    />
                                </Link>

                                <button
                                    onClick={() => setLikedIds(prev => { const s = new Set(prev); s.has(itemIdNum) ? s.delete(itemIdNum) : s.add(itemIdNum); return s; })}
                                    style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.92)", border: "0.5px solid #e8ddd0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                                >
                                    <Heart size={14} strokeWidth={1.5} color={likedIds.has(itemIdNum) ? "#c07050" : "#c4956a"} fill={likedIds.has(itemIdNum) ? "#c07050" : "none"} />
                                </button>
                            </div>

                            <div style={{ padding: "14px 16px 16px" }}>
                                <p style={{ fontSize: 14, fontWeight: 500, color: "#3d2b1a", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {item.name}
                                </p>
                                <p style={{
                                    fontSize: 12, color: "#b0997e", margin: "0 0 12px", lineHeight: 1.5,
                                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                                }}>
                                    {item.description || "Không có mô tả sản phẩm"}
                                </p>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 15, fontWeight: 500, color: "#8b5e3c" }}>{formatPrice(getPrice(item))}</span>
                                    <a href={`/women/${item.slug}`} style={{ fontSize: 12, color: "#7a6652", background: "#f3ede6", padding: "7px 16px", borderRadius: 50, textDecoration: "none" }}>
                                        Xem BST
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center", borderTop: "0.5px solid #e8ddd0", paddingTop: 48 }}>
                <h2 style={{ fontSize: 18, fontWeight: 500, color: "#3d2b1a", margin: "0 0 8px" }}>Cần trợ giúp tìm phong cách của bạn?</h2>
                <p style={{ fontSize: 13, color: "#b0997e", margin: "0 0 20px" }}>Xem gợi ý phối đồ từ đội ngũ stylist của chúng tôi</p>
                <a href="/men-style-guide" style={{ display: "inline-block", background: "#8b5e3c", color: "#fff", fontSize: 13, fontWeight: 500, padding: "11px 28px", borderRadius: 50, textDecoration: "none" }}>
                    Xem hướng dẫn phong cách
                </a>
            </div>
        </div>
    );
}