"use client";
import React, { use, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProduct, Clothes } from '../api/productsAPI';
interface product {
    id: number;
    name: string;
    images: string[];
    description: string;
    price: number;
    collection: string;
    stock: number;
    createdDate: string;
}

export default function ProductManagement() {
    const [products, setProducts] = useState<Clothes[]>([
        // {
        //     id: 1,
        //     name: 'Áo thun basic',
        //     description: 'Áo thun cotton 100% cao cấp',
        //     price: 250000,
        //     collection: 'Mùa hè 2024',
        //     images: [
        //         'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        //         'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400',
        //         'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400'
        //     ],
        //     stock: 150,
        //     createdDate: '2024-01-15'
        // },
        // {
        //     id: 2,
        //     name: 'Quần jeans slim fit',
        //     description: 'Quần jeans co giãn thoải mái',
        //     price: 450000,
        //     collection: 'Thu đông 2024',
        //     images: [
        //         'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
        //         'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400'
        //     ],
        //     stock: 80,
        //     createdDate: '2024-02-20'
        // }
    ]);
    useEffect(() => {
        async function LoadCollections() {
            const data = await fetchProduct();
            setProducts(data);
        }
        LoadCollections();
    }, []);


    const [viewingImages, setViewingImages] = useState<Clothes | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const openImageGallery = (data: Clothes) => {
        setViewingImages(data);
        setCurrentImageIndex(0);
    };

    const closeImageGallery = () => {
        setViewingImages(null);
        setCurrentImageIndex(0);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === viewingImages.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? viewingImages.length - 1 : prev - 1
        );
    };

    const formatCurrency = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };


    const formatDate = (dateString: any) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        <Plus size={20} />
                        Thêm sản phẩm
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên sản phẩm</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mô tả</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Giá</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bộ sưu tập</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hình ảnh</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tồn kho</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày tạo</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">{product.id}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.title}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{product.description}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(product.price)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{product.category_id}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => openImageGallery(product.images)}
                                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                <div className="flex -space-x-2">
                                                    {product.images.slice(0, 3).map((img, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt=""
                                                            className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-medium">{product.images.length} ảnh</span>
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{product.stock}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(product.createdDate)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Image Gallery Modal */}
            {viewingImages && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="relative max-w-4xl w-full">
                        <button
                            onClick={closeImageGallery}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300"
                        >
                            <X size={32} />
                        </button>

                        <div className="relative bg-white rounded-lg overflow-hidden">
                            <img
                                src={viewingImages[currentImageIndex]}
                                alt={`Ảnh ${currentImageIndex + 1}`}
                                className="w-full h-96 object-contain bg-gray-100"
                            />

                            {viewingImages.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                {currentImageIndex + 1} / {viewingImages.length}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex justify-center gap-2 mt-4">
                            {viewingImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${idx === currentImageIndex ? 'border-blue-500' : 'border-white opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}