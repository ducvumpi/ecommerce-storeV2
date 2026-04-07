export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../app/components/ui/layout/footer";
import Navbar from "../app/components/ui/layout/navbar";
import { Toaster } from "react-hot-toast";
import ChatAI from "./chatbox/chatbox";
import { AuthProvider } from "./AuthProvider";

import { Be_Vietnam_Pro } from 'next/font/google';

const beVietnam = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap', // 👈 tránh FOIT
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tiệm Mùa Chậm - Thời trang cho mọi người",
  description: "Thời trang bền vững cho mọi người",
  icons: {
    icon: "./logo.png", // file trong public
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={beVietnam.className}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Navbar />
          <div className="overlay"></div>
          {children}
          <ChatAI />
          <Footer />
          <Toaster position="top-right" reverseOrder={false} />
        </AuthProvider>

      </body>
    </html>
  );
}
