"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Handbag,
  HomeIcon,
  InfoIcon,
  StoreIcon,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/libs/supabaseClient";
import { useEffect, useState } from "react";
import UserAccount from "@/app/account/page";
import { useAuth } from "@/app/AuthProvider";

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    router.push("/collections");
  };
  return (
    <nav>
      <Image width={150} height={200} src="/logo.png" alt="logo" />

      <div className="nav-links">
        <Link href="/">
          <HomeIcon className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          Trang chủ
        </Link>

        <Link href="/collections">
          <StoreIcon className="w-5 h-5 text-gray-600" />
          Bộ sưu tập
        </Link>

        <Link href="/men">
          <Handbag className="w-5 h-5 text-gray-600" />
          Thời trang Nam
        </Link>

        <Link href="/women">
          <Handbag className="w-5 h-5 text-gray-600" />
          Thời trang Nữ
        </Link>

        <Link href="/about">
          <InfoIcon className="w-5 h-5 text-gray-600" />
          Giới thiệu
        </Link>

        <Link href="/search">
          <Search className="w-5 h-5 text-gray-600" />
        </Link>

        <Link href="/cart">
          <ShoppingBag className="w-5 h-5 text-gray-600" />
        </Link>

        <Link href="/account">
          <ShoppingBag className="w-5 h-5 text-gray-600" />
        </Link>

        <Link href="/admintest">
          <ShoppingBag className="w-5 h-5 text-gray-600" />
        </Link>
      </div>

      {!user ? (
        <div className="nav-actions">
          <div className="auth-buttons">
            <Link href="/auth/login" className="auth-btn login-btn">
              Đăng nhập
            </Link>
            <Link href="/auth/register" className="auth-btn signup-btn">
              Đăng ký
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-gap">
            <UserAccount />
            <button className="mobile-menu-btn">
              <i data-feather="menu"></i>
            </button>
          </div>

          <button
            onClick={handleLogOut}
            className="bg-red-500 cursor-pointer text-white px-3 py-1 rounded"
          >
            Đăng xuất
          </button>
        </>
      )}
    </nav>
  );
}