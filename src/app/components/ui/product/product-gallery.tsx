"use client";
import Image from "next/image";
import { Clothes } from "@/app/api/productsAPI";
import { useState, useMemo, useEffect } from "react";
export default function ProductGallery({ collection }: { collection: Clothes }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hoveredArrow, setHoveredArrow] = useState<"left" | "right" | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
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
    useEffect(() => {
        if (!lightboxOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightboxOpen, currentIndex]);
    return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>

            {/* ── Lightbox ── */}
            {lightboxOpen && (
                <div
                    onClick={() => setLightboxOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(20,10,5,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {/* Đóng */}
                    <button
                        onClick={() => setLightboxOpen(false)}
                        style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
                    >✕</button>

                    {/* Lùi */}
                    {safeImages.length > 1 && (
                        <button
                            onClick={e => { e.stopPropagation(); prev(); }}
                            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >‹</button>
                    )}

                    {/* Ảnh lớn */}
                    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '90vw', maxHeight: '90vh' }}>
                        <img
                            src={imgSrc} alt=""
                            style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 12, userSelect: 'none', display: 'block' }}
                        />
                        {safeImages.length > 1 && (
                            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 10 }}>
                                {currentIndex + 1} / {safeImages.length}
                            </p>
                        )}
                    </div>

                    {/* Tiến */}
                    {safeImages.length > 1 && (
                        <button
                            onClick={e => { e.stopPropagation(); next(); }}
                            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >›</button>
                    )}

                    {/* Thumbnails */}
                    {safeImages.length > 1 && (
                        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
                            {safeImages.map((img, i) => (
                                <div key={i}
                                    onClick={e => { e.stopPropagation(); setCurrentIndex(i); }}
                                    style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, border: `2px solid ${i === currentIndex ? '#d4a574' : 'rgba(255,255,255,0.3)'}`, transition: 'border-color .15s' }}
                                >
                                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#f3ede6", marginTop: 24, height: "calc(100vh - 160px)", cursor: 'zoom-in' }}
                onClick={() => setLightboxOpen(true)}
            >
                <Image src={imgSrc} alt="Product Image" fill style={{ objectFit: "cover" }} />

                {/* Nút tiến/lùi — stopPropagation để không mở lightbox */}
                <button onClick={e => { e.stopPropagation(); prev(); }} style={arrowStyle("left")}
                    onMouseEnter={() => setHoveredArrow("left")} onMouseLeave={() => setHoveredArrow(null)}>‹</button>
                <button onClick={e => { e.stopPropagation(); next(); }} style={arrowStyle("right")}
                    onMouseEnter={() => setHoveredArrow("right")} onMouseLeave={() => setHoveredArrow(null)}>›</button>

                {/* Badge zoom gợi ý */}
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.35)', color: '#fff', fontSize: 11, padding: '4px 10px', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 5, pointerEvents: 'none' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M11 8v6M8 11h6" /></svg>
                    Nhấn để phóng to
                </div>

                {/* Dot indicators */}
                <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
                    {safeImages.map((_, i) => (
                        <div key={i} onClick={e => { e.stopPropagation(); setCurrentIndex(i); }} style={{
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


        </div >
    );
}