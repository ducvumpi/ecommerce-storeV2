"use client";

import { Button } from "../buttons/button";
import { addToCart } from "@/app/api/loginAPI";
import { supabase } from "@/app/libs/supabaseClient";
import { useEffect, useState } from "react";
import { fetchClothesByProduct, Clothes, fetchClothesByProductWoman } from "@/app/api/productsAPI"
import { toast } from "react-hot-toast";
import { Star, Heart, Truck, Shield, RotateCcw, Link } from "lucide-react";
import { useRouter } from "next/navigation";

type Variant = {
  id: number;
  base_price: number;
  price: number;
  stock: number;
  color: string;
  size: string;
};

export default function ProductCard({ product }: { product: Clothes }) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [getInfo, setGetInFo] = useState<Clothes>();
  const [product_id, setProductId] = useState<number | null>(null);
  const SIZE_ORDER = ["S", "M", "L", "XL", "XXL"];
  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  const router = useRouter();

  useEffect(() => {
    async function loadInfo() {
      const loadinfo = await fetchClothesByProduct(product.slug);
      if (!loadinfo) return;
      setGetInFo(loadinfo);
    }
    loadInfo();
  }, []);

  useEffect(() => {
    async function fetchProductId() {
      if (!product?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("id")
        .eq("id", product.id)
        .single();
      if (data) {
        setProductId(data.id);
      }
      setLoading(false);
    }
    fetchProductId();
  }, [product?.id]);

  useEffect(() => {
    console.log("variants state:", variants);
  }, [variants]);

  useEffect(() => {
    async function loadInfo() {
      const loadinfo = await fetchClothesByProductWoman(product.slug);
      if (!loadinfo) return;
      setGetInFo(loadinfo);
    }
    loadInfo();
  }, []);

  useEffect(() => {
    if (variants.length === 0) return;
    setSelectedColor(variants[0].color);
    setSelectedSize(null);
    setSelectedVariant(null);
  }, [variants]);

  const availableSizes = variants
    .filter(v => v.stock > 0)
    .map(v => v.size);

  useEffect(() => {
    async function fetchVariants() {
      if (!product?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("product_variants")
        .select("id, price, stock, color, size")
        .eq("product_id", product.id);

      console.log("variants new:", data);

      if (error) {
        console.error(error);
        setVariants([]);
      } else {
        const mapped = (data || []).map((v: any) => ({
          id: v.id,
          base_price: v.price,
          price: v.price,
          stock: v.stock,
          color: v.color,
          size: v.size,
        }));
        setVariants(mapped);
      }
      setLoading(false);
    }
    fetchVariants();
  }, [product?.id]);

  useEffect(() => {
    if (!selectedColor || !selectedSize) {
      setSelectedVariant(null);
      return;
    }
    const variant = variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    );
    setSelectedVariant(variant || null);
  }, [selectedColor, selectedSize, variants]);

  const colors = Array.from(new Set(variants.map(v => v.color)));
  const sizes = selectedColor
    ? variants.filter(v => v.color === selectedColor).map(v => v.size)
    : [];

  useEffect(() => {
    if (!selectedColor || !selectedSize) {
      setVariantId(null);
      return;
    }
    const variant = variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    );
    setVariantId(variant?.id ?? null);
  }, [selectedColor, selectedSize, variants]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!variantId || !product_id) {
      toast.error("Vui lòng chọn size và màu trước khi thêm vào giỏ");
      return;
    }
    addToCart(product_id, String(variantId), quantity);
    toast.success("Đã thêm vào giỏ hàng!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const getMinPrice = (variants: Variant[]) => {
    if (!variants || variants.length === 0) return 0;
    return Math.min(...variants.map(v => v.price));
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: "7px 16px",
    borderRadius: 9,
    border: `1.5px solid ${active ? "#8b5e3c" : "#e2d9ce"}`,
    background: active ? "#fdf6ef" : "#fff",
    color: active ? "#8b5e3c" : "#7a6652",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .15s",
    position: "relative",
  });

  const sizeBtnStyle = (active: boolean): React.CSSProperties => ({
    width: 52,
    height: 42,
    borderRadius: 9,
    border: `1.5px solid ${active ? "#8b5e3c" : "#e2d9ce"}`,
    background: active ? "#8b5e3c" : "#fff",
    color: active ? "#fff" : "#7a6652",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .15s",
  });

  return (
    <div style={{
      maxWidth: 520,
      width: "100%",
      margin: "0 auto",
      padding: "0 16px",
      fontFamily: "var(--font-sans, Lora, serif)"
    }}>
      <style jsx>{`
        @media (max-width: 640px) {
          .product-title {
            font-size: 20px !important;
          }
          .product-price {
            font-size: 22px !important;
          }
          .features-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .action-buttons {
            flex-direction: column !important;
          }
          .buy-now-btn {
            width: 100% !important;
          }
        }
        @media (max-width: 480px) {
          .size-buttons {
            gap: 6px !important;
          }
          .size-button {
            width: 46px !important;
            height: 38px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      {getInfo && (
        <div style={{ marginBottom: 24 }}>
          {/* Name + Fav */}
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 8,
            gap: 12
          }}>
            <h1 className="product-title" style={{
              fontSize: 24,
              fontWeight: 500,
              color: "#3d2b1a",
              margin: 0
            }}>
              {getInfo.name}
            </h1>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "0.5px solid #e8ddd0",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0
              }}
            >
              <Heart
                size={16}
                strokeWidth={1.5}
                color={isFavorite ? "#c07050" : "#a07050"}
                fill={isFavorite ? "#c07050" : "none"}
              />
            </button>
          </div>

          {/* Stars */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            flexWrap: "wrap"
          }}>
            <div style={{ display: "flex" }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < 4 ? "#e8a838" : "none"}
                  color={i < 4 ? "#e8a838" : "#d0c0b0"}
                />
              ))}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#3d2b1a" }}>
              4.8
            </span>
            <span style={{ fontSize: 13, color: "#b0997e" }}>
              (124 đánh giá)
            </span>
          </div>

          {/* Price */}
          <p className="product-price" style={{
            fontSize: 26,
            fontWeight: 500,
            color: "#8b5e3c",
            margin: "0 0 10px"
          }}>
            {formatPrice(selectedVariant?.price || product.base_price)}
          </p>

          {/* Desc */}
          <p style={{
            fontSize: 13,
            color: "#9a8472",
            lineHeight: 1.7,
            margin: "0 0 16px"
          }}>
            {getInfo.description}
          </p>

          {/* Features */}
          <div className="features-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            padding: "14px 0",
            borderTop: "0.5px solid #e8ddd0",
            borderBottom: "0.5px solid #e8ddd0",
            marginBottom: 22
          }}>
            {[
              { icon: <Truck size={14} color="#a07050" strokeWidth={1.5} />, title: "Miễn phí ship", sub: "Đơn từ 500k" },
              { icon: <RotateCcw size={14} color="#a07050" strokeWidth={1.5} />, title: "Đổi trả dễ dàng", sub: "Trong 30 ngày" },
              { icon: <Shield size={14} color="#a07050" strokeWidth={1.5} />, title: "Bảo hành", sub: "12 tháng" },
            ].map(f => (
              <div key={f.title} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8
              }}>
                <div style={{
                  width: 30,
                  height: 30,
                  background: "#f3ede6",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {f.icon}
                </div>
                <div>
                  <p style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#3d2b1a",
                    margin: "0 0 2px"
                  }}>
                    {f.title}
                  </p>
                  <p style={{
                    fontSize: 10,
                    color: "#b0997e",
                    margin: 0
                  }}>
                    {f.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 500,
          color: "#8a7060",
          marginBottom: 10
        }}>
          Màu sắc {selectedColor && (
            <span style={{ fontWeight: 400, color: "#b0997e" }}>
              ({selectedColor})
            </span>
          )}
        </div>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8
        }}>
          {colors.map(color => (
            <button
              key={color}
              onClick={() => {
                setSelectedColor(color);
                setSelectedSize(null);
              }}
              style={btnStyle(selectedColor === color)}
            >
              {color}
              {selectedColor === color && (
                <span style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 16,
                  height: 16,
                  background: "#8b5e3c",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 500,
          color: "#8a7060",
          marginBottom: 10,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8
        }}>
          <span>
            Kích thước {selectedSize && (
              <span style={{ fontWeight: 400, color: "#b0997e" }}>
                ({selectedSize})
              </span>
            )}
          </span>
          <a href="#" style={{
            fontSize: 12,
            color: "#a07050",
            textDecoration: "none",
            fontWeight: 400
          }}>
            Hướng dẫn chọn size
          </a>
        </div>
        <div className="size-buttons" style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8
        }}>
          {sizes.length > 0
            ? SIZE_ORDER
              .filter(size => sizes.includes(size))
              .map(size => {
                const variant = variants.find(
                  v => v.size === size && v.color === selectedColor
                );
                const isOut = !variant || variant.stock === 0;

                return (
                  <button
                    key={size}
                    className="size-button"
                    disabled={isOut}
                    onClick={() => !isOut && setSelectedSize(size)}
                    style={{
                      ...sizeBtnStyle(selectedSize === size),
                      opacity: isOut ? 0.4 : 1,
                      cursor: isOut ? "not-allowed" : "pointer"
                    }}
                  >
                    {size}
                  </button>
                );
              })
            : <p style={{
              fontSize: 13,
              color: "#b0997e",
              fontStyle: "italic",
              margin: 0
            }}>
              Vui lòng chọn màu trước
            </p>
          }
        </div>
      </div>

      {/* Qty */}
      <div style={{ marginBottom: 22 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 500,
          color: "#8a7060",
          marginBottom: 10
        }}>
          Số lượng
        </div>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          border: "1.5px solid #e2d9ce",
          borderRadius: 10,
          overflow: "hidden"
        }}>
          <button
            onClick={decrement}
            style={{
              width: 42,
              height: 42,
              background: "#fff",
              border: "none",
              fontSize: 18,
              color: "#7a6652",
              cursor: "pointer",
              fontFamily: "inherit"
            }}
          >
            −
          </button>
          <span style={{
            padding: "0 20px",
            fontSize: 15,
            fontWeight: 500,
            color: "#3d2b1a",
            borderLeft: "1px solid #e2d9ce",
            borderRight: "1px solid #e2d9ce",
            height: 42,
            lineHeight: "42px",
            minWidth: 52,
            textAlign: "center"
          }}>
            {quantity}
          </span>
          <button
            onClick={increment}
            style={{
              width: 42,
              height: 42,
              background: "#fff",
              border: "none",
              fontSize: 18,
              color: "#7a6652",
              cursor: "pointer",
              fontFamily: "inherit"
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="action-buttons" style={{
        display: "flex",
        gap: 10,
        marginBottom: 14
      }}>
        <button
          onClick={handleAddToCart}
          disabled={!variantId}
          style={{
            flex: 1,
            height: 46,
            borderRadius: 50,
            background: variantId ? "#8b5e3c" : "#e2d9ce",
            color: variantId ? "#fff" : "#c4b09a",
            border: "none",
            fontSize: 14,
            fontWeight: 500,
            cursor: variantId ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            minWidth: 0
          }}
        >
          {variantId ? "Thêm vào giỏ hàng" : "Vui lòng chọn đầy đủ thuộc tính"}
        </button>
        <button
          className="buy-now-btn"
          onClick={() => {
            if (!variantId) { toast.error("Vui lòng chọn size"); return; }
            handleAddToCart();
            router.push(`/cart?step=2&variantId=${variantId}`);
          }}
          style={{
            padding: "0 24px",
            height: 46,
            borderRadius: 50,
            border: "1.5px solid #8b5e3c",
            background: "transparent",
            color: "#8b5e3c",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap"
          }}
        >
          Mua ngay
        </button>
      </div>

      <div style={{
        background: "#fdf8f3",
        border: "0.5px solid #ede6dc",
        borderRadius: 10,
        padding: "12px 14px",
        fontSize: 12,
        color: "#9a8472"
      }}>
        💡 <strong>Mẹo:</strong> Gọi{" "}
        <a href="tel:1900xxxx" style={{
          color: "#8b5e3c",
          fontWeight: 500,
          textDecoration: "none"
        }}>
          1900 xxxx
        </a>
        {" "}để được tư vấn size và màu phù hợp nhất.
      </div>
    </div>
  );
}