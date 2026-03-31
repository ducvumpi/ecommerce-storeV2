"use client";
import Image from "next/image";
import { useState, useMemo } from "react";
import { Clothes } from "@/app/api/productsAPI";

export default function ProductGallery({ collection }: { collection: Clothes }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hoveredArrow, setHoveredArrow] = useState<"left" | "right" | null>(null);

    const images: string[] = useMemo(() => {
        let parsed: string[] = [];
        if (!collection) return [];
        if (Array.isArray(collection.image_url)) parsed = collection.image_url;
        else if (typeof collection.image_url === "string") {
            try {
                const json = JSON.parse(collection.image_url);
                if (Array.isArray(json)) parsed = json;
            } catch { parsed = [collection.image_url]; }
        }
        if (parsed.length === 0 && collection.image_url) parsed = [collection.image_url];
        return parsed.filter(img => typeof img === "string" && img.trim() !== "");
    }, [collection]);

    const safeImages = images.length > 0 ? images : ["/no-image.jpg"];
    const imgSrc = safeImages[currentIndex % safeImages.length];
    const prev = () => setCurrentIndex(i => i === 0 ? safeImages.length - 1 : i - 1);
    const next = () => setCurrentIndex(i => i === safeImages.length - 1 ? 0 : i + 1);

    const arrowStyle = (side: "left" | "right"): React.CSSProperties => ({
        position: "absolute", top: "50%", transform: "translateY(-50%)",
        [side]: 12, width: 36, height: 36, borderRadius: "50%",
        background: hoveredArrow === side ? "#fff" : "rgba(255,255,255,.88)",
        border: "0.5px solid #e8ddd0", display: "flex", alignItems: "center",
        justifyContent: "center", cursor: "pointer", fontSize: 20, color: "#5c3d22",
        lineHeight: 1, transition: "background .15s",
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {/* Main image */}
            <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#f3ede6", marginTop: 24, height: "calc(100vh - 160px)" }}>
                <Image
                    src={imgSrc} alt="Product Image" fill
                    style={{ objectFit: "cover" }}
                />

                <button onClick={prev} style={arrowStyle("left")}
                    onMouseEnter={() => setHoveredArrow("left")} onMouseLeave={() => setHoveredArrow(null)}>
                    ‹
                </button>
                <button onClick={next} style={arrowStyle("right")}
                    onMouseEnter={() => setHoveredArrow("right")} onMouseLeave={() => setHoveredArrow(null)}>
                    ›
                </button>

                {/* Dot indicators */}
                <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
                    {safeImages.map((_, i) => (
                        <div key={i} onClick={() => setCurrentIndex(i)} style={{
                            height: 6, borderRadius: i === currentIndex ? 3 : "50%",
                            width: i === currentIndex ? 18 : 6,
                            background: i === currentIndex ? "#fff" : "rgba(255,255,255,.5)",
                            cursor: "pointer", transition: "all .2s",
                        }} />
                    ))}
                </div>
            </div>

            {/* Thumbnails */}
            <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto" }}>
                {safeImages.map((img, idx) => (
                    <div key={idx} onClick={() => setCurrentIndex(idx)} style={{
                        width: 72, height: 72, borderRadius: 10, overflow: "hidden",
                        cursor: "pointer", flexShrink: 0,
                        border: `1.5px solid ${idx === currentIndex ? "#8b5e3c" : "transparent"}`,
                        background: "#f3ede6", transition: "border-color .15s",
                    }}>
                        <Image src={img} alt="Thumbnail" width={200} height={200}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                ))}
            </div>
        </div>
    );
}