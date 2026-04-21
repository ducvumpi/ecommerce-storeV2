"use client";
import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import Image from 'next/image';
import { use, useEffect } from "react";
import { Collection, fetchProductsByCategory } from "@/app/api/collections";
import { addToCart } from "@/app/api/loginAPI";
import { toast } from "react-hot-toast";
import { supabase } from '@/app/libs/supabaseClient';
export default function CollectionProducts({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [quantity, setQuantity] = useState<number>(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [sortBy, setSortBy] = useState('default');
  const [sampleProducts, setSampleProducts] = useState<any[]>([]);
  const [categoryNames, setCategoryNames] = useState<Record<number, string>>({});
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const handleAddToCart = (product: any, selectedVariant: any, quantity: number) => {
    if (!selectedVariant?.id || !product?.id) {
      alert("Vui lòng chọn đầy đủ màu sắc và kích thước");
      return;
    }
    addToCart(product.id, String(selectedVariant.id), quantity);
    toast.success("Đã thêm vào giỏ hàng!");

  };
  const categories = useMemo(() => {
    return ['all', ...new Set(sampleProducts.map(p => p.category_id))];
  }, [sampleProducts]);

  const categoryId = Number(slug);
  const isOutOfStock = (product: any) => product.inStock <= 0;
  // Helper lấy tất cả ảnh của product
  const getImages = (img: any): string[] => {
    if (!img) return ["/no-image.png"];
    if (Array.isArray(img)) return img.length > 0 ? img : ["/no-image.png"];
    if (typeof img === "string" && img.trim()) return [img.trim()];
    return ["/no-image.png"];
  };
  // Calculate min and max prices from products
  const priceStats = useMemo(() => {
    if (sampleProducts.length === 0) return { min: 0, max: 2000000 };
    const prices = sampleProducts.map(p => Number(p.base_price || 0)).filter(p => p > 0);
    if (prices.length === 0) return { min: 0, max: 2000000 };

    const min = Math.floor(Math.min(...prices) / 50000) * 50000; // ← thêm * 50000
    const max = Math.ceil(Math.max(...prices) / 50000) * 500000;

    return { min, max };
  }, [sampleProducts]);
  useEffect(() => {
    async function loadCategoryNames() {
      const ids = [...new Set(sampleProducts.map(p => p.category_id).filter(Boolean))];
      if (!ids.length) return;

      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .in("id", ids);

      if (!error && data) {
        const map: Record<number, string> = {};
        data.forEach((c: any) => { map[c.id] = c.name; });
        setCategoryNames(map);
      }
    }
    loadCategoryNames();
  }, [sampleProducts]);
  useEffect(() => {
    async function load() {
      const res = await fetchProductsByCategory(categoryId);
      setSampleProducts(res);
      console.log("Products in category:", res);
    }
    if (!isNaN(categoryId)) load();
  }, [categoryId]);

  // Reset price range when products load
  useEffect(() => {
    setPriceRange([priceStats.min, priceStats.max]);
  }, [priceStats]);

  // Prevent body scroll when mobile filters are open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileFilters]);

  const filteredProducts = useMemo(() => {
    let products = sampleProducts.filter(product => {
      const price = Number(product.base_price || 0);
      const matchCategory = selectedCategory === 'all' || String(product.category_id) === String(selectedCategory);
      const matchPrice = price >= priceRange[0] && price <= priceRange[1];
      return matchCategory && matchPrice;
    });

    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => Number(a.base_price) - Number(b.base_price));
        break;
      case 'price-desc':
        products.sort((a, b) => Number(b.base_price) - Number(a.base_price));
        break;
      case 'title':
        products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return products;
  }, [sampleProducts, selectedCategory, priceRange, sortBy]);
  const [collections, setCollections] = useState<{ id: number, name: string, slug: string }[]>([]);

  useEffect(() => {
    async function loadCollections() {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug");
      if (data) setCollections(data);
    }
    loadCollections();
  }, []);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setPriceRange([priceStats.min, priceStats.max]);
    setSortBy('default');
  };
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox(prev => prev && ({ ...prev, index: (prev.index + 1) % prev.images.length }));
      if (e.key === 'ArrowLeft') setLightbox(prev => prev && ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox]);
  const [selections, setSelections] = useState<Record<string, { color?: string; size?: string }>>({});

  const updateSelection = (productId: string, field: 'color' | 'size', value: string) => {
    setSelections(prev => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value }
    }));
  };

  const getImageUrl = (img: any) => {
    if (!img) return "/no-image.png";
    if (Array.isArray(img)) return img[0];
    if (typeof img === "string") {
      const cleaned = img.trim();
      return cleaned ? cleaned : "/no-image.png";
    }
    return "/no-image.png";
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(20,10,5,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Nút đóng */}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: '#fff', fontSize: 20, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >✕</button>

          {/* Nút lùi */}
          {lightbox.images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(prev => prev && ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length })); }}
              style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', border: 'none',
                color: '#fff', fontSize: 22, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >‹</button>
          )}

          {/* Ảnh chính */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
          >
            <img
              src={lightbox.images[lightbox.index]}
              alt=""
              style={{
                maxWidth: '90vw', maxHeight: '90vh',
                objectFit: 'contain', borderRadius: 12,
                userSelect: 'none'
              }}
            />
            {/* Số thứ tự */}
            {lightbox.images.length > 1 && (
              <div style={{
                position: 'absolute', bottom: -32, left: '50%', transform: 'translateX(-50%)',
                color: 'rgba(255,255,255,0.6)', fontSize: 13
              }}>
                {lightbox.index + 1} / {lightbox.images.length}
              </div>
            )}
          </div>

          {/* Nút tiến */}
          {lightbox.images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(prev => prev && ({ ...prev, index: (prev.index + 1) % prev.images.length })); }}
              style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', border: 'none',
                color: '#fff', fontSize: 22, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >›</button>
          )}

          {/* Thumbnail strip */}
          {lightbox.images.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 8
            }}>
              {lightbox.images.map((img, i) => (
                <div
                  key={i}
                  onClick={e => { e.stopPropagation(); setLightbox(prev => prev && ({ ...prev, index: i })); }}
                  style={{
                    width: 48, height: 48, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                    border: `2px solid ${i === lightbox.index ? '#d4a574' : 'rgba(255,255,255,0.3)'}`,
                    flexShrink: 0
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <style jsx global>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f5f0e8;
        }
        ::-webkit-scrollbar-thumb {
          background: #c4b5a0;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a89580;
        }
      `}</style>

      {/* Header - Responsive */}
      <header className="border-b border-[#e8ddd0] bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#3d2b1a] mb-1 sm:mb-2">
            Bộ Sưu Tập
          </h1>
          <p className="text-sm sm:text-base text-[#8a7060]">
            Khám phá {filteredProducts.length} sản phẩm
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden mb-4 sm:mb-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 border border-[#e2d9ce] rounded-xl hover:bg-[#f9f5ef] transition text-sm sm:text-base text-[#5a4a3a] font-medium"
        >
          <SlidersHorizontal size={18} className="sm:w-5 sm:h-5" />
          <span>Bộ lọc & Sắp xếp</span>
        </button>

        <div className="flex gap-6 lg:gap-8">
          {/* Sidebar Filters - Mobile Overlay */}
          <aside className={`
            ${showMobileFilters ? 'fixed inset-0 z-50 bg-[#fdfbf7] overflow-y-auto' : 'hidden'}
            lg:block lg:relative lg:w-64 lg:flex-shrink-0
          `}>
            <div className={`
              ${showMobileFilters ? 'p-4 sm:p-6' : ''}
              lg:sticky lg:top-4 bg-white rounded-2xl lg:border lg:border-[#e8ddd0] lg:p-6 lg:shadow-sm
            `}>
              {/* Mobile Header */}
              {showMobileFilters && (
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e8ddd0] lg:hidden">
                  <h2 className="text-lg font-semibold text-[#3d2b1a]">Bộ lọc</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 -mr-2 text-[#8a7060] hover:text-[#3d2b1a] rounded-lg hover:bg-[#f9f5ef]"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              {/* Filter Header - Desktop */}
              <div className="hidden lg:flex items-center justify-between mb-6 pb-4 border-b border-[#e8ddd0]">
                <h2 className="text-lg font-semibold text-[#3d2b1a]">Bộ lọc</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-[#8a7060] hover:text-[#8b5e3c] transition font-medium"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-sm font-semibold text-[#3d2b1a] mb-3 sm:mb-4">
                  Danh mục
                </h3>
                <div className="space-y-2">
                  {categories.map((category_id) => (
                    <label key={category_id} className="flex items-center gap-3 cursor-pointer group py-1">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category_id}
                        onChange={() => setSelectedCategory(String(category_id) as any)}
                        className="w-4 h-4 text-[#8b5e3c] focus:ring-[#8b5e3c] border-[#d4c4b0]"
                      />
                      <span className="text-sm text-[#6a5a4a] group-hover:text-[#3d2b1a] capitalize">
                        {category_id === 'all'
                          ? 'Tất cả sản phẩm'
                          : categoryNames[Number(category_id)]
                        }
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-sm font-semibold text-[#3d2b1a] mb-3 sm:mb-4">
                  Khoảng giá
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs text-[#8a7060]">Từ</label>
                      <span className="text-sm font-medium text-[#3d2b1a]">
                        {formatPrice(priceRange[0])}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={priceStats.min}
                      max={priceStats.max}
                      step="0"
                      value={priceRange[0]}
                      onChange={(e) => {
                        const newMin = Number(e.target.value);
                        if (newMin <= priceRange[1]) {
                          setPriceRange([newMin, priceRange[1]]);
                        }
                      }}
                      className="w-full h-2 bg-[#e8ddd0] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#8b5e3c] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs text-[#8a7060]">Đến</label>
                      <span className="text-sm font-medium text-[#3d2b1a]">
                        {formatPrice(priceRange[1])}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={priceStats.min}
                      max={priceStats.max}
                      step="0"
                      value={priceRange[1]}
                      onChange={(e) => {
                        const newMax = Number(e.target.value);
                        if (newMax >= priceRange[0]) {
                          setPriceRange([priceRange[0], newMax]);
                        }
                      }}
                      className="w-full h-2 bg-[#e8ddd0] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#8b5e3c] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                    />
                  </div>

                  <div className="pt-2 px-3 py-2 bg-[#f9f5ef] rounded-lg text-center border border-[#e8ddd0]">
                    <span className="text-sm text-[#6a5a4a] font-medium">
                      {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sort By (Mobile) */}
              <div className="mb-6 sm:mb-8 lg:hidden">
                <h3 className="text-sm font-semibold text-[#3d2b1a] mb-3 sm:mb-4">
                  Sắp xếp theo
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#e2d9ce] rounded-xl focus:outline-none focus:border-[#8b5e3c] text-sm bg-white text-[#3d2b1a]"
                >
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                  <option value="title">Tên: A-Z</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
              </div>

              {/* Apply Button (Mobile) */}
              {showMobileFilters && (
                <div className="sticky bottom-0 left-0 right-0 bg-[#fdfbf7] border-t border-[#e8ddd0] p-4 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 lg:hidden">
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full bg-[#8b5e3c] text-white py-3 rounded-xl font-medium hover:bg-[#7a4e2f] transition shadow-md"
                  >
                    Áp dụng ({filteredProducts.length} sản phẩm)
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Sort Bar (Desktop) */}
            <div className="hidden lg:flex items-center justify-between mb-6 lg:mb-8 pb-4 border-b border-[#e8ddd0]">
              <p className="text-sm text-[#8a7060]">
                Hiển thị <span className="font-semibold text-[#3d2b1a]">{filteredProducts.length}</span> sản phẩm
              </p>
              <div className="flex items-center gap-3">
                <label className="text-sm text-[#8a7060]">Sắp xếp:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-[#e2d9ce] rounded-xl focus:outline-none focus:border-[#8b5e3c] text-sm bg-white text-[#3d2b1a]"
                >
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                  <option value="title">Tên: A-Z</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
              </div>
            </div>

            {/* Products Grid - Responsive */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => {
                  const sel = selections[product.id] || {};
                  const colors = [
                    ...new Set((product.product_variants ?? []).map((v: any) => v.color))
                  ] as string[];

                  const sizes = [
                    ...new Set((product.product_variants ?? []).map((v: any) => v.size))
                  ] as string[];

                  const selectedVariant = product.product_variants?.find((v: any) => {
                    const matchColor = !colors.length || v.color === sel.color;
                    const matchSize = !sizes.length || v.size === sel.size;
                    return matchColor && matchSize;
                  });

                  const canAddToCart = !isOutOfStock(product) && (!colors.length || sel.color) && (!sizes.length || sel.size);

                  return (
                    <div key={product.id} className="group bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden hover:shadow-lg hover:shadow-[#d4c4b0]/20 transition-all duration-300">

                      <div
                        className="relative aspect-square overflow-hidden bg-[#f9f5ef]"
                        style={{ cursor: 'zoom-in' }}
                        onClick={() => {
                          const imgs = getImages(product.image_url);
                          setLightbox({ images: imgs, index: 0 });
                        }}
                      >
                        <Image
                          src={getImageUrl(product.image_url)}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* ✅ Badge phóng to — chỉ hiện khi hover */}
                        <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <div style={{
                            background: 'rgba(20,10,5,0.55)', backdropFilter: 'blur(4px)',
                            color: '#fff', fontSize: 11, fontWeight: 500,
                            padding: '5px 12px', borderRadius: 50,
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M11 8v6M8 11h6" />
                            </svg>
                            Nhấn để phóng to
                          </div>
                        </div>

                        {product.inStock === 0 && (
                          <div className="absolute inset-0 bg-white/90 flex items-center justify-center backdrop-blur-sm">
                            <span className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-[#8a7060] shadow-md border border-[#e8ddd0]">
                              Hết hàng
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-medium text-[#3d2b1a] mb-1 group-hover:text-[#8b5e3c] transition line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#a89580] mb-2">{product.category}</p>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2 sm:mb-3">
                          <span className="text-[#d4a574] text-sm">★</span>
                          <span className="text-xs sm:text-sm text-[#6a5a4a] font-medium">{product.rating}</span>
                          <span className="text-xs text-[#b0997e]">(128)</span>
                        </div>

                        {/* Color Selector */}
                        {colors.length > 0 && (
                          <div className="mb-2 sm:mb-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-xs font-medium text-[#6a5a4a]">Màu sắc</span>

                            </div>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {colors.map((color: string) => (
                                <button
                                  key={`${product.id}-${color}`}
                                  onClick={() => updateSelection(String(product.id), 'color', color)}
                                  className={`px-2.5 py-1 rounded-md border text-xs capitalize transition-all duration-150 focus:outline-none ${sel.color === color
                                    ? 'border-[#8b5e3c] bg-[#8b5e3c] text-white font-medium'
                                    : 'border-[#e8ddd0] text-[#6a5a4a] hover:border-[#c4b5a0] hover:bg-[#f5ede6]'
                                    }`}
                                >
                                  {color}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Size Selector */}
                        {sizes.length > 0 && (
                          <div className="mb-2 sm:mb-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-xs font-medium text-[#6a5a4a]">Kích thước</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {sizes.map((size: string, idx: number) => (
                                <button
                                  key={`${size}-${idx}`}
                                  onClick={() => updateSelection(String(product.id), 'size', size)}
                                  className={`min-w-[1.75rem] sm:min-w-[2rem] h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg text-xs font-medium border transition-all duration-150 focus:outline-none ${sel.size === size
                                    ? 'bg-[#8b5e3c] text-white border-[#8b5e3c] shadow-sm'
                                    : 'bg-[#fdfbf7] text-[#6a5a4a] border-[#e8ddd0] hover:border-[#c4b5a0] hover:bg-white'
                                    }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Price & Add to Cart */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f0e8dc]">
                          <span className="text-base sm:text-lg font-semibold text-[#8b5e3c] truncate">
                            {formatPrice(product.base_price)}
                          </span>

                          <button
                            disabled={!canAddToCart}
                            onClick={() => handleAddToCart(product, selectedVariant, quantity)}
                            className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap shadow-sm ${!canAddToCart
                              ? 'bg-[#f0e8dc] text-[#c4b5a0] cursor-not-allowed'
                              : 'bg-[#8b5e3c] text-white hover:bg-[#7a4e2f] hover:shadow-md'
                              }`}
                          >
                            {isOutOfStock(product)
                              ? 'Hết hàng'
                              : !sel.color && colors.length
                                ? 'Chọn màu'
                                : !sel.size && sizes.length
                                  ? 'Chọn size'
                                  : 'Thêm giỏ'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Empty State - Responsive
              <div className="text-center py-12 sm:py-20 bg-white rounded-2xl border border-[#e8ddd0]">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#3d2b1a] mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-sm sm:text-base text-[#8a7060] mb-4 sm:mb-6 px-4">
                  Không có sản phẩm nào phù hợp với bộ lọc của bạn
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#8b5e3c] text-white rounded-xl text-sm sm:text-base font-medium hover:bg-[#7a4e2f] transition shadow-md"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
