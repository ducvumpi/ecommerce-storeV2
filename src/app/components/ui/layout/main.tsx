"use client";
import Image from "next/image";
import { useEffect } from "react";
import feather from "feather-icons";
import Link from "next/link";

export default function Main() {
  useEffect(() => {
    feather.replace();
  }, []);
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
        <section id="collections" className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Bộ Sưu Tập Mới

          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition">
              <Image
                width={1200}
                height={630}
                src="http://static.photos/fashion/1200x630/1"
                alt="Summer Collection"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-10 group-hover:translate-y-0 transition-transform">
                <h3 className="text-white text-2xl font-bold mb-2">
                  Summer Vibes
                </h3>
                <p className="text-gray-200 mb-4">
                  Bright colors for sunny days
                </p>
                <Link
                  href="/collections"
                  className="text-white font-medium flex items-center gap-2"
                >
                  Explore <i data-feather="arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition">
              <Image
                width={1200}
                height={630}
                src="http://static.photos/fashion/1200x630/2"
                alt="Winter Collection"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-10 group-hover:translate-y-0 transition-transform">
                <h3 className="text-white text-2xl font-bold mb-2">
                  Winter Magic
                </h3>
                <p className="text-gray-200 mb-4">Cozy styles for cold days</p>
                <a
                  href="#"
                  className="text-white font-medium flex items-center gap-2"
                >
                  Explore <i data-feather="arrow-right"></i>
                </a>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition">
              <Image
                width={1200}
                height={630}
                src="http://static.photos/fashion/1200x630/3"
                alt="Casual Collection"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-10 group-hover:translate-y-0 transition-transform">
                <h3 className="text-white text-2xl font-bold mb-2">
                  Everyday Casual
                </h3>
                <p className="text-gray-200 mb-4">Comfort meets style</p>
                <a
                  href="#"
                  className="text-white font-medium flex items-center gap-2"
                >
                  Explore <i data-feather="arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Mua Sắm Theo Danh Mục

          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <a href="#" className="group">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
                <Image
                  width={1200}
                  height={630}
                  src="http://static.photos/fashion/640x360/4"
                  alt="Men's Fashion"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="mt-4 text-lg font-medium text-center">Mens</h3>
            </a>
            <a href="#" className="group">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
                <Image
                  width={1200}
                  height={630}
                  src="http://static.photos/fashion/640x360/5"
                  alt="Women's Fashion"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="mt-4 text-lg font-medium text-center">Womens</h3>
            </a>
            <a href="#" className="group">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
                <Image
                  width={1200}
                  height={630}
                  src="http://static.photos/fashion/640x360/6"
                  alt="Accessories"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="mt-4 text-lg font-medium text-center">
                Accessories
              </h3>
            </a>
            <a href="#" className="group">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
                <Image
                  width={1200}
                  height={630}
                  src="http://static.photos/fashion/640x360/7"
                  alt="Footwear"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="mt-4 text-lg font-medium text-center">Footwear</h3>
            </a>
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
