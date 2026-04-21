"use client";
import Image from "next/image";
import { useState, useMemo } from "react";
import { Clothes } from "@/app/api/productsAPI";
import { Heart, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/app/hooks/useWishlist";

type SortOption = "default" | "price_asc" | "price_desc" | "name_asc" | "name_desc";

interface FilterState {
    priceMin: number;
    priceMax: number;
    category: string;
}

export default function MenListProduct({ clothes }: { clothes: Clothes[] }) {
    const [hoveredId, setHoveredId] = useState<string | null>(null); // ← string thay vì number
    const [sortOption, setSortOption] = useState<SortOption>("default");
    const [filterState, setFilterState] = useState<FilterState>({ priceMin: 0, priceMax: Infinity, category: "" });
    const [showSortPanel, setShowSortPanel] = useState(false);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const { likedIds, toggle } = useWishlist();
    const router = useRouter();

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

    const categories = useMemo(() => {
        const cats = clothes.map(item => item.category?.name).filter(Boolean) as string[];
        return Array.from(new Set(cats));
    }, [clothes]);

    const filteredAndSorted = useMemo(() => {
        let result = [...clothes];

        if (filterState.category) {
            result = result.filter(item => item.category?.name === filterState.category);
        }

        result = result.filter(item => {
            const price = getPrice(item);
            return price >= filterState.priceMin && price <= (filterState.priceMax === Infinity ? Infinity : filterState.priceMax);
        });

        switch (sortOption) {
            case "price_asc": result.sort((a, b) => getPrice(a) - getPrice(b)); break;
            case "price_desc": result.sort((a, b) => getPrice(b) - getPrice(a)); break;
            case "name_asc": result.sort((a, b) => a.name.localeCompare(b.name, "vi")); break;
            case "name_desc": result.sort((a, b) => b.name.localeCompare(a.name, "vi")); break;
        }

        return result;
    }, [clothes, filterState, sortOption]);

    const hasActiveFilter = filterState.category !== "" || filterState.priceMin > 0 || filterState.priceMax !== Infinity;

    const sortLabels: Record<SortOption, string> = {
        default: "Mặc định",
        price_asc: "Giá tăng dần",
        price_desc: "Giá giảm dần",
        name_asc: "Tên A → Z",
        name_desc: "Tên Z → A",
    };

    const panelStyle: React.CSSProperties = {
        position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 100,
        background: "#fff", border: "0.5px solid #e8ddd0", borderRadius: 14,
        boxShadow: "0 8px 32px rgba(100,60,20,.12)", padding: "16px 20px",
        minWidth: 220,
    };

    return (
        <div style={{ fontFamily: "var(--font-sans, Lora, serif)" }}>
            <style jsx>{`
                .back-btn { display: none; }
                @media (max-width: 900px) { .back-btn { display: flex; margin-right: 12px; } }
                .overlay { position: fixed; inset: 0; z-index: 90; }
            `}</style>

            {(showSortPanel || showFilterPanel) && (
                <div className="overlay" onClick={() => { setShowSortPanel(false); setShowFilterPanel(false); }} />
            )}

            {/* Header */}
            <div style={{ marginBottom: 36 }}>
                <h1 style={{ display: "flex", alignItems: "center", fontSize: 26, fontWeight: 500, color: "#3d2b1a", margin: "0 0 8px" }}>
                    <button
                        className="back-btn"
                        onClick={() => router.back()}
                        style={{
                            width: 38, height: 38, borderRadius: 10,
                            border: "1.5px solid #e2d9ce", background: "#ffffff",
                            alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: "#a07050", flexShrink: 0,
                            transition: "all .2s", boxShadow: "0 1px 4px rgba(140,100,60,.08)"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f3ede6"; e.currentTarget.style.borderColor = "#c4956a"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#e2d9ce"; }}
                        title="Quay lại"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    Thời trang Nam
                </h1>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <p style={{ fontSize: 14, color: "#b0997e", margin: 0 }}>
                        {filteredAndSorted.length} sản phẩm
                        {hasActiveFilter && <span style={{ color: "#8b5e3c", marginLeft: 4 }}>(đã lọc)</span>}
                    </p>

                    <div style={{ display: "flex", gap: 8 }}>
                        {/* Nút Lọc */}
                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => { setShowFilterPanel(v => !v); setShowSortPanel(false); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    fontSize: 13, color: hasActiveFilter ? "#8b5e3c" : "#7a6652",
                                    background: hasActiveFilter ? "#f3ede6" : "#fff",
                                    border: `0.5px solid ${hasActiveFilter ? "#c4956a" : "#e8ddd0"}`,
                                    borderRadius: 50, padding: "7px 18px", cursor: "pointer", fontFamily: "inherit"
                                }}
                            >
                                <SlidersHorizontal size={13} />
                                Lọc
                                {hasActiveFilter && <span style={{ background: "#8b5e3c", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>!</span>}
                            </button>

                            {showFilterPanel && (
                                <div style={panelStyle}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                        <span style={{ fontSize: 13, fontWeight: 500, color: "#3d2b1a" }}>Bộ lọc</span>
                                        {hasActiveFilter && (
                                            <button
                                                onClick={() => setFilterState({ priceMin: 0, priceMax: Infinity, category: "" })}
                                                style={{ fontSize: 12, color: "#8b5e3c", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                                            >
                                                <X size={11} /> Xóa lọc
                                            </button>
                                        )}
                                    </div>

                                    <div style={{ marginBottom: 16 }}>
                                        <p style={{ fontSize: 12, color: "#b0997e", margin: "0 0 8px" }}>Danh mục</p>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#3d2b1a", cursor: "pointer" }}>
                                                <input type="radio" name="category" checked={filterState.category === ""} onChange={() => setFilterState(s => ({ ...s, category: "" }))} />
                                                Tất cả
                                            </label>
                                            {categories.map(cat => (
                                                <label key={cat} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#3d2b1a", cursor: "pointer" }}>
                                                    <input type="radio" name="category" checked={filterState.category === cat} onChange={() => setFilterState(s => ({ ...s, category: cat }))} />
                                                    {cat}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p style={{ fontSize: 12, color: "#b0997e", margin: "0 0 8px" }}>Khoảng giá</p>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                            {[
                                                { label: "Tất cả", min: 0, max: Infinity },
                                                { label: "Dưới 300.000đ", min: 0, max: 300000 },
                                                { label: "300.000 – 700.000đ", min: 300000, max: 700000 },
                                                { label: "700.000 – 1.500.000đ", min: 700000, max: 1500000 },
                                                { label: "Trên 1.500.000đ", min: 1500000, max: Infinity },
                                            ].map(range => (
                                                <label key={range.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#3d2b1a", cursor: "pointer" }}>
                                                    <input
                                                        type="radio"
                                                        name="price"
                                                        checked={filterState.priceMin === range.min && filterState.priceMax === range.max}
                                                        onChange={() => setFilterState(s => ({ ...s, priceMin: range.min, priceMax: range.max }))}
                                                    />
                                                    {range.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Nút Sắp xếp */}
                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => { setShowSortPanel(v => !v); setShowFilterPanel(false); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    fontSize: 13, color: sortOption !== "default" ? "#8b5e3c" : "#7a6652",
                                    background: sortOption !== "default" ? "#f3ede6" : "#fff",
                                    border: `0.5px solid ${sortOption !== "default" ? "#c4956a" : "#e8ddd0"}`,
                                    borderRadius: 50, padding: "7px 18px", cursor: "pointer", fontFamily: "inherit"
                                }}
                            >
                                <ArrowUpDown size={13} />
                                {sortOption !== "default" ? sortLabels[sortOption] : "Sắp xếp"}
                            </button>

                            {showSortPanel && (
                                <div style={panelStyle}>
                                    <p style={{ fontSize: 12, color: "#b0997e", margin: "0 0 10px" }}>Sắp xếp theo</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                                            <button
                                                key={key}
                                                onClick={() => { setSortOption(key); setShowSortPanel(false); }}
                                                style={{
                                                    textAlign: "left", fontSize: 13, padding: "8px 10px", borderRadius: 8,
                                                    border: "none", cursor: "pointer", fontFamily: "inherit",
                                                    background: sortOption === key ? "#f3ede6" : "transparent",
                                                    color: sortOption === key ? "#8b5e3c" : "#3d2b1a",
                                                    fontWeight: sortOption === key ? 500 : 400,
                                                }}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {filteredAndSorted.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#b0997e" }}>
                    <p style={{ fontSize: 15, margin: "0 0 12px" }}>Không tìm thấy sản phẩm phù hợp</p>
                    <button
                        onClick={() => setFilterState({ priceMin: 0, priceMax: Infinity, category: "" })}
                        style={{ fontSize: 13, color: "#8b5e3c", background: "#f3ede6", border: "none", borderRadius: 50, padding: "8px 20px", cursor: "pointer" }}
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18, marginBottom: 56 }}>
                    {filteredAndSorted.map((item) => {
                        const productId = String(item.id); // ← dùng nhất quán xuyên suốt
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
                                            alt={item.category?.name ?? ""}
                                            width={400}
                                            height={240}
                                            style={{
                                                width: "100%", height: "100%", objectFit: "cover", display: "block",
                                                transition: "transform .5s ease",
                                                transform: hoveredId === productId ? "scale(1.07)" : "scale(1)" // ← productId
                                            }}
                                        />
                                    </Link>
                                    <button
                                        onClick={() => toggle(productId)} // ← gọi hook
                                        style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.92)", border: "0.5px solid #e8ddd0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                                    >
                                        <Heart
                                            size={14}
                                            strokeWidth={1.5}
                                            color={likedIds.has(productId) ? "#c07050" : "#c4956a"} // ← productId
                                            fill={likedIds.has(productId) ? "#c07050" : "none"}
                                        />
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
                                        <a href={`/men/${item.slug}`} style={{ fontSize: 12, color: "#7a6652", background: "#f3ede6", padding: "7px 16px", borderRadius: 50, textDecoration: "none" }}>
                                            Xem Chi Tiết
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

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