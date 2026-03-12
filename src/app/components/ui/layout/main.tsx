"use client";
import Image from "next/image";
import { use, useEffect, useState } from "react";
import feather from "feather-icons";
import { Search, ShoppingCart, User, Menu, X, ChevronRight } from 'lucide-react';
import { fetchCollections, Collection } from "@/app/api/collections";
import { Clothes } from "@/app/api/productsAPI";
import { supabase } from "@/app/libs/supabaseClient";

import Link from "next/link";
// const menProducts = [
//   {
//     id: 1,
//     name: 'Áo sơ mi linen nam',
//     price: '599.000đ',
//     image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=80',
//     description: 'Chất liệu linen tự nhiên, thoáng mát',
//     material: '100% Linen',
//     colors: ['Trắng kem', 'Be', 'Xanh nhạt']
//   },
//   {
//     id: 2,
//     name: 'Quần baggy cotton nam',
//     price: '799.000đ',
//     image: 'https://images.unsplash.com/photo-1542272454315-7ad9f8c92a4e?w=500&q=80',
//     description: 'Form rộng thoải mái, phong cách tối giản',
//     material: 'Cotton organic',
//     colors: ['Be', 'Nâu đất', 'Xám']
//   },
//   {
//     id: 3,
//     name: 'Áo len cổ tròn',
//     price: '1.299.000đ',
//     image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
//     description: 'Len mềm mại, giữ ấm tự nhiên',
//     material: 'Len merino',
//     colors: ['Nâu đất', 'Xanh rêu', 'Xám than']
//   },
//   {
//     id: 4,
//     name: 'Giày canvas nam',
//     price: '899.000đ',
//     image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80',
//     description: 'Nhẹ nhàng, bền vững, dễ phối đồ',
//     material: 'Canvas tự nhiên',
//     colors: ['Trắng kem', 'Be', 'Xám']
//   },
// ];

const womenProducts = [
  {
    id: 5,
    name: 'Váy linen midi',
    price: '1.499.000đ',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80',
    description: 'Thiết kế xòe nhẹ, thanh lịch và nữ tính',
    material: '100% Linen',
    colors: ['Trắng ngà', 'Hồng đất', 'Xanh olive']
  },
  {
    id: 6,
    name: 'Áo blouse tay bồng',
    price: '699.000đ',
    image: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=500&q=80',
    description: 'Nữ tính, nhẹ nhàng với chi tiết tay bồng',
    material: 'Cotton cao cấp',
    colors: ['Trắng', 'Be', 'Hồng nude']
  },
  {
    id: 7,
    name: 'Túi vải canvas',
    price: '999.000đ',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80',
    description: 'Thân thiện môi trường, tiện dụng hàng ngày',
    material: 'Canvas tái chế',
    colors: ['Be', 'Nâu', 'Xanh rêu']
  },
  {
    id: 8,
    name: 'Sandal đế xuồng',
    price: '1.199.000đ',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80',
    description: 'Thoải mái, nhẹ nhàng cho mùa hè',
    material: 'Da thuộc thực vật',
    colors: ['Nâu camel', 'Be', 'Đen']
  },
];
// const collections = [
//   {
//     id: 1,
//     name: 'Bộ sưu tập Xuân Hè 2024',
//     image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
//     tag: 'Mới',
//     description: 'Nhẹ nhàng như làn gió mùa hè, thoải mái như những ngày hè lười biếng'
//   },
//   {
//     id: 2,
//     name: 'Bộ sưu tập Thu Đông 2024',
//     image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
//     tag: 'Hot',
//     description: 'Ấm áp trong những ngày se lạnh, thanh lịch với tông màu đất'
//   },
//   {
//     id: 3,
//     name: 'Thời trang Công sở',
//     image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80',
//     tag: 'Sale',
//     description: 'Chuyên nghiệp nhưng vẫn thoải mái, thanh lịch trong từng chi tiết'
//   },
// ];

export default function Main() {

  const [collections, setCollections] = useState<Collection[]>([]);
  const [menProducts, setMenProducts] = useState<Clothes[]>([]);
  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
          id,
          title,
          image,
          description,
          material,
          price,
          variants (
            colors!variants_color_id_fkey (
              id,
              name,
              hex_code
            )
          )
        `);

        if (error) {
          console.log("Error:", error);
          return;
        }

        // 🔥 Format lại dữ liệu cho đúng cấu trúc bạn đang render
        const formatted = data?.map((product: any) => ({
          ...product,
          colors: [
            ...new Map(
              product.variants?.map((v: any) => [
                v.colors?.id,
                v.colors?.name
              ])
            ).values()
          ]
        }));

        setMenProducts(formatted ?? []);

      } catch (err) {
        console.error("Lỗi khi load products:", err);
      }
    }

    loadProducts();
  }, []);
  useEffect(() => {
    async function loadCollections() {
      try {
        const data = await fetchCollections();
        setCollections(data);
        console.log("Dữ liệu collections:", data);
      } catch (err) {
        console.error("Lỗi khi load collections:", err);
      }
    }
    loadCollections();
  }, [])
  return (
    <div>
      <main className="container mx-auto px-4 py-12">
        <section
          id="vanta-bg"
          className="relative rounded-3xl overflow-hidden mb-16"
        >
          <Image
            width={1200}
            height={630}
            src="https://cdn.brvn.vn/editor_news/2012/09/hinhanhdong5-ID367.gif"
            alt="Background GIF"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-opacity-40"></div>
          <div className="relative z-10 min-h-[500px] flex flex-col justify-center items-center text-center px-8 text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Tiệm Mùa Chậm
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mb-8">
              Một nơi “dừng lại giữa cuộc sống vội vàng”
            </p>
            <a
              href="/collections"
              className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-opacity-90 transition"
            >
              Shop Now
            </a>
          </div>
        </section>
        <section id="collections" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Bộ Sưu Tập Nổi Bật</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {collections.map((collection) => (
                <div key={collection.id} className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-80 object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                    <span className="text-yellow-400 text-sm font-semibold mb-2">{collection.tag}</span>
                    <h3 className="text-white text-2xl font-bold mb-2">{collection.name}</h3>
                    <p className="text-white/90 text-sm">{collection.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="men" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Thời Trang Nam</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Tối giản nhưng tinh tế, thoải mái nhưng lịch lãm. Bộ sưu tập dành cho những người đàn ông hiện đại,
                sống chậm và trân trọng từng khoảnh khắc.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {menProducts.map((product) => (
                <div key={product.id} className="group bg-white rounded-lg shadow hover:shadow-xl transition">
                  <div className="overflow-hidden rounded-t-lg relative">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-amber-700">
                      {product.material}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{product.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                    <div className="flex gap-2 mb-3">
                      {product.colors.map((color, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">{color}</span>
                      ))}
                    </div>
                    <p className="text-amber-700 font-bold text-lg mb-4">{product.price}</p>
                    <button
                      onClick={() => alert(`Đã thêm ${product.title} vào giỏ hàng!`)}
                      className="w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 transition"
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a
                href="/men"
                className="inline-flex items-center gap-2 bg-white border-2 border-amber-700 text-amber-700 px-8 py-3 rounded-full font-semibold hover:bg-amber-700 hover:text-white transition transform hover:scale-105 shadow-md"
              >
                Xem thêm sản phẩm
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>
        <section id="women" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Thời Trang Nữ</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Nữ tính và nhẹ nhàng, tự do và thoải mái. Mỗi thiết kế đều là lời tri ân đến vẻ đẹp tự nhiên
                và sự thanh thản của người phụ nữ hiện đại.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {womenProducts.map((product) => (
                <div key={product.id} className="group bg-white rounded-lg shadow hover:shadow-xl transition">
                  <div className="overflow-hidden rounded-t-lg relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-amber-700">
                      {product.material}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                    <div className="flex gap-2 mb-3">
                      {product.colors.map((color, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">{color}</span>
                      ))}
                    </div>
                    <p className="text-amber-700 font-bold text-lg mb-4">{product.price}</p>
                    <button
                      onClick={() => alert(`Đã thêm ${product.name} vào giỏ hàng!`)}
                      className="w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 transition"
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a
                href="#women-collection"
                className="inline-flex items-center gap-2 bg-white border-2 border-amber-700 text-amber-700 px-8 py-3 rounded-full font-semibold hover:bg-amber-700 hover:text-white transition transform hover:scale-105 shadow-md"
              >
                Xem thêm sản phẩm
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>
        <section className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-10 text-white mb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Cập nhật hàng ngày
            </h2>
            <p className="text-xl mb-8">
              Đăng ký nhận bản tin của chúng tôi để cập nhật những xu hướng mới nhất và ưu đãi độc quyền

            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-white flex-1 px-6 py-3 rounded-full text-gray-900 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-opacity-90 transition"
              >
                Đăng ký ngay
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
