"use client";

import { Button } from "../buttons/button";
import { addToCart } from "@/app/api/loginAPI";
import { supabase } from "@/app/libs/supabaseClient";
import { useEffect, useState } from "react";
import { fetchClothesByProduct, Clothes, fetchClothesByProductWoman } from "@/app/api/productsAPI"
import { toast } from "react-hot-toast";
import { Star, Heart, Truck, Shield, RotateCcw } from "lucide-react";

type Variant = {
  id: number;
  price: number;
  color_id: number;
  color_name: string;
  hex_code: string;
  size_id: number;
  size_name: string;
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

    setSelectedColor(variants[0].color_name);
    setSelectedSize(null);
    setSelectedVariant(null);
  }, [variants]);


  // useEffect(() => {
  //   async function fetchVariants() {
  //     setLoading(true);
  //     const { data, error } = await supabase
  //       .from("variants")
  //       .select("id, color, size, price")
  //       .eq("product_id", product.id)
  //       .order("color")
  //       .order("size");

  //     if (error) {
  //       console.error(error);
  //     } else {
  //       setVariants(data || []);
  //     }
  //     setLoading(false);
  //   }
  //   fetchVariants();
  // }, [product.id]);

  useEffect(() => {
    async function fetchVariants() {
      if (!product?.id) return;

      setLoading(true);

      const { data, error } = await supabase.rpc(
        "get_variants_by_product",
        { p_product_id: product.id }
      );

      console.log("variants raw:", data);

      if (error) {
        console.error("RPC error:", error);
        setVariants([]);
      } else {
        setVariants(data ?? []);
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
      v =>
        v.color_name === selectedColor &&
        v.size_name === selectedSize
    );

    setSelectedVariant(variant || null);
  }, [selectedColor, selectedSize, variants]);


  // const colors = [...new Set(variants.map(v => v.color))];
  const colors = Array.from(
    new Set(variants.map(v => v.color_name))
  );

  // const sizes = selectedColor
  //   ? variants.filter(v => v.color === selectedColor).map(v => v.size)
  //   : [];
  const sizes = selectedColor
    ? variants
      .filter(v => v.color_name === selectedColor)
      .map(v => v.size_name)
    : [];

  useEffect(() => {
    if (!selectedColor || !selectedSize) {
      setVariantId(null);
      return;
    }

    const variant = variants.find(
      v =>
        v.color_name === selectedColor &&
        v.size_name === selectedSize
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
    addToCart(product_id, variantId, quantity);
    toast.success("Đã thêm vào giỏ hàng!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Product Header */}
      {getInfo && (
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                {getInfo.title}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">4.8</span>
                </div>
                <span className="text-sm text-gray-500">(124 đánh giá)</span>
              </div>
            </div>

            {/* Favorite Button */}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-3 rounded-full hover:bg-gray-100 transition"
            >
              <Heart
                className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                  }`}
              />
            </button>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(getInfo.price)}
            </span>
            {/* Optional: Original price if on sale */}
            {/* <span className="text-xl text-gray-400 line-through">
              {formatPrice(getInfo.price * 1.2)}
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
              -20%
            </span> */}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-6">
            {getInfo.description}
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Truck className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Miễn phí vận chuyển</p>
                <p className="text-xs text-gray-500">Đơn hàng từ 500k</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <RotateCcw className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Đổi trả dễ dàng</p>
                <p className="text-xs text-gray-500">Trong vòng 30 ngày</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Shield className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Bảo hành chính hãng</p>
                <p className="text-xs text-gray-500">12 tháng</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Color Selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-base font-semibold text-gray-900">
            Màu sắc
            {selectedColor && <span className="ml-2 text-gray-500 font-normal">({selectedColor})</span>}
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => {
                setSelectedColor(color);
                setSelectedSize(null);
              }}
              className={`
                relative px-6 py-3 rounded-lg border-2 transition-all font-medium
                ${selectedColor === color
                  ? 'border-gray-900 bg-gray-50 text-gray-900'
                  : 'border-gray-200 text-gray-700 hover:border-gray-400'
                }
              `}
            >
              {color}
              {selectedColor === color && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-base font-semibold text-gray-900">
            Kích thước
            {selectedSize && <span className="ml-2 text-gray-500 font-normal">({selectedSize})</span>}
          </label>
          <button className="text-sm text-gray-600 hover:text-gray-900 underline">
            Hướng dẫn chọn size
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {sizes.length > 0 ? (
            sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`
                  w-16 h-12 rounded-lg border-2 transition-all font-semibold
                  ${selectedSize === size
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }
                `}
              >
                {size}
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">Vui lòng chọn màu trước</p>
          )}
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-8">
        <label className="block text-base font-semibold text-gray-900 mb-4">
          Số lượng
        </label>
        <div className="inline-flex items-center border-2 border-gray-200 rounded-lg">
          <button
            onClick={decrement}
            className="px-6 py-3 hover:bg-gray-50 transition font-semibold text-lg"
          >
            −
          </button>
          <span className="px-8 py-3 text-lg font-semibold border-x-2 border-gray-200 min-w-[80px] text-center">
            {quantity}
          </span>
          <button
            onClick={increment}
            className="px-6 py-3 hover:bg-gray-50 transition font-semibold text-lg"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleAddToCart}
          disabled={!variantId}
          className={`
            flex-1 py-4 px-8 rounded-lg font-semibold text-base transition-all
            ${variantId
              ? 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {variantId ? 'Thêm vào giỏ hàng' : 'Vui lòng chọn đầy đủ thuộc tính'}
        </button>
        <button className="sm:w-auto px-8 py-4 border-2 border-gray-900 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition">
          Mua ngay
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          💡 <span className="font-medium">Mẹo:</span> Gọi ngay{' '}
          <a href="tel:1900xxxx" className="text-gray-900 font-semibold hover:underline">
            1900 xxxx
          </a>{' '}
          để được tư vấn size và màu phù hợp nhất
        </p>
      </div>
    </div>
  );
}