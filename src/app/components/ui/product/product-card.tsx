"use client";

import { Button } from "../buttons/button";
import { addToCart } from "@/app/api/loginAPI";
import { supabase } from "@/app/libs/supabaseClient";
import { useEffect, useState } from "react";
import { fetchClothesByProduct, Clothes } from "@/app/api/productsAPI"
import { toast } from "react-hot-toast";
type Variant = {
  id: number;
  color: string;
  size: string;
  price: number;
};

export default function ProductCard({ product }: { product: Clothes }) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const [getInfo, setGetInFo] = useState<Clothes>()
  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  useEffect(() => {
    async function loadInfo() {
      const loadinfo = await fetchClothesByProduct(product.slug);
      if (!loadinfo) return;
      setGetInFo(loadinfo);
    }
    loadInfo();
  }, []);

  useEffect(() => {
    if (variants.length === 0) return;

    // lấy color đầu tiên
    const firstColor = variants[0].color;

    setSelectedColor(firstColor);
    setSelectedSize(null);
    setSelectedVariant(null);
  }, [variants]);

  // 1️⃣ Fetch variants
  useEffect(() => {
    async function fetchVariants() {
      setLoading(true);

      const { data, error } = await supabase
        .from("variants")
        .select("id, color, size, price")
        .eq("product_id", product.id)
        .order("color")
        .order("size");

      if (error) {
        console.error(error);
      } else {
        setVariants(data || []);
      }

      setLoading(false);
    }
    console.log("Selected Variant:", selectedVariant);

    fetchVariants();
  }, [product.id]);
  // const handleAddToCart = () => {
  //   if (!variantId) {
  //     toast.error("Vui lòng chọn size và màu trước");
  //     return;
  //   }

  //   addToCart(variantId, quantity);
  // };
  useEffect(() => {
    if (!selectedSize || !selectedColor) {
      setVariantId(null);
      return;
    }

    const variant = variants.find(
      v =>
        v.size === selectedSize &&
        v.color === selectedColor
    );

    if (!variant) {
      setVariantId(null);
      return;
    }

    setVariantId(variant.id);
  }, [selectedSize, selectedColor, variants]);

  // 2️⃣ Tạo danh sách color
  const colors = [...new Set(variants.map(v => v.color))];

  // 3️⃣ Tạo danh sách size theo color
  const sizes = selectedColor
    ? variants
      .filter(v => v.color === selectedColor)
      .map(v => v.size)
    : [];

  // 4️⃣ Khi chọn đủ color + size → xác định variant
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

  if (loading) return <p>Loading variants...</p>;
  // Hàm kiểm tra hoặc tạo variant
  // async function handleVariantChange(size: string, color: string) {
  //   if (!size || !color) return;

  //   // Tìm variant hiện có trong product
  //   let variant = product.variants?.find(
  //     (v: any) => v.size === size && v.color === color
  //   );

  //   if (!variant) {
  //     // Nếu chưa có thì tạo mới
  //     const { data: newVariant, error } = await supabase
  //       .from("variants")
  //       .insert({
  //         product_id: product.id,
  //         size,
  //         color,
  //       })
  //       .select()
  //       .single();

  //     if (error) {
  //       console.error("Không tạo được variant:", error.message, error.details, error.hint);
  //       return;
  //     }

  //     variant = newVariant;
  //     // Cập nhật vào product.variants để tránh tạo lại lần sau
  //     if (!product.variants) product.variants = [];
  //     product.variants.push(variant);
  //   }

  //   setVariantId(variant.id);
  // }
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="mt-8 space-y-10">

      {/* Rating */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-yellow-500 fill-yellow-500"
            viewBox="0 0 24 24"
          >
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
          </svg>
          <span className="text-lg font-semibold text-neutral">4.8</span>
        </div>
        <span className="text-gray-600 text-base">(124 reviews)</span>
      </div>

      {/* Product Info */}
      {getInfo && (
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-neutral">{getInfo.title}</h1>

          <p className="text-2xl font-semibold text-gray-800">
            {formatPrice(getInfo.price)}
          </p>

          <p className="text-gray-700 leading-relaxed max-w-[700px]">
            {getInfo.description}
          </p>
        </div>
      )}

      {/* Size */}
      <div>
        <label className="block text-base font-semibold text-neutral mb-3">Size</label>
        <div className="flex flex-wrap gap-3">
          {sizes.map(size => (
            <div
              key={size}
              onClick={() => {
                setSelectedSize(size);

                // if (selectedColor) handleVariantChange(size, selectedColor);
              }}
              className={`
            flex items-center justify-center w-16 h-12 rounded-lg cursor-pointer border transition-all
            ${selectedSize === size
                  ? "border-black bg-gray-100 text-black shadow-sm"
                  : "border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50"}
          `}
            >
              {size}
            </div>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-base font-semibold text-neutral mb-3">Color</label>
        <div className="flex flex-wrap gap-3">
          {colors.map(color => (
            <div
              key={color}
              onClick={() => {
                setSelectedColor(color);
                setSelectedSize(null);

              }}
              className={`
            flex items-center gap-3 px-6 h-12 rounded-lg cursor-pointer border transition-all
            ${selectedColor === color
                  ? "border-black bg-gray-100 text-black shadow-sm"
                  : "border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50"}
          `}
            >
              {selectedColor === color && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12l4 4 8-8" />
                </svg>
              )}
              {color}
            </div>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-base font-semibold text-neutral mb-3">Quantity</label>
        <div className="flex items-center gap-4">
          <Button onClick={decrement}>-</Button>

          <span className="text-xl font-semibold w-10 text-center">{quantity}</span>

          <Button onClick={increment}>+</Button>
        </div>
      </div>

      {/* Add to Cart */}
      {product && (
        <Button
          onClick={() => addToCart(variantId!, quantity)}
          className="!mt-4 !py-3 !px-6 !text-base !rounded-lg !bg-black !text-white hover:!bg-gray-900"
        >
          Thêm vào giỏ
        </Button>
      )
      }
    </div >

  );
}
