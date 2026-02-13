"use client";

import Image from "next/image";
import { useEffect } from "react";
import feather from "feather-icons";
import { Clothes } from "@/app/api/productsAPI";

export default function WomenListProduct({ clothes }: { clothes: Clothes[] }) {

    useEffect(() => {
        feather.replace();
    }, [clothes]);

    const formatImageUrl = (url: string) => {
        if (!url) return "/no-image.jpg";
        if (url.startsWith("http")) return url;
        return `https://${url}`;
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);

    return (
        <>
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-bold mb-4">Thời trang Nữ</h1>
                <div className="flex flex-wrap justify-between items-center">
                    <p className="text-xl text-gray-600">
                        Phong cách thời trang cho mọi dịp
                    </p>
                    <div className="flex gap-4 mt-4 sm:mt-0">
                        <button className="bg-gray-100 px-4 py-2 rounded-lg">Lọc</button>
                        <button className="bg-gray-100 px-4 py-2 rounded-lg">Sắp xếp</button>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {clothes.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                    >
                        {/* Image */}
                        <div className="relative h-64 group overflow-hidden">
                            <Image
                                width={1200}
                                height={630}
                                src={formatImageUrl(item.image)}
                                alt={item.category?.name ?? "none"}
                                className="w-full h-full object-cover rounded-t-2xl transform group-hover:scale-110 transition duration-500"
                            />

                            {/* Heart Button */}
                            <button className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-md hover:bg-white transition">
                                <i data-feather="heart" className="text-gray-700"></i>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">
                                {item.title}
                            </h3>

                            <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                                {item.description}
                            </p>

                            <div className="flex justify-between items-center mt-4">
                                <span className="font-bold text-xl text-black tracking-wide">
                                    {formatPrice(item.price)}
                                </span>

                                <a
                                    href={`/women/${item.slug}`}
                                    className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 text-sm font-medium hover:bg-gray-200 transition"
                                >
                                    Xem BST
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-16 text-center">
                <h2 className="text-2xl font-bold mb-6">
                    Bạn cần trợ giúp để tìm phong cách của mình?
                </h2>
                <a
                    href="/men-style-guide.html"
                    className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-opacity-90 transition"
                >
                    Xem hướng dẫn về phong cách
                </a>
            </div>
        </>
    );
}
