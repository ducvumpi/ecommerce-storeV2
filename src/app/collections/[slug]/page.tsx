"use client";
import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { use, useEffect } from "react";
import { Collection, fetchProductsByCategory } from "@/app/api/collections";
import { addToCart } from "@/app/api/loginAPI";

// Sample data
// const sampleProducts = [
//   { id: 1, name: 'Áo Thun Cotton Premium', price: 299000, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', category: 'Áo', rating: 4.5, inStock: true },
//   { id: 2, name: 'Quần Jeans Slim Fit', price: 599000, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', category: 'Quần', rating: 4.8, inStock: true },
//   { id: 3, name: 'Giày Sneaker Trắng', price: 899000, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500', category: 'Giày', rating: 4.2, inStock: false },
//   { id: 4, name: 'Áo Khoác Dù Nam', price: 450000, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', category: 'Áo', rating: 4.6, inStock: true },
//   { id: 5, name: 'Túi Xách Da Cao Cấp', price: 1200000, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', category: 'Phụ kiện', rating: 4.9, inStock: true },
//   { id: 6, name: 'Mũ Lưỡi Trai Classic', price: 150000, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500', category: 'Phụ kiện', rating: 4.3, inStock: true },
//   { id: 7, name: 'Áo Sơ Mi Trắng', price: 350000, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500', category: 'Áo', rating: 4.7, inStock: true },
//   { id: 8, name: 'Quần Short Kaki', price: 280000, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500', category: 'Quần', rating: 4.4, inStock: true },
// ];

export default function CollectionProducts({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);   // 🔥 unwrap Promise params
  const [quantity, setQuantity] = useState<number>(1);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500000]);
  const [sortBy, setSortBy] = useState('default');
  const [sampleProducts, setSampleProducts] = useState<any[]>([]);

  // Get unique categories
  const categories = useMemo(() => {
    return ['all', ...new Set(sampleProducts.map(p => p.category_id))];
  }, [sampleProducts]);
  const categoryId = Number(slug);

  const isOutOfStock = (product: any) => product.inStock <= 0;

  useEffect(() => {
    async function load() {
      const res = await fetchProductsByCategory(categoryId);
      setSampleProducts(res);
      console.log("Products in category:", res);
    }
    if (!isNaN(categoryId)) load();
  }, [categoryId]);
  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = sampleProducts.filter(product => {
      const price = Number(product.price || 0);

      const matchCategory =
        selectedCategory === 'all' ||
        String(product.category_id) === String(selectedCategory);

      const matchPrice =
        price >= priceRange[0] && price <= priceRange[1];

      return matchCategory && matchPrice;
    });

    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        products.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'title':
        products.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return products;
  }, [sampleProducts, selectedCategory, priceRange, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 1500000]);
    setSortBy('default');
  };
  // Thêm state để track lựa chọn của từng sản phẩm
  const [selections, setSelections] = useState<Record<string, { color?: string; size?: string }>>({});

  const updateSelection = (productId: string, field: 'color' | 'size', value: string) => {
    setSelections(prev => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value }
    }));
  };
  const getImageUrl = (img: any) => {
    if (!img) return "/no-image.png";

    // nếu là array
    if (Array.isArray(img)) return img[0];

    // nếu là string
    if (typeof img === "string") {
      const cleaned = img.trim();
      return cleaned ? cleaned : "/no-image.png";
    }

    return "/no-image.png";
  };
  // Giả sử mỗi product có colors và sizes (thêm vào type Product nếu chưa có)
  // product.colors: string[]  e.g. ['#1a1a1a', '#f5f5dc', '#8b4513']
  // product.sizes: string[]   e.g. ['S', 'M', 'L', 'XL']s
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bộ Sưu Tập</h1>
          <p className="text-gray-600">Khám phá {filteredProducts.length} sản phẩm</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden mb-6 w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <SlidersHorizontal size={20} />
          <span className="font-medium">Bộ lọc & Sắp xếp</span>
        </button>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`
                        ${showMobileFilters ? 'block' : 'hidden'} 
                        lg:block 
                        w-full lg:w-64 
                        flex-shrink-0
                        ${showMobileFilters ? 'fixed inset-0 z-50 bg-white overflow-y-auto p-4' : ''}
                    `}>
            <div className="lg:sticky lg:top-4">
              {/* Mobile Close Button */}
              {showMobileFilters && (
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-900"
                >
                  ✕
                </button>
              )}

              {/* Filter Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Danh mục</h3>
                <div className="space-y-2">
                  {categories.map((category_id) => (
                    <label
                      key={category_id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category_id}
                        onChange={() => setSelectedCategory(String(category_id) as any)}
                        className="w-4 h-4 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 capitalize">
                        {category_id === 'all' ? 'Tất cả sản phẩm' : category_id}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Khoảng giá</h3>
                <div className="space-y-4">
                  {/* Min Price */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs text-gray-600">Từ</label>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(priceRange[0])}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1500000"
                      step="50000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                    />
                  </div>

                  {/* Max Price */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs text-gray-600">Đến</label>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(priceRange[1])}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1500000"
                      step="50000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                    />
                  </div>

                  {/* Price Range Display */}
                  <div className="pt-2 text-center">
                    <span className="text-sm text-gray-600">
                      {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sort By (Mobile) */}
              <div className="lg:hidden mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Sắp xếp theo</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
                >
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                  <option value="name">Tên: A-Z</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
              </div>

              {/* Apply Button (Mobile) */}
              {showMobileFilters && (
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
                >
                  Áp dụng
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Sort Bar (Desktop) */}
            <div className="hidden lg:flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <p className="text-sm text-gray-600">
                Hiển thị <span className="font-semibold text-gray-900">{filteredProducts.length}</span> sản phẩm
              </p>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Sắp xếp:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 text-sm"
                >
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                  <option value="title">Tên: A-Z</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div key={product.id} className="group">
                      {/* Product Image */}
                      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">

                        <Image
                          src={getImageUrl(product.image_url)}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.inStock === 0 && (
                          <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-900 shadow">
                              Hết hàng
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div>
                        <h3 className="text-base font-medium text-gray-900 mb-1 group-hover:text-gray-600 transition line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">{product.category}</p>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-700 font-medium">{product.rating}</span>
                          <span className="text-xs text-gray-400">(128)</span>
                        </div>

                        {/* ─── Color Selector ─── */}
                        {colors.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-xs font-medium text-gray-700">Màu sắc</span>
                              {sel.color && (
                                <span className="text-xs text-gray-400 capitalize">{sel.color}</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {colors.map((color: string, idx: number) => (
                                <button
                                  key={`${product.id}-${color}`}
                                  title={color}
                                  onClick={() => updateSelection(String(product.id), 'color', color)}
                                  className={`w-6 h-6 rounded-full border-2 transition-all duration-150 focus:outline-none ${sel.color === color
                                    ? 'border-gray-900 scale-110 shadow-sm'
                                    : 'border-transparent hover:border-gray-400'
                                    }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ─── Size Selector ─── */}
                        {sizes.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-xs font-medium text-gray-700">Kích thước</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {sizes.map((size: string, idx: number) => (
                                <button
                                  key={`${size}-${idx}`}
                                  onClick={() => updateSelection(String(product.id), 'size', size)}
                                  className={`min-w-[2rem] h-8 px-2.5 rounded-md text-xs font-medium border transition-all duration-150 focus:outline-none ${sel.size === size
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Price & Add to Cart */}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatPrice(product.base_price)}
                          </span>

                          <button
                            disabled={!canAddToCart}
                            onClick={() => {
                              if (!selectedVariant) {
                                alert("Vui lòng chọn biến thể");
                                return;
                              }

                              addToCart(product.id, String(selectedVariant.id), quantity);
                            }}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${!canAddToCart
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                              }`}
                          >
                            {isOutOfStock(product)
                              ? 'Hết hàng'
                              : !sel.color && colors.length
                                ? 'Chọn màu'
                                : !sel.size && sizes.length
                                  ? 'Chọn size'
                                  : 'Thêm giỏ hàng'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Empty State
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-600 mb-6">
                  Không có sản phẩm nào phù hợp với bộ lọc của bạn
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
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
