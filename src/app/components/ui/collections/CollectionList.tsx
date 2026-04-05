"use client";
import Image from "next/image";
import { Collection } from "../../../api/collections";
import Link from "next/link";
import { useRouter } from "next/navigation";
function formatImageUrl(url: string) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
}

export default function CollectionList({ LoadCollections }: { LoadCollections: Collection[] }) {
    const router = useRouter();

    return (
        <div style={{ background: "#faf8f5", minHeight: "100vh", fontFamily: "var(--font-sans, Lora, serif)" }}>
            <main style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <h1 style={{ fontFamily: "'Lora', serif", fontSize: 28, color: "#3d2b1a", margin: "0 0 10px", fontWeight: 500 }}>
                        <button
                            className="back-btn"
                            onClick={() => router.back()}
                            style={{
                                width: 38, height: 38, borderRadius: 10,
                                border: '1.5px solid #e2d9ce', background: '#ffffff',
                                alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: '#a07050', flexShrink: 0,
                                transition: 'all .2s', boxShadow: '0 1px 4px rgba(140,100,60,.08)'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f3ede6'; e.currentTarget.style.borderColor = '#c4956a'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2d9ce'; }}
                            title="Quay lại"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button> Bộ sưu tập
                    </h1>
                    <p style={{ fontSize: 14, color: "#b0997e", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
                        Khám phá những bộ sưu tập thời trang được tuyển chọn kỹ lưỡng cho mọi mùa và mọi dịp
                    </p>
                </div>

                {/* Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, marginBottom: 56 }}>
                    {LoadCollections.map((collection) => (
                        <div key={collection.id} style={{ borderRadius: 16, overflow: "hidden", border: "0.5px solid #e8ddd0", background: "#fff", position: "relative" }}
                            onMouseEnter={e => (e.currentTarget.querySelector("img") as HTMLImageElement).style.transform = "scale(1.05)"}
                            onMouseLeave={e => (e.currentTarget.querySelector("img") as HTMLImageElement).style.transform = "scale(1)"}
                        >
                            <div style={{ position: "relative", height: 300, overflow: "hidden" }}>
                                <Link href={`/collections/${collection.id}`}>
                                    <Image
                                        src={formatImageUrl(collection.image)}
                                        alt={collection.name}
                                        width={600} height={300} unoptimized
                                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", display: "block" }}
                                    />
                                </Link>

                                {/* Overlay */}
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(40,20,5,.72) 0%, rgba(40,20,5,.1) 55%, transparent 100%)" }} />

                                {/* Content */}
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, color: "#fff" }}>
                                    <h3 style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 500, margin: "0 0 6px" }}>
                                        {collection.name}
                                    </h3>
                                    <p style={{
                                        fontSize: 12, color: "rgba(255,255,255,.78)", margin: "0 0 14px", lineHeight: 1.5,
                                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                                    }}>
                                        {collection.description}
                                    </p>
                                    <a href={`/collections/${collection.id}`}
                                        style={{ display: "inline-block", background: "rgba(255,255,255,.95)", color: "#3d2b1a", fontSize: 12, fontWeight: 500, padding: "7px 18px", borderRadius: 50, textDecoration: "none" }}>
                                        Xem chi tiết
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ textAlign: "center", borderTop: "0.5px solid #e8ddd0", paddingTop: 48 }}>
                    <h2 style={{ fontFamily: "'Lora', serif", fontSize: 20, color: "#3d2b1a", margin: "0 0 8px", fontWeight: 500 }}>
                        Không tìm thấy bộ sưu tập bạn đang tìm kiếm?
                    </h2>
                    <p style={{ fontSize: 13, color: "#b0997e", margin: "0 0 20px" }}>
                        Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn
                    </p>
                    <a href="/contact" style={{ display: "inline-block", background: "#8b5e3c", color: "#fff", fontSize: 13, fontWeight: 500, padding: "11px 28px", borderRadius: 50, textDecoration: "none" }}>
                        Liên hệ với chúng tôi
                    </a>
                </div>
            </main>
        </div>
    );
}