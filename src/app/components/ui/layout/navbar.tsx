"use client";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, User, LogOut, Settings, ShoppingCart, ChevronDown, Menu, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/app/libs/supabaseClient";
import { useAuth } from "@/app/AuthProvider";
import { useState, useRef, useEffect } from "react";

const NAV_LINKS = [
  ["Trang chủ", "/"],
  ["Bộ sưu tập", "/collections"],
  ["Thời trang nam", "/men"],
  ["Thời trang nữ", "/women"],
  ["Giới thiệu", "/about"],
] as const;

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Khoá scroll body khi mobile menu mở
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Đóng mobile menu khi đổi route
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function fetchCartCount() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        try {
          const guest = JSON.parse(localStorage.getItem("guest_cart") || "[]");
          const total = guest.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
          setCartCount(total);
        } catch { setCartCount(0); }
        return;
      }

      const { data: cartData } = await supabase
        .from("cart").select("id").eq("user_id", currentUser.id).single();
      if (!cartData) return;

      // Load lần đầu
      const { data } = await supabase
        .from("cart_items").select("quantity").eq("cart_id", cartData.id);
      if (data) {
        const total = data.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(total);
      }

      // ✅ Realtime: lắng nghe thay đổi cart_items
      const channel = supabase
        .channel(`cart_items_${cartData.id}`)
        .on(
          "postgres_changes",
          {
            event: "*", // INSERT, UPDATE, DELETE
            schema: "public",
            table: "cart_items",
            filter: `cart_id=eq.${cartData.id}`,
          },
          async () => {
            // Re-fetch khi có thay đổi
            const { data: updated } = await supabase
              .from("cart_items").select("quantity").eq("cart_id", cartData.id);
            if (updated) {
              const total = updated.reduce((sum, item) => sum + (item.quantity || 1), 0);
              setCartCount(total);
            }
          }
        )
        .subscribe();

      // Cleanup khi unmount
      return () => { supabase.removeChannel(channel); };
    }

    fetchCartCount();
  }, [user]);
  const handleLogOut = async () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    await supabase.auth.signOut();
    router.push("/collections");
  };

  const firstName = user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Người dùng";
  const lastName = user?.user_metadata?.last_name || "";
  const role = user?.user_metadata?.role || "Thành viên";
  const avatar = user?.user_metadata?.avatar_url || "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

      `}</style>

      <nav className="navbar-root">
        <div className="navbar-container">
          <div className="navbar-inner">

            {/* Logo */}
            <Link href="/" className="navbar-logo">
              <Image src="/logo.png" alt="Tiệm Mùa Chậm" width={110} height={38}
                style={{ objectFit: "contain", display: "block" }} priority />
            </Link>

            {/* Desktop nav links */}
            <div className="nav-links">
              {NAV_LINKS.map(([label, href]) => (
                <Link key={href} href={href} className={`nav-link${pathname === href ? " active" : ""}`}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Icon buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Link href="/search" className="icon-btn" title="Tìm kiếm">
                <Search size={17} strokeWidth={1.6} />
              </Link>
              <Link href="/cart" className="icon-btn cart-badge-wrap" title="Giỏ hàng">
                <ShoppingBag size={17} strokeWidth={1.6} />
                {cartCount > 0 && (
                  <span className="cart-badge">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>

            <div className="nav-sep" />

            {/* Auth area */}
            {!user ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Link href="/auth/login" className="btn-login">Đăng nhập</Link>
                  <Link href="/auth/register" className="btn-register">Đăng ký</Link>
                </div>
                <button className="icon-btn hamburger-btn" onClick={() => setMobileOpen(true)} aria-label="Mở menu">
                  <Menu size={20} strokeWidth={1.6} />
                </button>
              </>
            ) : (
              <>
                {/* Desktop dropdown */}
                <div ref={dropdownRef} className="dropdown-wrap" style={{ display: "flex", alignItems: "center" }}>
                  <button className={`user-trigger${dropdownOpen ? " open" : ""}`} onClick={() => setDropdownOpen(v => !v)}>
                    <div className="user-avatar-wrap">
                      {avatar
                        ? <img src={avatar} alt={firstName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <User size={15} strokeWidth={1.6} color="#8b5e3c" />
                      }
                    </div>
                    <span className="user-name">{firstName}</span>
                    <ChevronDown size={14} strokeWidth={2} className={`chevron${dropdownOpen ? " open" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="dropdown-panel">
                      <div className="dd-header">
                        <div className="dd-header-avatar">
                          {avatar
                            ? <img src={avatar} alt={firstName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <User size={18} strokeWidth={1.5} color="#8b5e3c" />
                          }
                        </div>
                        <div>
                          <div className="dd-header-name">{firstName} {lastName}</div>
                          <div className="dd-header-role">{role}</div>
                        </div>
                      </div>
                      <div className="dd-body">
                        <Link href="/info" className="dd-item" onClick={() => setDropdownOpen(false)}>
                          <User size={14} strokeWidth={1.6} className="dd-icon" />Trang cá nhân
                        </Link>
                        <Link href="/orders" className="dd-item" onClick={() => setDropdownOpen(false)}>
                          <ShoppingCart size={14} strokeWidth={1.6} className="dd-icon" />Đơn mua
                        </Link>
                        {/* <Link href="/settings" className="dd-item" onClick={() => setDropdownOpen(false)}>
                          <Settings size={14} strokeWidth={1.6} className="dd-icon" />Cài đặt
                        </Link> */}
                        <div className="dd-sep" />
                        <button className="dd-item danger" onClick={handleLogOut}>
                          <LogOut size={14} strokeWidth={1.6} className="dd-icon" />Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hamburger (mobile only) */}
                <button className="icon-btn hamburger-btn" onClick={() => setMobileOpen(true)} aria-label="Mở menu" style={{ marginLeft: 4 }}>
                  <Menu size={20} strokeWidth={1.6} />
                </button>
              </>
            )}
          </div>
        </div>

      </nav>

      {/* ── Mobile Overlay ── */}
      <div className={`mobile-overlay${mobileOpen ? " open" : ""}`} onClick={() => setMobileOpen(false)} />

      {/* ── Mobile Drawer ── */}
      <div className={`mobile-drawer${mobileOpen ? " open" : ""}`}>

        <div className="drawer-header">
          <Image src="/logo.png" alt="Tiệm Mùa Chậm" width={90} height={32} style={{ objectFit: "contain" }} />
          <button className="drawer-close" onClick={() => setMobileOpen(false)} aria-label="Đóng menu">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {user && (
          <div className="drawer-user">
            <div className="drawer-user-avatar">
              {avatar
                ? <img src={avatar} alt={firstName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <User size={20} strokeWidth={1.5} color="#8b5e3c" />
              }
            </div>
            <div>
              <div className="drawer-user-name">{firstName} {lastName}</div>
              <div className="drawer-user-role">{role}</div>
            </div>
          </div>
        )}

        <nav className="drawer-nav">
          <div className="drawer-nav-label">Danh mục</div>
          {NAV_LINKS.map(([label, href]) => (
            <Link key={href} href={href}
              className={`drawer-link${pathname === href ? " active" : ""}`}
              onClick={() => setMobileOpen(false)}>
              <span className="drawer-link-dot" />
              {label}
            </Link>
          ))}
        </nav>

        {user ? (
          <>
            <div className="drawer-sep" />
            <div className="drawer-actions">
              <div className="drawer-nav-label">Tài khoản</div>
              <Link href="/info" className="drawer-action" onClick={() => setMobileOpen(false)}>
                <User size={15} strokeWidth={1.6} className="drawer-action-icon" />Trang cá nhân
              </Link>
              <Link href="/orders" className="drawer-action" onClick={() => setMobileOpen(false)}>
                <ShoppingCart size={15} strokeWidth={1.6} className="drawer-action-icon" />Đơn mua
              </Link>
              <Link href="/settings" className="drawer-action" onClick={() => setMobileOpen(false)}>
                <Settings size={15} strokeWidth={1.6} className="drawer-action-icon" />Cài đặt
              </Link>
              <div className="drawer-sep" />
              <button className="drawer-action danger" onClick={handleLogOut}>
                <LogOut size={15} strokeWidth={1.6} className="drawer-action-icon" />Đăng xuất
              </button>
            </div>
          </>
        ) : (
          <div className="drawer-auth">
            <Link href="/auth/login" className="drawer-btn-login" onClick={() => setMobileOpen(false)}>Đăng nhập</Link>
            <Link href="/auth/register" className="drawer-btn-register" onClick={() => setMobileOpen(false)}>Đăng ký</Link>
          </div>
        )}
      </div>
    </>
  );
}