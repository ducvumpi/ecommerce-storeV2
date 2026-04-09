"use client";
import { useState } from "react";
import { X, ShoppingBag } from "lucide-react";
import { addToCart } from "@/app/api/loginAPI";
import toast from "react-hot-toast";
import { supabase } from "@/app/libs/supabaseClient";

interface Variant {
    id: string | number;
    color: string;
    size: string;
}

interface Props {
    product: {
        id: number;
        name: string;
        image_url: string;
        base_price: number;
        product_variants?: Variant[];
    } | null;
    onClose: () => void;
}

export default function CartModal({ product, onClose }: Props) {
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(false);

    if (!product) return null;

    const variants = product.product_variants ?? [];

    // Danh sách màu/size unique
    const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
    const sizes = [...new Set(
        variants
            .filter(v => !selectedColor || v.color === selectedColor)
            .map(v => v.size)
            .filter(Boolean)
    )];

    // Tìm variant khớp
    const matchedVariant = variants.find(
        v => v.color === selectedColor && v.size === selectedSize
    );

    const fmtPrice = (p: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

    const handleAdd = async () => {
        if (!selectedColor) { toast.error("Vui lòng chọn màu sắc"); return; }
        if (!selectedSize) { toast.error("Vui lòng chọn kích thước"); return; }
        if (!matchedVariant) { toast.error("Không tìm thấy phiên bản này"); return; }

        const user = await supabase.auth.getUser();
        if (!user.data?.user) {
            toast.error("Bạn cần đăng nhập");
            setTimeout(() => {
                window.location.href = "/auth/login";
            }, 800);
            return;
        }


        setLoading(true);
        await addToCart(product.id, String(matchedVariant.id), qty);
        toast.success("Đã thêm vào giỏ hàng!");
        setLoading(false);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(46,30,18,0.45)",
                    backdropFilter: "blur(4px)",
                    zIndex: 100,
                    animation: "fadeIn .2s ease",
                }}
            />

            {/* Modal */}
            <div style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                background: "#FDFAF6",
                borderRadius: "20px 20px 0 0",
                padding: "28px 24px 40px",
                zIndex: 101,
                maxWidth: 520,
                margin: "0 auto",
                animation: "slideUp .3s cubic-bezier(.25,.46,.45,.94)",
                maxHeight: "90vh",
                overflowY: "auto",
            }}>
                <style>{`
          @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
          @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
          .chip-btn {
            padding: 7px 16px; border-radius: 8px; font-size: 13px;
            border: 1.5px solid #E6DACE; background: #FDFAF6;
            color: #5C3D28; cursor: pointer; transition: all .2s;
            font-family: inherit;
          }
          .chip-btn:hover  { border-color: #8C6D52; }
          .chip-btn.active { border-color: #5C3D28; background: #5C3D28; color: white; }
          .chip-btn.disabled { opacity: .35; cursor: not-allowed; }
        `}</style>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <img
                            src={product.image_url} alt={product.name}
                            style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", border: "1px solid #E6DACE" }}
                        />
                        <div>
                            <p style={{ fontFamily: "'Gowun Batang', serif", fontSize: 16, color: "#2E1E12", marginBottom: 3 }}>
                                {product.name}
                            </p>
                            <p style={{ fontFamily: "'Gowun Batang', serif", fontSize: 17, fontWeight: 700, color: "#5C3D28" }}>
                                {fmtPrice(product.base_price)}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9a8878", padding: 4 }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ width: "100%", height: "0.5px", background: "#E6DACE", marginBottom: 20 }} />

                {/* Màu sắc */}
                {colors.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: 12, color: "#8C6D52", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 10 }}>
                            MÀU SẮC {selectedColor && <span style={{ fontWeight: 400, color: "#2E1E12" }}>— {selectedColor}</span>}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {colors.map(c => (
                                <button
                                    key={c}
                                    className={`chip-btn ${selectedColor === c ? "active" : ""}`}
                                    onClick={() => { setSelectedColor(c); setSelectedSize(""); }}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Kích thước */}
                {sizes.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <p style={{ fontSize: 12, color: "#8C6D52", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 10 }}>
                            KÍCH THƯỚC {selectedSize && <span style={{ fontWeight: 400, color: "#2E1E12" }}>— {selectedSize}</span>}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {["XS", "S", "M", "L", "XL", "XXL"].filter(s => sizes.includes(s)).concat(sizes.filter(s => !["XS", "S", "M", "L", "XL", "XXL"].includes(s))).map(s => (
                                <button
                                    key={s}
                                    className={`chip-btn ${selectedSize === s ? "active" : ""} ${!sizes.includes(s) ? "disabled" : ""}`}
                                    onClick={() => sizes.includes(s) && setSelectedSize(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Số lượng */}
                <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 12, color: "#8C6D52", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 10 }}>
                        SỐ LƯỢNG
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 0, width: "fit-content", border: "1.5px solid #E6DACE", borderRadius: 10, overflow: "hidden" }}>
                        <button
                            onClick={() => setQty(q => Math.max(1, q - 1))}
                            style={{ width: 40, height: 40, background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#5C3D28" }}
                        >−</button>
                        <span style={{ width: 40, textAlign: "center", fontSize: 15, color: "#2E1E12", fontWeight: 500 }}>{qty}</span>
                        <button
                            onClick={() => setQty(q => q + 1)}
                            style={{ width: 40, height: 40, background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#5C3D28" }}
                        >+</button>
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={handleAdd}
                    disabled={loading}
                    style={{
                        width: "100%", height: 50, borderRadius: 12,
                        background: loading ? "#C9B99A" : "#5C3D28",
                        color: "white", border: "none", cursor: loading ? "not-allowed" : "pointer",
                        fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        transition: "background .2s",
                    }}
                >
                    <ShoppingBag size={16} />
                    {loading ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                </button>
            </div>
        </>
    );
}