"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronRight, ArrowRight, Leaf } from 'lucide-react';
import { fetchCollections, Collection } from "@/app/api/collections";
import { Clothes } from "@/app/api/productsAPI";
import { supabase } from "@/app/libs/supabaseClient";
import Link from "next/link";

export default function Main() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [menProducts, setMenProducts] = useState<Clothes[]>([]);
  const [womenProducts, setWomenProducts] = useState<Clothes[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`id,name,image_url,description,base_price,product_variants(id,color,size)`)
          .eq("gender_id", 2);
        if (!error) setWomenProducts(data?.map((p: any) => ({
          ...p,
          colors: [...new Map(p.variants?.map((v: any) => [v.colors?.id, v.colors?.name])).values()]
        })) ?? []);
      } catch (e) { console.error(e); }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`id,name,image_url,description,base_price,product_variants(id,color,size)`)
          .eq("gender_id", 1);
        if (!error) setMenProducts(data?.map((p: any) => ({
          ...p,
          colors: [...new Map(p.variants?.map((v: any) => [v.colors?.id, v.colors?.name])).values()]
        })) ?? []);
      } catch (e) { console.error(e); }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    async function loadCollections() {
      try {
        const data = await fetchCollections();
        setCollections(data);
      } catch (e) { console.error(e); }
    }
    loadCollections();
  }, []);

  const fmtPrice = (p: number) =>
    p ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p) : '';

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Be+Vietnam+Pro:wght@300;400;500;600&display=swap');

        :root {
          --w:   #FDFAF6;   /* warm white – nền tổng */
          --c:   #F3EDE3;   /* cream – nền section phụ */
          --li:  #E6DACE;   /* linen – border, divider */
          --sa:  #C9B99A;   /* sand – icon nhạt, placeholder */
          --cl:  #8C6D52;   /* clay – accent chính */
          --bk:  #5C3D28;   /* bark – text heading, button */
          --ea:  #2E1E12;   /* earth – text đậm, footer */
          --sg:  #7A8C70;   /* sage – accent xanh rêu */
        }

        *, *::before, *::after { box-sizing: border-box; }

        .f-display { font-family: 'Gowun Batang', serif; }
        .f-body    { font-family: 'Be Vietnam Pro', Lora, serif; }

        /* Smooth scroll */
        html { scroll-behavior: smooth; }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        .anim-up   { animation: fadeUp  0.7s cubic-bezier(.22,.68,0,1.2) both; }
        .anim-in   { animation: scaleIn 0.6s cubic-bezier(.22,.68,0,1.2) both; }
        .delay-1   { animation-delay: .1s; }
        .delay-2   { animation-delay: .2s; }
        .delay-3   { animation-delay: .3s; }
        .delay-4   { animation-delay: .4s; }

        /* ── Card ── */
        .card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--li);
          transition: transform .4s cubic-bezier(.25,.46,.45,.94), box-shadow .4s ease;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 48px rgba(92,61,40,.12);
        }
        .card .img-wrap {
          overflow: hidden;
          position: relative;
        }
        .card .img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .7s cubic-bezier(.25,.46,.45,.94);
        }
        .card:hover .img-wrap img { transform: scale(1.07); }

        /* Quick-add overlay */
        .quick-overlay {
          position: absolute; inset: 0;
          background: rgba(46,30,18,.18);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity .3s;
        }
        .card:hover .quick-overlay { opacity: 1; }

        /* ── Buttons ── */
        .btn-solid {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 11px 28px; border-radius: 8px;
          background: var(--bk); color: var(--w);
          font-family: 'Be Vietnam Pro', Lora, serif;
          font-size: 13px; font-weight: 500; letter-spacing: .5px;
          border: none; cursor: pointer;
          transition: background .25s, transform .2s;
        }
        .btn-solid:hover { background: var(--ea); transform: translateY(-1px); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 11px 28px; border-radius: 8px;
          background: transparent; color: var(--bk);
          font-family: 'Be Vietnam Pro', Lora, serif;
          font-size: 13px; font-weight: 500;
          border: 1.5px solid var(--li); cursor: pointer;
          transition: all .25s;
        }
        .btn-ghost:hover {
          background: var(--bk); color: var(--w);
          border-color: var(--bk); transform: translateY(-1px);
        }

        .btn-mini {
          padding: 7px 16px; border-radius: 6px; border: 1.5px solid var(--li);
          background: transparent; color: var(--cl);
          font-family: 'Be Vietnam Pro', Lora, serif;
          font-size: 11px; font-weight: 500; cursor: pointer;
          transition: all .2s;
        }
        .btn-mini:hover { background: var(--bk); color: white; border-color: var(--bk); }

        /* Quick-add btn inside overlay */
        .btn-quick {
          padding: 10px 22px; border-radius: 8px;
          background: var(--w); color: var(--ea);
          font-family: 'Be Vietnam Pro', Lora, serif;
          font-size: 12px; font-weight: 600; cursor: pointer;
          border: none; transition: background .2s;
        }
        .btn-quick:hover { background: var(--c); }

        /* ── Section label ── */
        .s-label {
          font-family: 'Be Vietnam Pro', Lora, serif;
          font-size: 10.5px; font-weight: 600;
          letter-spacing: 3px; text-transform: uppercase;
          color: var(--cl);
        }
        .s-divider {
          width: 36px; height: 1.5px;
          background: linear-gradient(90deg, var(--cl), var(--sa));
          border-radius: 2px; margin: 0 auto;
        }
        .s-heading {
          font-family: 'Gowun Batang', serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 400; color: var(--ea); line-height: 1.2;
        }
        .s-sub {
          font-family: 'Be Vietnam Pro', Lora, serif;
          font-size: 14px; color: #9a8878; line-height: 1.75;
          max-width: 480px; margin: 0 auto;
        }

        /* ── Product card text ── */
        .p-name {
          font-family: 'Gowun Batang', serif;
          font-size: 16px; color: var(--ea); line-height: 1.3;
        }
        .p-desc {
          font-family: 'Be Vietnam Pro', Lora, serif;
          font-size: 12.5px; color: #9a8878; line-height: 1.6;
        }
        .p-price {
          font-family: 'Gowun Batang', serif;
          font-size: 17px; color: var(--bk); font-weight: 700;
        }

        /* ── Collection card ── */
        .coll-card {
          border-radius: 18px; overflow: hidden; position: relative; cursor: pointer;
          transition: transform .4s cubic-bezier(.25,.46,.45,.94), box-shadow .4s ease;
        }
        .coll-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(46,30,18,.18); }
        .coll-card img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .7s cubic-bezier(.25,.46,.45,.94);
        }
        .coll-card:hover img { transform: scale(1.06); }

        /* ── Tag badge ── */
        .badge {
          display: inline-block;
          padding: 3px 10px; border-radius: 4px;
          font-family: 'Be Vietnam Pro', Lora, serif;
          font-size: 10px; font-weight: 600; letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* ── Color chip ── */
        .chip {
          display: inline-block;
          padding: 3px 9px; border-radius: 4px;
          font-family: 'Be Vietnam Pro', Lora, serif;
          font-size: 10.5px; color: var(--cl);
          background: var(--c); border: 1px solid var(--li);
        }

        /* ── Newsletter ── */
        .nl-input {
          flex: 1; padding: 12px 18px; border-radius: 8px;
          background: rgba(255,255,255,.1); border: 1.5px solid rgba(255,255,255,.2);
          color: white; font-family: 'Be Vietnam Pro', Lora, serif; font-size: 14px;
          outline: none; transition: border-color .3s;
        }
        .nl-input::placeholder { color: rgba(255,255,255,.4); }
        .nl-input:focus { border-color: rgba(255,255,255,.5); }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--c); }
        ::-webkit-scrollbar-thumb { background: var(--sa); border-radius: 3px; }
      `}</style>

      <div style={{ background: 'var(--w)' }} className="f-body">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ════════════════════════════════════════════════
              HERO
          ════════════════════════════════════════════════ */}
          <section className="relative rounded-3xl overflow-hidden mb-24 anim-in" style={{ minHeight: 600 }}>
            <Image
              width={1400} height={700}
              src="https://cdn.brvn.vn/editor_news/2012/09/hinhanhdong5-ID367.gif"
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover"
              priority
            />
            {/* Multi-stop overlay — warm left, clear right */}
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(120deg, rgba(46,30,18,.72) 0%, rgba(46,30,18,.38) 55%, rgba(46,30,18,.08) 100%)' }} />

            {/* Decorative bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32"
              style={{ background: 'linear-gradient(to top, rgba(46,30,18,.4), transparent)' }} />

            <div className="relative z-10 min-h-[600px] flex flex-col justify-between p-8 md:p-14 text-white">
              {/* Top row */}
              <div className="flex items-center justify-between">
                <span className="f-body text-[11px] tracking-[3px] uppercase opacity-60">
                  Slow Living · Natural Wear
                </span>
                <span className="badge" style={{ background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)' }}>
                  2024 Collection
                </span>
              </div>

              {/* Bottom content */}
              <div className="max-w-lg">
                <p className="f-body text-xs tracking-[4px] uppercase mb-4 opacity-70">Bộ Sưu Tập Mới</p>
                <h1 className="f-display mb-5 hero-text-shadow"
                  style={{ fontSize: 'clamp(44px,7vw,80px)', fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.5px' }}>
                  Tiệm<br />Mùa Chậm
                </h1>
                <p className="f-body mb-8 opacity-80"
                  style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.75, maxWidth: 340 }}>
                  Dừng lại giữa cuộc sống vội vàng — mặc thứ bạn thực sự yêu thích.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <a href="/collections"
                    className="btn-solid"
                    style={{ background: 'var(--w)', color: 'var(--ea)' }}>
                    Khám Phá Ngay <ArrowRight size={14} />
                  </a>
                  <a href="#collections"
                    className="btn-ghost"
                    style={{ color: 'white', borderColor: 'rgba(255,255,255,.4)' }}>
                    Bộ Sưu Tập
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════
              COLLECTIONS
          ════════════════════════════════════════════════ */}
          <section id="collections" className="mb-28">
            <div className="text-center mb-16">
              <p className="s-label mb-3">Curated</p>
              <div className="s-divider mb-5" />
              <h2 className="s-heading mb-4">Bộ Sưu Tập Nổi Bật</h2>
              <p className="s-sub">Mỗi bộ sưu tập là một câu chuyện riêng — được chọn lọc kỹ lưỡng về chất liệu, màu sắc và cảm xúc.</p>
            </div>

            {collections.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 anim-up">
                {/* Featured — large left */}
                <div className="md:col-span-7 coll-card" style={{ height: 520 }}>
                  <img src={collections[0].image} alt={collections[0].name} className="absolute inset-0" />
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(30,18,10,.78) 0%, transparent 55%)' }} />
                  {collections[0].tag && (
                    <div className="absolute top-5 left-5">
                      <span className="badge" style={{ background: 'var(--cl)', color: 'white' }}>{collections[0].tag}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-7">
                    <p className="f-display text-white mb-1" style={{ fontSize: 24, fontWeight: 400 }}>{collections[0].name}</p>
                    <p className="f-body text-sm mb-4" style={{ color: 'rgba(255,255,255,.7)', lineHeight: 1.6 }}>{collections[0].description}</p>
                    <a href="#" className="f-body text-xs tracking-[2px] uppercase flex items-center gap-2"
                      style={{ color: 'rgba(255,255,255,.6)' }}>
                      Xem bộ sưu tập <ChevronRight size={13} />
                    </a>
                  </div>
                </div>

                {/* Two stacked right */}
                <div className="md:col-span-5 flex flex-col gap-5">
                  {collections.slice(1, 3).map((col, i) => (
                    <div key={col.id} className="coll-card flex-1" style={{ height: 248 }}>
                      <img src={col.image} alt={col.name} className="absolute inset-0" />
                      <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(30,18,10,.72) 0%, transparent 50%)' }} />
                      {col.tag && (
                        <div className="absolute top-4 left-4">
                          <span className="badge" style={{ background: 'var(--cl)', color: 'white' }}>{col.tag}</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <p className="f-display text-white" style={{ fontSize: 18, fontWeight: 400 }}>{col.name}</p>
                        <a href="#" className="f-body text-xs tracking-[2px] uppercase flex items-center gap-1.5 mt-2"
                          style={{ color: 'rgba(255,255,255,.55)' }}>
                          Khám phá <ChevronRight size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ════════════════════════════════════════════════
              DIVIDER STRIP
          ════════════════════════════════════════════════ */}
          <div className="flex items-center gap-6 mb-28 px-4">
            <div className="flex-1 h-px" style={{ background: 'var(--li)' }} />
            <div className="flex items-center gap-2" style={{ color: 'var(--sa)' }}>
              <Leaf size={14} />
              <span className="f-body text-xs tracking-[3px] uppercase" style={{ color: 'var(--sa)' }}>Natural · Slow · Mindful</span>
              <Leaf size={14} />
            </div>
            <div className="flex-1 h-px" style={{ background: 'var(--li)' }} />
          </div>

          {/* ════════════════════════════════════════════════
              MEN
          ════════════════════════════════════════════════ */}
          <section id="men" className="mb-28">
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <p className="s-label mb-2">For Him</p>
                <h2 className="s-heading" style={{ textAlign: 'left', margin: 0 }}>Thời Trang Nam</h2>
              </div>
              <p className="s-sub" style={{ textAlign: 'right', margin: 0, maxWidth: 320 }}>
                Tối giản, tinh tế, thoải mái. Dành cho những người đàn ông sống chậm và trân trọng từng khoảnh khắc.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {menProducts.length >= 4 && menProducts.slice(0, 4).map((p, i) => (
                <div key={p.id} className={`card anim-up delay-${i + 1}`}>
                  <div className="img-wrap" style={{ height: 300 }}>
                    <img src={p.image_url} alt={p.name} />
                    {/* Material badge */}
                    <div className="absolute top-3 left-3">
                      <span className="badge" style={{ background: 'rgba(253,250,246,.92)', color: 'var(--bk)', backdropFilter: 'blur(4px)' }}>
                        {p.material}
                      </span>
                    </div>
                    <div className="quick-overlay">
                      <button className="btn-quick" onClick={() => alert(`Đã thêm ${p.name}`)}>
                        + Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="p-name mb-1">{p.name}</p>
                    <p className="p-desc mb-4 line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="p-price">{fmtPrice(p.base_price)}</p>
                      <button className="btn-mini" onClick={() => alert(`Đã thêm ${p.name}`)}>+ Giỏ hàng</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <a href="/men" className="btn-ghost">
                Xem tất cả sản phẩm nam <ArrowRight size={14} />
              </a>
            </div>
          </section>

          {/* ════════════════════════════════════════════════
              WOMEN
          ════════════════════════════════════════════════ */}
          <section id="women" className="mb-24">
            {/* Soft warm strip wrapper */}
            <div className="rounded-3xl px-6 py-16 md:px-12"
              style={{ background: 'linear-gradient(135deg, var(--c) 0%, #f9f4ed 100%)', border: '1px solid var(--li)' }}>

              <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
                <div>
                  <p className="s-label mb-2">For Her</p>
                  <h2 className="s-heading" style={{ textAlign: 'left', margin: 0 }}>Thời Trang Nữ</h2>
                </div>
                <p className="s-sub" style={{ textAlign: 'right', margin: 0, maxWidth: 320 }}>
                  Nữ tính, tự do, nhẹ nhàng. Lời tri ân đến vẻ đẹp tự nhiên của người phụ nữ hiện đại.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {womenProducts.length >= 4 && womenProducts.slice(0, 4).map((p, i) => (
                  <div key={p.id} className={`card anim-up delay-${i + 1}`}>
                    <div className="img-wrap" style={{ height: 300 }}>
                      <img src={p.image_url} alt={p.name} />
                      <div className="absolute top-3 left-3">
                        <span className="badge" style={{ background: 'rgba(253,250,246,.92)', color: 'var(--bk)', backdropFilter: 'blur(4px)' }}>
                          {p.material}
                        </span>
                      </div>
                      <div className="quick-overlay">
                        <button className="btn-quick" onClick={() => alert(`Đã thêm ${p.name}`)}>
                          + Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="p-name mb-1">{p.name}</p>
                      <p className="p-desc mb-3 line-clamp-2">{p.description}</p>
                      {p.colors?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {p.colors.slice(0, 3).map((c: string, idx: number) => (
                            <span key={idx} className="chip">{c}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="p-price">{fmtPrice(p.base_price)}</p>
                        <button className="btn-mini" onClick={() => alert(`Đã thêm ${p.name}`)}>+ Giỏ hàng</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <a href="/women" className="btn-ghost">
                  Xem tất cả sản phẩm nữ <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════
              NEWSLETTER
          ════════════════════════════════════════════════ */}
          <section className="rounded-3xl p-10 md:p-16 mb-10 relative overflow-hidden"
            style={{ background: 'var(--ea)' }}>
            {/* Glow blobs */}
            <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(140,109,82,.22) 0%, transparent 70%)' }} />
            <div className="absolute -bottom-10 left-10 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(122,140,112,.12) 0%, transparent 70%)' }} />

            <div className="max-w-xl mx-auto text-center relative z-10">
              <p className="s-label mb-3" style={{ color: 'var(--sa)' }}>Newsletter</p>
              <div className="s-divider mb-6" style={{ background: 'rgba(255,255,255,.15)' }} />
              <h2 className="f-display mb-4"
                style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 400, color: 'var(--w)', lineHeight: 1.2 }}>
                Cập Nhật Hàng Ngày
              </h2>
              <p className="f-body mb-8"
                style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.75 }}>
                Đăng ký để nhận xu hướng mới nhất và ưu đãi độc quyền từ Tiệm Mùa Chậm.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                onSubmit={e => e.preventDefault()}>
                <input type="email" placeholder="Email của bạn..." className="nl-input" />
                <button type="submit" className="btn-solid"
                  style={{ background: 'var(--cl)', borderColor: 'var(--cl)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Đăng Ký <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </section>

        </main>
      </div>
    </>
  );
}