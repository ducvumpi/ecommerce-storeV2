"use client";
import Image from "next/image";
import { Collection } from "../api/collections";

function formatImageUrl(url: string) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }
    return `https://${url}`;
}

export default function CollectionList({ LoadCollections }: { LoadCollections: Collection[] }) {
    return (
        <div className="min-h-screen bg-white">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Bộ Sưu Tập
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Khám phá những bộ sưu tập thời trang được tuyển chọn kỹ lưỡng cho mọi mùa và mọi dịp
                    </p>
                </div>

                {/* Collections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {LoadCollections.map((collection) => (
                        <div
                            key={collection.id}
                            className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                        >
                            {/* Image */}
                            <div className="relative h-80 overflow-hidden">
                                <Image
                                    width={1200}
                                    height={630}
                                    unoptimized
                                    src={formatImageUrl(collection.image)}
                                    alt={collection.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                {/* Content Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <h3 className="text-2xl font-semibold mb-2">
                                        {collection.name}
                                    </h3>
                                    <p className="text-sm text-gray-200 mb-4 line-clamp-2">
                                        {collection.description || collection.name}
                                    </p>
                                    <a
                                        href={`/collections/${collection.id}`}
                                        className="inline-block bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition"
                                    >
                                        Xem chi tiết
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="text-center mt-16 py-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Không tìm thấy thông tin bạn đang tìm kiếm?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn
                    </p>
                    <a
                        href="/contact.html"
                        className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition"
                    >
                        Liên hệ với chúng tôi
                    </a>
                </div>
            </main>
        </div>
    );
}
