"use client";

import Image from "next/image";
import { useState } from "react";
import { Clothes } from "@/app/api/productsAPI";
export default function ProductGallery({ collection }: { collection: Clothes }) {
    const images = collection.images?.length > 0
        ? collection.images
        : [collection.image];

    const [currentIndex, setCurrentIndex] = useState(0);

    const prevImage = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="flex flex-col max-w-3xl">

            {/* IMAGE LARGE */}
            <div className="relative">
                <Image
                    width={1200}
                    height={630}
                    src={images[currentIndex] ? images[currentIndex] : "/no-image.jpg"}
                    alt="Product Image"
                    className="mt-6 w-full rounded-xl object-cover transition-all"
                />

                {/* Prev Button */}
                <button
                    onClick={prevImage}
                    className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6"
                        fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 6l-6 6 6 6" />
                    </svg>
                </button>

                {/* Next Button */}
                <button
                    onClick={nextImage}
                    className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6"
                        fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 6l6 6-6 6" />
                    </svg>
                </button>
            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-3 mt-6">
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`
              w-20 h-20 rounded-md overflow-hidden cursor-pointer border 
              transition 
              ${idx === currentIndex ? "border-black" : "border-gray-300"}
            `}
                    >
                        <Image
                            width={200}
                            height={200}
                            src={img}
                            className="w-full h-full object-cover"
                            alt="Thumbnail"
                        />
                    </div>
                ))}
            </div>

        </div>
    );
}
