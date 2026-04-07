/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0', // ✅ tắt cache toàn bộ route
          },
        ],
      },
    ];
  },
  images: {
    domains: [
      "i.imgur.com",
      "pravatar.cc",
      "static.photos",
      "placeimg.com",
      "cdn.brvn.vn",
      "placehold.co",
      "www.string.com",
      "agb9whbfcr.ucarecd.net",
      "web-store-red.vercel.app",
      "tiem-mua-cham-store.vercel.app",
      "www.arkema.com",
      'images.unsplash.com',
      'encrypted-tbn0.gstatic.com',
      'cdn.brvn.vn',
      'image.made-in-china.com',
      'file.hstatic.nets',
      'file.hstatic.net',
      'picsum.photos',
      "pwezkmvuiuxvssaglkse.supabase.co",
    ],
    // protocol: "https",
    // pathname: "/storage/v1/object/public/**",
  },
};

module.exports = nextConfig;




