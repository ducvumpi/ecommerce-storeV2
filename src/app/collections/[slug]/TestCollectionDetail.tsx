"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Collection, fetchProductsByCategory } from "@/app/api/collections";
import { Clothes } from "@/app/api/productsAPI"
import Image from 'next/image';
import { use } from "react";
import { addToCart } from "@/app/api/loginAPI";

// const sampleProducts = [
//   { id: 1, name: 'Áo Thun Cotton', price: 299000, image: '🏷️', category: 'Áo', rating: 4.5, inStock: true },
//   { id: 2, name: 'Quần Jeans Slim', price: 599000, image: '👖', category: 'Quần', rating: 4.8, inStock: true },
//   { id: 3, name: 'Giày Sneaker', price: 899000, image: '👟', category: 'Giày', rating: 4.2, inStock: false },
//   { id: 4, name: 'Áo Khoác Dù', price: 450000, image: '🧥', category: 'Áo', rating: 4.6, inStock: true },
//   { id: 5, name: 'Túi Xách Da', price: 1200000, image: '👜', category: 'Phụ kiện', rating: 4.9, inStock: true },
//   { id: 6, name: 'Mũ Lưỡi Trai', price: 150000, image: '🧢', category: 'Phụ kiện', rating: 4.3, inStock: true },
//   { id: 7, name: 'Áo Sơ Mi', price: 350000, image: '👔', category: 'Áo', rating: 4.7, inStock: true },
//   { id: 8, name: 'Quần Short', price: 280000, image: '🩳', category: 'Quần', rating: 4.4, inStock: true },
// ];
export default function CollectionProducts({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);   // 🔥 unwrap Promise params
    const [quantity, setQuantity] = useState<number>(1);

    const increment = () => setQuantity(prev => prev + 1);
    const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
    const categoryId = Number(slug);

    const [sampleProducts, setSampleProducts] = useState<any[]>([]);

    useEffect(() => {
        async function load() {
            const res = await fetchProductsByCategory(categoryId);
            setSampleProducts(res);
        }
        if (categoryId) load();
    }, [categoryId]);


    const [priceRange, setPriceRange] = useState([0, 1600000]);
    const [sortBy, setSortBy] = useState('default');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Lấy danh sách categories
    const categories = useMemo(() => {
        const cats = ['all', ...new Set(sampleProducts.map(p => p.category))];
        return cats;
    }, [sampleProducts]);


    // Lọc và sắp xếp sản phẩm
    const filteredProducts = useMemo(() => {
        let products = sampleProducts.filter(product => {
            const matchPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
            const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
            return matchPrice && matchCategory;
        });

        // Sắp xếp
        switch (sortBy) {
            case 'price-asc':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                products.sort((a, b) => a.title.localeCompare(b.title));
                break;

            case 'rating':
                products.sort((a, b) => b.rating - a.rating);
                break;
            default:
                break;
        }

        return products;
    }, [sampleProducts, priceRange, sortBy, selectedCategory]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const resetFilters = () => {
        setPriceRange([0, 1600000]);
        setSortBy('default');
        setSelectedCategory('all');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-6 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Bộ Sưu Tập Thời Trang</h1>
                    <p className="text-gray-600">Khám phá {filteredProducts.length} sản phẩm</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
                {/* Mobile Filter Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                    <SlidersHorizontal size={18} />
                    <span>{showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}</span>
                </button>

                <div className="flex gap-6">
                    {/* BỘ LỌC BÊN TRÁI */}
                    <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-72 flex-shrink-0`}>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
                                <button
                                    onClick={resetFilters}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Xóa tất cả
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6 pb-6 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">Danh mục</h3>
                                <div className="space-y-3">
                                    {categories.map((cat, index) => (
                                        <label key={index} className="flex items-center cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={selectedCategory === cat}
                                                onChange={() => setSelectedCategory(cat)}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 capitalize">
                                                {cat === 'all' ? 'Tất cả' : cat}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">Khoảng giá</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs text-gray-600">Từ</label>
                                            <span className="text-sm font-medium text-gray-900">{formatPrice(priceRange[0])}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1600000"
                                            step="50000"
                                            value={priceRange[0]}
                                            onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs text-gray-600">Đến</label>
                                            <span className="text-sm font-medium text-gray-900">{formatPrice(priceRange[1])}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1600000"
                                            step="50000"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* SẢN PHẨM BÊN PHẢI */}
                    <main className="flex-1">
                        {/* Sort Bar */}
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <span className="text-sm text-gray-600">
                                Hiển thị <span className="font-semibold">{filteredProducts.length}</span> sản phẩm
                            </span>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600 flex-shrink-0">Sắp xếp:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="default">Mặc định</option>
                                    <option value="price-asc">Giá tăng dần</option>
                                    <option value="price-desc">Giá giảm dần</option>
                                    <option value="name-asc">Tên A-Z</option>
                                    <option value="rating">Đánh giá cao nhất</option>
                                </select>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-200 group">
                                        <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                                            <Image
                                                src={product.image}
                                                alt=""
                                                fill
                                                className="object-cover"
                                            />
                                        </div>


                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-1">
                                                    {product.title}
                                                </h3>
                                                {!product.instock && (
                                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded flex-shrink-0 ml-2">
                                                        Hết hàng
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                                            <div className="flex items-center mb-3">
                                                <span className="text-yellow-400 mr-1">★</span>
                                                <span className="text-sm text-gray-600 font-medium">{product.rating}</span>
                                                <span className="text-xs text-gray-400 ml-1">(50+)</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-bold text-blue-600">
                                                    {formatPrice(product.price)}
                                                </span>
                                                <button
                                                    disabled={!product.instock}
                                                    onClick={() => addToCart(product.id, quantity, product.price,)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${product.instock
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {product.instock ? 'Thêm vào giỏ' : 'Hết hàng'}
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Không tìm thấy sản phẩm
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Thử điều chỉnh bộ lọc để xem thêm sản phẩm
                                </p>
                                <button
                                    onClick={resetFilters}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

